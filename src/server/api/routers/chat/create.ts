import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { base64ToFile } from "@/lib/utils";
import { uploadToSupabase } from "./helper";
import { supabase } from "@/lib/supabase";
import { google } from "@ai-sdk/google";
import { generateText } from "ai";

export const chatRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({ ctx }) => {
    const chats = await ctx.db.chat.findMany({
      where: {
        userId: ctx.session.user.id,
      },
      orderBy: {
        updatedAt: "desc",
      },
      select: {
        id: true,
        title: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            messages: true,
          },
        },
      },
    });

    return chats;
  }),

  create: protectedProcedure
    .input(z.object({ title: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.chat.create({
        data: {
          title: input.title,
          userId: ctx.session.user.id,
        },
      });
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const chat = await ctx.db.chat.findFirst({
        where: {
          id: input.id,
          userId: ctx.session.user.id,
        },
        include: {
          messages: {
            orderBy: {
              createdAt: "asc",
            },
            select: {
              id: true,
              content: true,
              role: true,
              createdAt: true,
              messageFiles: {
                include: {
                  file: true,
                },
              },
              messageSources: {
                include: {
                  file: true,
                },
              },
            },
          },
        },
      });

      if (!chat) {
        throw new Error("Chat not found");
      }
      return chat;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.chat.delete({
        where: {
          id: input.id,
          userId: ctx.session.user.id,
        },
      });
    }),

  uploadFiles: protectedProcedure
    .input(
      z.object({
        base64Files: z.array(
          z.object({
            name: z.string(),
            type: z.string(),
            base64: z.string(),
          }),
        ),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const { base64Files } = input;
        const files = base64Files.map((file) =>
          base64ToFile(file.base64, file.name),
        );

        const uploadedFiles = await Promise.all(
          files.map(async (file) => {
            try {
              return await uploadToSupabase(file, ctx.session.user.id);
            } catch (error) {
              console.error("Error uploading file:", error);
              throw new Error(`Failed to upload file: ${file.name}`);
            }
          }),
        );

        return {
          files: uploadedFiles.map((f) => ({
            id: f.id,
            name: f.name,
            fileType: f.type,
          })),
        };
      } catch (error) {
        console.error("Error in uploadFiles mutation:", error);
        throw new Error("Failed to upload files");
      }
    }),

  listFiles: protectedProcedure.query(async ({ ctx }) => {
    const files = await ctx.db.file.findMany({
      where: {
        userId: ctx.session.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        name: true,
        size: true,
        fileType: true,
        createdAt: true,
        supabasePath: true,
      },
    });
    return files;
  }),

  deleteFile: protectedProcedure
    .input(z.object({ fileId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Find the file to ensure it belongs to the user
      const file = await ctx.db.file.findFirst({
        where: {
          id: input.fileId,
          userId: ctx.session.user.id,
        },
      });

      if (!file) {
        throw new Error(
          "File not found or you don't have permission to delete it",
        );
      }

      try {
        // Delete from Supabase storage
        const { error: storageError } = await supabase.storage
          .from("files")
          .remove([file.supabasePath]);

        if (storageError) {
          console.error("Error deleting from Supabase storage:", storageError);
          // Continue with database deletion even if storage deletion fails
        }

        // Delete from database
        await ctx.db.file.delete({
          where: { id: input.fileId },
        });

        return { success: true };
      } catch (error) {
        console.error("Error deleting file:", error);
        throw new Error("Failed to delete file");
      }
    }),

  generateQuiz: protectedProcedure
    .input(
      z.object({
        fileId: z.string(),
        quizType: z.enum(["MCQ", "SAQ", "LAQ"]),
        numberOfQuestions: z.number().min(1).max(20),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const { fileId, quizType, numberOfQuestions } = input;

        // Get the file and its associated PDF chunks from database
        const file = await ctx.db.file.findFirst({
          where: {
            id: fileId,
            userId: ctx.session.user.id,
          },
        });

        if (!file) {
          throw new Error(
            "File not found or you don't have permission to access it",
          );
        }

        // Use the existing PDF full-text API to get document content
        const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
        const response = await fetch(
          `${baseUrl}/api/pdf/full-text?fileId=${fileId}`,
        );

        if (!response.ok) {
          throw new Error("Failed to extract PDF content");
        }

        const pdfData = (await response.json()) as {
          fullText?: string;
          pageCount?: number;
          fileName?: string;
        };
        const documentContent = pdfData.fullText?.slice(0, 6000) ?? ""; // Limit for API token constraints

        if (!documentContent.trim()) {
          throw new Error(
            "No text content found in the PDF. Please try re-uploading the document.",
          );
        }

        const quizTypeMap = {
          MCQ: "Multiple Choice Questions with 4 options each",
          SAQ: "Short Answer Questions requiring 2-3 sentence answers",
          LAQ: "Long Answer Questions requiring detailed explanations",
        };

        const prompt = `Based on the following document content, generate exactly ${numberOfQuestions} ${quizTypeMap[quizType]}. 

Document Content:
${documentContent}

Requirements:
1. Generate exactly ${numberOfQuestions} questions
2. Each question should be ${quizType === "MCQ" ? "multiple choice with exactly 4 options (A, B, C, D)" : quizType === "SAQ" ? "short answer" : "long answer"}
3. Include the correct answer for each question
4. Add a brief explanation for each answer
5. Ensure questions test understanding of the document content

${
  quizType === "MCQ"
    ? `
Format your response as JSON:
{
  "questions": [
    {
      "question": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Explanation here",
      "topic": "Topic from document"
    }
  ]
}`
    : `
Format your response as JSON:
{
  "questions": [
    {
      "question": "Question text here?",
      "correctAnswer": "Expected answer here",
      "explanation": "Explanation here", 
      "topic": "Topic from document"
    }
  ]
}`
}

Make sure to return valid JSON only.`;

        const result = await generateText({
          model: google("gemini-2.0-flash-exp"),
          prompt,
          temperature: 0.7,
        });

        let quizData: { questions?: unknown[] } | undefined;
        try {
          // Try to parse the JSON response
          const jsonRegex = /\{[\s\S]*\}/;
          const jsonMatch = jsonRegex.exec(result.text);
          if (jsonMatch?.[0]) {
            quizData = JSON.parse(jsonMatch[0]) as { questions?: unknown[] };
          } else {
            throw new Error("No JSON found in response");
          }
        } catch {
          console.error("Failed to parse AI response:", result.text);
          throw new Error(
            "Failed to generate quiz questions. Please try again.",
          );
        }

        if (!quizData?.questions || !Array.isArray(quizData.questions)) {
          throw new Error("Invalid quiz format generated");
        }

        return {
          questions: quizData.questions,
          metadata: {
            fileId: file.id,
            fileName: file.name,
            quizType,
            numberOfQuestions,
            generatedAt: new Date().toISOString(),
          },
        };
      } catch (error) {
        console.error("Error generating quiz:", error);
        throw new Error(
          error instanceof Error ? error.message : "Failed to generate quiz",
        );
      }
    }),
});
