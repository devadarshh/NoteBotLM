"use client";

import { useRef, useEffect } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { ScrollArea } from "@/components/ui/scroll-area";
import { User, Bot } from "lucide-react";
import { useRouter } from "next/navigation";
import { api } from "@/trpc/react";
import { ChatInput } from "./chat-input";

interface ChatComponentProps {
  chatId?: string;
}

export function ChatComponent({ chatId }: ChatComponentProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Use tRPC to fetch chat history
  const { data: chatData } = api.chat.getById.useQuery(
    { id: chatId! },
    { enabled: !!chatId }
  );

  useEffect(() => {
    if (chatData?.messages) {
      const uiMessages: UIMessage[] = chatData.messages.map((message) => ({
        id: message.id,
        role: message.role,
        content: message.content,
        createdAt: message.createdAt,
        parts: [{ type: 'text', text: message.content }],
      }));
      setMessages(uiMessages);
    }
  }, [chatData?.messages]);

  // Initialize useChat with AI SDK 5.0 API
  const { messages, status, sendMessage, setMessages } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/chat',
      prepareSendMessagesRequest: ({messages,id,body}) => {
        return {
          body: {
            message: messages.at(-1)?.parts.find((part) => part.type === 'text')?.text,
            chatId,
            ...body
          },
        }
      },
    }),
    onData: (data) => {
      console.log("abhijeet data", data);
    },
  });

  console.log("abhijeet messages", messages);

  const isLoading = status === 'submitted' || status === 'streaming';

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleMessageSubmit = async (messageText: string) => {
    if (!messageText.trim() || isLoading) return;

    // Send message using AI SDK 5.0 API
    await sendMessage({ text: messageText });

    // Note: Chat ID management will be handled by the API route
    // and should automatically redirect if needed
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Chat Messages Area */}
      <ScrollArea className="flex-1 min-h-0 p-4" ref={scrollAreaRef}>
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">S</span>
              </div>
            </div>
            <h2 className="text-lg font-semibold mb-2">
              Welcome to Sage Chat
            </h2>
            <p className="text-muted-foreground">
              Start a conversation with your AI assistant
            </p>
          </div>
        ) : (
          <div className="space-y-4 max-w-4xl mx-auto">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`flex space-x-2 ${
                    message.role === 'user' ? 'flex-row-reverse space-x-reverse max-w-[80%] ' : ''
                  }`}
                >
                  {/* <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                    {message.role === 'user' ? (
                      <User className="w-4 h-4" />
                    ) : (
                      <Bot className="w-4 h-4" />
                    )}
                  </div> */}
                  <div
                    className={`rounded-lg px-4 py-2 ${
                      message.role === 'user'
                        ? 'bg-muted'
                        : ''
                    }`}
                  >
                    <p className="whitespace-pre-wrap">
                      {message.parts?.map((part, _index: number) => {
                        if (part.type === 'text') {
                          return part.text;
                        }
                        return '';
                      }).join('') || ''}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Chat Input */}
      <ChatInput onSubmit={handleMessageSubmit} disabled={isLoading} />
    </div>
  );
}