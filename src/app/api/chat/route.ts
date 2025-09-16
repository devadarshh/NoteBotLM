import { google } from "@ai-sdk/google";
import {
  createUIMessageStream,
  createUIMessageStreamResponse,
  smoothStream,
  streamText,
} from "ai";
import { NextRequest } from "next/server";
import { z } from "zod";

import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { env } from "@/env";
import { supabase } from "@/lib/supabase";

const PROMPT = `
### IMPERATIVE:  
Analyze the following QUESTION with absolute precision. Your analysis must meet the highest standards of Research.  

## CITATION RULES (STRICTLY APPLY):  
- Source-Citations:  
  <citation source-id="[ID]" file-page-number="[Page Number]" file-id="[File ID]" cited-text="[Exact Text]">[ID]</citation>  
- Always apply all three citation types simultaneously for every reference to a legal source, statutory provision, or company name.  
- Example citation: <citation source-id="1" file-page-number="1" file-id="e5232b9a" cited-text="[Exact Text]">[1]</citation>  
## MANDATORY ANALYSIS CRITERIA:  
- Exclusively rely on the provided files  
- Fully account for the chat history to ensure contextual continuity  

If the facts are complete and the sources sufficient, answer the question without reservations or disclaimers.  
`;

const requestSchema = z.object({
  message: z.string(),
  chatId: z.string().optional(),
  fileIds: z.array(z.string()).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return new Response("Unauthorized", { status: 401 });
    }

    const body = (await req.json()) as unknown;

    console.log("abhijeet body", body);
    const { message, chatId, fileIds } = requestSchema.parse(body);

    let currentChatId = chatId;
    let messageHistory: Array<{ role: "user" | "assistant"; content: string }> =
      [];

    // If chatId exists, load message history from database
    if (currentChatId) {
      const existingMessages = await db.message.findMany({
        where: { chatId: currentChatId },
        orderBy: { createdAt: "asc" },
        select: { role: true, content: true },
      });

      messageHistory = existingMessages.map((msg) => ({
        role: msg.role === "USER" ? ("user" as const) : ("assistant" as const),
        content: msg.content,
      }));
    } else {
      // Create new chat for first message
      const chat = await db.chat.create({
        data: {
          userId: session.user.id,
          title: message.slice(0, 50) + (message.length > 50 ? "..." : ""),
        },
      });
      currentChatId = chat.id;
    }
    // Save user message to database
    await db.message.create({
      data: {
        chatId: currentChatId,
        role: "USER",
        content: message,
        messageFiles: {
          createMany: {
            data:
              fileIds?.map((fileId) => ({
                fileId,
              })) ?? [],
          },
        },
      },
    });
    const dbFiles = await db.file.findMany({
      where: { id: { in: fileIds }, userId: session.user.id },
    });

    const files = (
      await Promise.all(
        dbFiles.map(async (file) => {
          const { data, error } = await supabase.storage
            .from("files")
            .download(file.supabasePath);
          console.log("error", error);
          console.log("data", data);
          if (data && !error) {
            return {
              id: file.id,
              name: file.name,
              filename: file.name,
              type: file.fileType,
              buffer: await data.arrayBuffer(),
              url: file.supabasePath,
            };
          }
          return null;
        }),
      )
    )
      .filter(
        (
          f,
        ): f is {
          id: string;
          name: string;
          filename: string;
          type: string;
          buffer: ArrayBuffer;
          url: string;
        } => f !== null,
      )
      .sort((a, b) => a.id.localeCompare(b.id));

    const stream = createUIMessageStream({
      execute: async ({ writer }) => {
        // Initialize Gemini model
        const model = google("gemini-2.5-flash");

        const userPrompt =
          messageHistory
            .map((msg) => {
              return `${msg.role}: ${msg.content}`;
            })
            .join("\n") +
          "\n\n" +
          files
            .map((file, idx) => {
              return `<file source-id=[${idx + 1}] file-id=[${file.id}] name=[${file?.name}]></file>`;
            })
            .join("\n") +
          "\n\n";

        console.log("\n\n User prompt \n\n", userPrompt);
        console.log("\n\n db files \n\n ", dbFiles);
        console.log("\n\n Files \n\n", files);

        // Stream response from Gemini
        const result = streamText({
          model,
          messages: [
            { role: "system", content: PROMPT },
            {
              role: "user",
              content: [
                { type: "text", text: userPrompt },
                ...files.map((file) => ({
                  type: "file" as const,
                  data: file.buffer,
                  mediaType: "application/pdf" as const,
                  filename: file.filename,
                })),
              ],
            },
          ],
          temperature: 0.7,
          experimental_transform: smoothStream(),
          onFinish: (e) => {
            console.log("finished streaming");
          },
        });

        writer.merge(result.toUIMessageStream());
        const fullText = await result.text;
        console.log("abhijeet fullText", fullText);
        writer.write({
          type: "data-chatId",
          data: {
            chatId: currentChatId,
          },
          transient: true,
        });

        if (fullText) {
          await db.message.create({
            data: {
              chatId: currentChatId,
              role: "ASSISTANT",
              content: fullText,
              messageSources: {
                createMany: {
                  data: files.map((f) => {
                    return {
                      fileId: f.id,
                    };
                  }),
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
