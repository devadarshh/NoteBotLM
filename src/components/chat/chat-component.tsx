"use client";

import { useRef, useEffect, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { api } from "@/trpc/react";
import { ChatInput } from "./chat-input";
import { Streamdown } from "streamdown";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import dynamic from "next/dynamic";

const PdfViewer = dynamic(
  () => import("@/components/pdf/pdf-viewer").then((mod) => mod.PdfViewer),
  { ssr: false, loading: () => <div>Loading...</div> },
);

interface ChatComponentProps {
  chatId?: string;
}
interface CitationData {
  citedText: string;
  pageNumber?: number;
  fileUrl: string;
  sourceId: string;
}

export function ChatComponent({ chatId }: ChatComponentProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [citationData, setCitationData] = useState<CitationData | null>(null);
  const utils = api.useUtils();

  // Use tRPC to fetch chat history
  const { data: chatData } = api.chat.getById.useQuery(
    { id: chatId! },
    { enabled: !!chatId },
  );
  console.log("[ChatComponent][DEBUG] chatId:", chatId);
  console.log("[ChatComponent][DEBUG] chatData:", chatData);

  useEffect(() => {
    console.log(
      "[ChatComponent][DEBUG] useEffect chatData?.messages:",
      chatData?.messages,
    );
    if (chatData?.messages) {
      const uiMessages: UIMessage[] = chatData.messages.map((message) => ({
        id: message.id,
        role:
          message.role === "USER" ? ("user" as const) : ("assistant" as const),
        content: message.content,
        createdAt: message.createdAt,
        parts: [{ type: "text", text: message.content }],
      }));
      setMessages(uiMessages);
    }
  }, [chatData?.messages]);

  // Initialize useChat with AI SDK 5.0 API
  const { messages, status, sendMessage, setMessages } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
      prepareSendMessagesRequest: ({ messages, id, body }) => {
        console.log("[ChatComponent][DEBUG] prepareSendMessagesRequest:", {
          messages,
          id,
          body,
          chatId,
        });
        const lastMessage = messages
          .at(-1)
          ?.parts.find((p) => p.type === "text")?.text;
        return {
          body: {
            chatId,
            ...(body?.fileIds?.length
              ? { message: lastMessage, fileIds: body.fileIds } // upload
              : { prompt: lastMessage, pdfIds: body.fileIds ?? [] }), // query
          },
        };
      },
      onData: (data) => {
        console.log("[FE] Received stream data:", data);
        console.log("[ChatComponent][DEBUG] onData received:", data);
        if (data.type === "data-chatId") {
          const newChatId = (data.data as { chatId: string }).chatId;
          console.log(`[FE] New chatId received: ${newChatId}. Redirecting...`);
          utils.chat.getById
            .prefetch({ id: newChatId })
            .then(() => {
              router.push(`/chat/${newChatId}`);
            })
            .catch((e) => {
              console.log("[FE] Error in prefetch:", e);
            });
        }
      },
    }),
    onFinish: () => {
      console.log("[FE] Chat stream finished. Invalidating queries.");
      void utils.chat.getById.invalidate();
    },
  });
  console.log("[ChatComponent][DEBUG] messages:", messages);
  console.log("[ChatComponent][DEBUG] status:", status);

  const isLoading = status === "submitted" || status === "streaming";

  const handleCitationClick = ({
    messageId,
    citedText,
    pageNumber,
    fileId,
    sourceId,
  }: {
    messageId: string;
    citedText: string;
    pageNumber: number;
    fileId: string;
    sourceId: string;
  }) => {
    console.log("[FE] Citation clicked! Data:", {
      messageId,
      citedText,
      pageNumber,
      fileId,
      sourceId,
    });

    // Find the correct file URL from the message sources
    const message = chatData?.messages.find((msg) => msg.id === messageId);
    const file =
      message?.messageSources[+sourceId - 1] ??
      message?.messageSources.find((file) => file.fileId === fileId);

    if (!message || !file) {
      console.error("[FE] Could not find message or file for citation.");
      return;
    }

    const fileUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/files/${file.file.supabasePath}`;
    console.log(`[FE] Found file URL: ${fileUrl}`);

    setCitationData({
      citedText,
      pageNumber,
      fileUrl,
      sourceId,
    });
  };

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleMessageSubmit = async (
    messageText: string,
    fileIds?: string[],
  ) => {
    console.log(
      `[FE] User submitted message: "${messageText}" with file IDs: ${fileIds}`,
    );
    if (!messageText.trim() || isLoading) return;

    await sendMessage(
      { text: messageText },
      {
        body:
          fileIds && fileIds.length > 0
            ? { prompt: messageText, pdfIds: fileIds, chatId } // always query when files exist
            : { prompt: messageText, pdfIds: [], chatId }, // Query flow
      },
    );
  };

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <ResizablePanelGroup direction="horizontal" className="min-h-0 flex-1">
        <ResizablePanel defaultSize={citationData ? 60 : 100} minSize={40}>
          <div className="flex h-full min-h-0 flex-col">
            <ScrollArea className="min-h-0 flex-1 p-4" ref={scrollAreaRef}>
              {messages.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <div className="bg-muted mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
                      <span className="text-primary-foreground text-sm font-bold">
                        S
                      </span>
                    </div>
                  </div>
                  <h2 className="mb-2 text-lg font-semibold">
                    Welcome to Sage Chat
                  </h2>
                  <p className="text-muted-foreground">
                    Start a conversation with your AI assistant
                  </p>
                </div>
              ) : (
                <div className="mx-auto max-w-4xl space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.role === "user"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`flex space-x-2 ${
                          message.role === "user"
                            ? "max-w-[80%] flex-row-reverse space-x-reverse"
                            : ""
                        }`}
                      >
                        <div
                          className={`rounded-lg px-4 py-2 ${
                            message.role === "user" ? "bg-muted" : ""
                          }`}
                        >
                          <p className="whitespace-pre-wrap">
                            {message.parts
                              ?.filter((part) => part.type === "text")
                              .map((part, _index: number) => {
                                return (
                                  <Streamdown
                                    components={{
                                      // @ts-expect-error dynamic props
                                      citation: ({
                                        children,
                                        ...rest
                                      }: {
                                        children: string;
                                        "cited-text": string;
                                        "file-page-number": number;
                                        "file-id": string;
                                        "source-id": string;
                                      }) => (
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <span
                                              className="cursor-pointer text-blue-500"
                                              onClick={() =>
                                                handleCitationClick({
                                                  messageId: message.id,
                                                  citedText: rest["cited-text"],
                                                  pageNumber:
                                                    rest["file-page-number"],
                                                  fileId: rest["file-id"],
                                                  sourceId: rest["source-id"],
                                                })
                                              }
                                            >
                                              {children}
                                            </span>
                                          </TooltipTrigger>
                                          <TooltipContent>
                                            <p>{rest["cited-text"]}</p>
                                          </TooltipContent>
                                        </Tooltip>
                                      ),
                                    }}
                                    key={_index}
                                  >
                                    {part.text}
                                  </Streamdown>
                                );
                              })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>

            <ChatInput onSubmit={handleMessageSubmit} disabled={isLoading} />
          </div>
        </ResizablePanel>

        {citationData && (
          <>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={40} minSize={30}>
              <div className="flex h-full flex-col border-l">
                <div className="bg-muted/50 flex items-center justify-between border-b p-4">
                  <h2 className="text-sm font-medium">PDF Viewer</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCitationData(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex-1 overflow-hidden">
                  <PdfViewer
                    textToHighlight={citationData.citedText}
                    initialPage={citationData.pageNumber}
                    fileUrl={citationData.fileUrl}
                  />
                </div>
              </div>
            </ResizablePanel>
          </>
        )}
      </ResizablePanelGroup>
    </div>
  );
}
