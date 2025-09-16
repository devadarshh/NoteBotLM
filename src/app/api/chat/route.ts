import { google } from '@ai-sdk/google';
import { streamText } from 'ai';
import { NextRequest } from 'next/server';
import { z } from 'zod';

import { auth } from '@/server/auth';
import { db } from '@/server/db';
import { env } from '@/env';

const requestSchema = z.object({
  message: z.string(),
  chatId: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return new Response('Unauthorized', { status: 401 });
    }

    const body = await req.json() as unknown;

    console.log("abhijeet body", body);
    const { message, chatId } = requestSchema.parse(body);

    let currentChatId = chatId;
    let messageHistory: Array<{ role: 'user' | 'assistant'; content: string }> = [];

    // If chatId exists, load message history from database
    if (currentChatId) {
      const existingMessages = await db.message.findMany({
        where: { chatId: currentChatId },
        orderBy: { createdAt: 'asc' },
        select: { role: true, content: true },
      });

      messageHistory = existingMessages.map((msg) => ({
        role: msg.role === 'USER' ? 'user' as const : 'assistant' as const,
        content: msg.content,
      }));
    } else {
      // Create new chat for first message
      const chat = await db.chat.create({
        data: {
          userId: session.user.id,
          title: message.slice(0, 50) + (message.length > 50 ? '...' : ''),
        },
      });
      currentChatId = chat.id;
    }

    // Add the new user message to history
    messageHistory.push({ role: 'user', content: message });

    // Save user message to database
    await db.message.create({
      data: {
        chatId: currentChatId,
        role: 'USER',
        content: message,
      },
    });

    // Initialize Gemini model
    const model = google('gemini-2.5-flash');

    // Stream response from Gemini
    const result = streamText({
      model,
      messages: messageHistory,
      temperature: 0.7,
    });

    // Save assistant response after streaming completes
    result.text.then(async (fullText: string) => {
      if (fullText) {
        await db.message.create({
          data: {
            chatId: currentChatId,
            role: 'ASSISTANT',
            content: fullText,
          },
        });
      }
    }).catch((error: unknown) => {
      console.error('Failed to save assistant message:', error);
    });

    return result.toUIMessageStreamResponse({
      headers: {
        'X-Chat-ID': currentChatId,
      },
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}