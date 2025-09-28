export const runtime = "nodejs";

import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.js";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.js";
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

import { HfInference } from "@huggingface/inference";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.js";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import {
  createUIMessageStream,
  createUIMessageStreamResponse,
  smoothStream,
  streamText,
} from "ai";
import { NextRequest } from "next/server";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import path from "path";
import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { google } from "@ai-sdk/google";

// Hugging Face client
const hf = new HfInference(process.env.HUGGINGFACE_API_KEY!);

// ----------------- PDF Extractor -----------------
async function extractTextFromPDF(buffer: Buffer) {
  const uint8Array = new Uint8Array(buffer);
  const pdf = await getDocument({
    data: uint8Array,
    standardFontDataUrl: path.join(
      process.cwd(),
      "node_modules/pdfjs-dist/standard_fonts",
    ),
  }).promise;

  let fullText = "";
  const maxPages = Math.min(pdf.numPages, 100);
  for (let i = 1; i <= maxPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item: any) => item.str || "")
      .join(" ")
      .replace(/\s+/g, " ");
    fullText += pageText + "\n";
  }
  return fullText;
}

// ----------------- Zod Schemas -----------------
const uploadSchema = z.object({
  message: z.string(),
  chatId: z.string().optional(),
  fileIds: z.array(z.string()).optional(),
});

const querySchema = z.object({
  prompt: z.string(),
  chatId: z.string().optional(),
  pdfIds: z.array(z.number()),
});

// ----------------- POST Route -----------------
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return new Response("Unauthorized", { status: 401 });

    const body = await req.json();
    const isQuery =
      typeof body.prompt === "string" && Array.isArray(body.pdfIds);

    // ----------------- QUERY / RAG -----------------
    if (isQuery) {
      const { prompt, chatId, pdfIds } = querySchema.parse(body);
      let currentChatId = chatId;

      if (!currentChatId) {
        const chat = await db.chat.create({
          data: { userId: session.user.id, title: prompt.slice(0, 50) },
        });
        currentChatId = chat.id;
      }

      // 1️⃣ Generate embedding for user prompt
      const embeddingResponse = await hf.featureExtraction({
        model: "sentence-transformers/all-MiniLM-L6-v2",
        inputs: prompt,
      });
      const queryEmbedding: number[] = Array.isArray(embeddingResponse[0])
        ? (embeddingResponse as number[][])[0]
        : (embeddingResponse as number[]);

      // 2️⃣ Fetch chunks with Pdf.fileId
      const allChunks = await db.chunk.findMany({
        where: { pdfId: { in: pdfIds } },
        select: {
          id: true,
          text: true,
          embedding: true,
          pdfId: true,
          page: true,
          pdf: { select: { fileId: true } },
        },
      });
      if (allChunks.length === 0) {
        return createUIMessageStreamResponse({
          stream: createUIMessageStream({
            execute: async ({ writer }) => {
              writer.append(
                "I don't have enough information to answer that based on the provided PDFs.",
              );
            },
          }),
        });
      }

      function cosineSimilarity(a: number[], b: number[]) {
        if (
          !a ||
          !b ||
          a.length === 0 ||
          b.length === 0 ||
          a.length !== b.length
        ) {
          console.error("Invalid embedding vectors for cosine similarity");
          return 0;
        }
        const dot = a.reduce((sum, ai, i) => sum + ai * b[i], 0);
        const normA = Math.sqrt(a.reduce((sum, ai) => sum + ai * ai, 0));
        const normB = Math.sqrt(b.reduce((sum, bi) => sum + bi * bi, 0));
        return dot / (normA * normB + 1e-12);
      }

      const scoredChunks = allChunks
        .map((c) => {
          // Check if the embedding is valid before proceeding
          if (
            !c.embedding ||
            !Array.isArray(c.embedding) ||
            c.embedding.length === 0
          ) {
            console.warn(`Skipping chunk ${c.id} due to invalid embedding.`);
            return { ...c, score: 0 };
          }
          return {
            ...c,
            score: cosineSimilarity(queryEmbedding, c.embedding),
          };
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);

      // Log the top 5 chunks for debugging
      console.log("Top 5 Scored Chunks:", scoredChunks);

      // 4️⃣ Safe text helper
      const safeText = (s: string, max = 1200) =>
        s
          .replace(/\s+/g, " ")
          .replace(/"/g, '\\"')
          .replace(/</g, "&lt;")
          .slice(0, max);

      const contextText = scoredChunks
        .map(
          (c, idx) =>
            `<citation source-id="${idx + 1}" file-page-number="${c.page}" file-id="${c.pdf.fileId}" cited-text="${safeText(c.text)}">[${idx + 1}]</citation>`,
        )
        .join("\n\n");

      // 5️⃣ System prompt
      const systemPrompt = `
## CITATION RULES (STRICTLY APPLY):
- Source-Citations:
  <citation source-id="[ID]" file-page-number="[Page Number]" file-id="[File ID]" cited-text="[Exact Text]">[ID]</citation>
- Always apply all three citation attributes simultaneously.
- Example: <citation source-id="1" file-page-number="1" file-id="e5232b9a" cited-text="[Exact Text]">[1]</citation>

## MANDATORY ANALYSIS CRITERIA:
- Only use the provided context.
- Include chat history.
- If no relevant context, respond "I don't know."
`;

      // 6️⃣ Stream LLM response
      const stream = createUIMessageStream({
        execute: async ({ writer }) => {
          // Filter out chunks with missing PDF or fileId before creating contextText
          const validChunks = scoredChunks.filter((c) => c.pdf?.fileId);

          // Check again to make sure there are chunks to use as context
          if (validChunks.length === 0) {
            writer.append(
              "I don't have enough information to answer that based on the provided PDFs.",
            );
            return;
          }

          const contextText = validChunks
            .map(
              (c, idx) =>
                `<citation source-id="${idx + 1}" file-page-number="${c.page}" file-id="${c.pdf!.fileId}" cited-text="${safeText(c.text)}">[${idx + 1}]</citation>`,
            )
            .join("\n\n");

          const model = google("models/gemini-2.5-flash");
          const result = streamText({
            model,
            messages: [
              {
                role: "system",
                content: `${systemPrompt}\n\nContext:\n${contextText}`,
              },
              { role: "user", content: prompt },
            ],
            temperature: 0.7,
            experimental_transform: smoothStream(),
          });

          writer.merge(result.toUIMessageStream());
          const fullText = await result.text;

          // 7️⃣ Save assistant message + correct messageSources
          if (fullText) {
            await db.message.create({
              data: {
                chatId: currentChatId,
                role: "ASSISTANT",
                content: fullText,
                messageSources: {
                  createMany: {
                    data: validChunks.map((c) => ({ fileId: c.pdf!.fileId })),
                  },
                },
              },
            });
          }
        },
      });
      return createUIMessageStreamResponse({ stream });
    }

    // ----------------- PDF UPLOAD -----------------
    const { message, chatId, fileIds } = uploadSchema.parse(body);
    let currentChatId = chatId;

    if (!currentChatId) {
      const chat = await db.chat.create({
        data: { userId: session.user.id, title: message.slice(0, 50) },
      });
      currentChatId = chat.id;
    }

    const dbFiles = await db.file.findMany({
      where: { id: { in: fileIds }, userId: session.user.id },
    });
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );
    const processedFiles: any[] = [];

    for (const file of dbFiles) {
      const { data, error } = await supabaseAdmin.storage
        .from("files")
        .download(file.supabasePath);
      if (error || !data) continue;

      const buffer = Buffer.from(await data.arrayBuffer());
      const extractedText = await extractTextFromPDF(buffer);
      if (!extractedText) continue;

      const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
      });
      const chunks = await splitter.splitText(extractedText);

      const pdfRecord = await db.pdf.create({
        data: { name: file.name, filePath: file.supabasePath, fileId: file.id },
      });

      for (let i = 0; i < chunks.length; i++) {
        const chunkText = chunks[i];
        const embeddingResponse = await hf.featureExtraction({
          model: "sentence-transformers/all-MiniLM-L6-v2",
          inputs: chunkText,
        });
        const embedding: number[] = Array.isArray(embeddingResponse[0])
          ? (embeddingResponse as number[][])[0]
          : (embeddingResponse as number[]);

        await db.chunk.create({
          data: {
            pdfId: pdfRecord.id,
            page: i + 1,
            text: chunkText,
            embedding,
          },
        });
      }

      processedFiles.push(file);
    }

    await db.message.create({
      data: {
        chatId: currentChatId,
        role: "USER",
        content: message,
        messageFiles: {
          createMany: { data: processedFiles.map((f) => ({ fileId: f.id })) },
        },
      },
    });

    return new Response(JSON.stringify({ status: "Files processed" }), {
      status: 200,
    });
  } catch (error) {
    console.error(
      "Chat API error:",
      error instanceof Error ? error.stack : error,
    );
    return new Response("Internal Server Error", { status: 500 });
  }
}
