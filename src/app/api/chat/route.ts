export const runtime = "nodejs";

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

// Initialize Hugging Face client
const hf = new HfInference(process.env.HUGGINGFACE_API_KEY!);

// ------------------ PDF Extractor ------------------
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

// ------------------ Zod Schema ------------------
const requestSchema = z.object({
  message: z.string(),
  chatId: z.string().optional(),
  fileIds: z.array(z.string()).optional(),
});

// ------------------ POST Route ------------------
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return new Response("Unauthorized", { status: 401 });

    const body = await req.json();
    const { message, chatId, fileIds } = requestSchema.parse(body);

    let currentChatId = chatId;

    // Create new chat if necessary
    if (!currentChatId) {
      const chat = await db.chat.create({
        data: {
          userId: session.user.id,
          title: message.slice(0, 50) + (message.length > 50 ? "..." : ""),
        },
      });
      currentChatId = chat.id;
    }

    // Fetch files from DB
    const dbFiles = await db.file.findMany({
      where: { id: { in: fileIds }, userId: session.user.id },
    });

    // Supabase client
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

      // Split into chunks
      const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
      });
      const chunks = await splitter.splitText(extractedText);

      // Create PDF record
      const pdfRecord = await db.pdf.create({
        data: {
          name: file.name,
          filePath: file.supabasePath,
          fileId: file.id,
        },
      });

      // Create embeddings and save chunks
      for (let i = 0; i < chunks.length; i++) {
        const chunkText = chunks[i];

        const embeddingResponse = await hf.featureExtraction({
          model: "sentence-transformers/all-MiniLM-L6-v2",
          inputs: chunkText,
        });

        // Convert HF output to plain number[]
        let embedding: number[] = [];
        if (Array.isArray(embeddingResponse)) {
          if (Array.isArray(embeddingResponse[0])) {
            embedding = (embeddingResponse as number[][])[0];
          } else {
            embedding = embeddingResponse as number[];
          }
        }

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

    // Create user message
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

    // Stream AI response
    const stream = createUIMessageStream({
      execute: async ({ writer }) => {
        const model = google("models/gemini-2.5-flash");

        const result = streamText({
          model,
          messages: [{ role: "system", content: message }],
          temperature: 0.7,
          experimental_transform: smoothStream(),
        });

        writer.merge(result.toUIMessageStream());
        const fullText = await result.text;

        if (fullText) {
          await db.message.create({
            data: {
              chatId: currentChatId,
              role: "ASSISTANT",
              content: fullText,
              messageSources: {
                createMany: {
                  data: processedFiles.map((f) => ({ fileId: f.id })),
                },
              },
            },
          });
        }
      },
    });

    return createUIMessageStreamResponse({ stream });
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
