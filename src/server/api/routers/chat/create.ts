import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
} from "@/server/api/trpc";
import { base64ToFile } from "@/lib/utils";
import { uploadToSupabase } from "./helper";

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
              messageFiles:{
                include:{
                  file:true
                }
              },
              messageSources:{
                include:{
                  file:true
                }
              },
            },
          },
        },
      });

      if (!chat) {
        throw new Error('Chat not found');
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
});
