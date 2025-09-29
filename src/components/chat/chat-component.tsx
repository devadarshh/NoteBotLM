"use client";

import { useRef, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import dynamic from "next/dynamic";
import { api } from "@/trpc/react";
import { ChatInput } from "./chat-input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

const PdfViewer = dynamic(
  () => import("@/components/pdf/pdf-viewer").then((mod) => mod.PdfViewer),
  { ssr: false, loading: () => <div>Loading...</div> },
);
export interface VerifiedCitation {
  chunkId: string;
  fileId: string;
  fileName?: string;
  sourceText: string;
  pageNumber?: number;
  start: number;
  end: number;
}

export interface StructuredResponse {
  answer: string;
  citations: VerifiedCitation[];
}
interface ChatComponentProps {
  chatId?: string;
}
interface CitationData {
  citedText: string;
  pageNumber?: number;
  fileUrl: string;
  sourceId: string;
  fileName?: string;
}
interface FinalMessage {
  id: string;
  role: "user" | "assistant";
  content: string | React.ReactNode;
}

function formatAnswer(
  answer: string,
  citations: VerifiedCitation[],
  handleCitationClick: (citation: VerifiedCitation) => void,
): React.ReactNode {
  if (!answer) return "No answer provided";
  answer = answer.replace(/\[ID: [^\]]+\]/g, "");

  const citationRegex = /\[(\d+)\]/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;
  let usedCitations: VerifiedCitation[] = [];

  const sortedCitations = [...citations].sort((a, b) => a.start - b.start);

  let citationIdx = 0;
  while ((match = citationRegex.exec(answer)) !== null) {
    const matchStart = match.index;
    const matchEnd = citationRegex.lastIndex;
    if (lastIndex < matchStart) {
      parts.push(answer.substring(lastIndex, matchStart));
    }
    const citation = sortedCitations[citationIdx];
    usedCitations.push(citation);
    parts.push(
      <Tooltip key={citation?.chunkId || citationIdx}>
        <TooltipTrigger asChild>
          <sup
            className="cursor-pointer text-blue-500 hover:text-blue-700"
            onClick={() => citation && handleCitationClick(citation)}
            style={{ marginLeft: 2, marginRight: 2 }}
          >
            [{citationIdx + 1}]
          </sup>
        </TooltipTrigger>
        <TooltipContent>
          <p>{citation?.sourceText}</p>
        </TooltipContent>
      </Tooltip>,
    );
    lastIndex = matchEnd;
    citationIdx++;
  }
  if (lastIndex < answer.length) {
    parts.push(answer.substring(lastIndex));
  }

  const referenceList = usedCitations.map((citation, idx) => (
    <li key={citation?.chunkId || idx} className="text-xs">
      <span
        className="cursor-pointer text-blue-500 hover:text-blue-700"
        onClick={() => citation && handleCitationClick(citation)}
      >
        [{idx + 1}]
      </span>{" "}
      {citation?.sourceText}
    </li>
  ));

  return (
    <div>
      <p className="whitespace-pre-wrap">{parts}</p>
      {referenceList.length > 0 && (
        <ol className="mt-2 list-decimal pl-6">{referenceList}</ol>
      )}
    </div>
  );
}

export function ChatComponent({ chatId }: ChatComponentProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [citationData, setCitationData] = useState<CitationData | null>(null);
  const [messages, setMessages] = useState<FinalMessage[]>([]);

  const [isMounted, setIsMounted] = useState(false);
  const utils = api.useUtils();
  const [showPdfViewer, setShowPdfViewer] = useState(false);

  const { data: chatData } = api.chat.getById.useQuery(
    { id: chatId! },
    {
      enabled: !!chatId,
      trpc: { ssr: false },
      retry: false,
      staleTime: Infinity,
    },
  );

  useEffect(() => {
    setIsMounted(true);

    if (chatData?.messages) {
      const uiMessages: FinalMessage[] = chatData.messages.map((message) => {
        const content = message.content;

        let displayContent: string | React.ReactNode = content;

        if (
          message.role === "USER" &&
          (message.messageFiles?.length > 0 ||
            message.messageSources?.length > 0)
        ) {
          const files = message.messageFiles || message.messageSources || [];
          displayContent = (
            <div className="space-y-2">
              <div>{content}</div>
              {files.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {files.map((fileRef: any) => {
                    const file = fileRef.file;
                    return (
                      <div
                        key={file.id}
                        className="flex items-center space-x-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm"
                      >
                        <svg
                          className="h-4 w-4 text-blue-600"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="font-medium text-blue-800">
                          {file.name}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        }

        return {
          id: message.id,
          role:
            message.role === "USER"
              ? ("user" as const)
              : ("assistant" as const),
          content: displayContent,
        };
      });
      setMessages(uiMessages);
    }
  }, [chatData?.messages]);

  const [isLoading, setIsLoading] = useState(false);

  const { sendMessage } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
      prepareSendMessagesRequest: ({ messages, id, body }) => {
        setIsLoading(true);
        setMessages((prev) => [
          ...prev,
          {
            id: "assistant-temp",
            role: "assistant",
            content: (
              <div className="flex items-center space-x-1.5">
                <div className="h-2 w-2 animate-pulse rounded-full bg-gray-400 delay-75"></div>
                <div className="h-2 w-2 animate-pulse rounded-full bg-gray-400 delay-150"></div>
                <div className="h-2 w-2 animate-pulse rounded-full bg-gray-400 delay-200"></div>
              </div>
            ),
          },
        ]);
        const last = messages?.at(-1);
        const textPart = Array.isArray(last?.parts)
          ? last.parts.find((p: any) => p.type === "text")?.text
          : undefined;

        return {
          body: {
            message: textPart ?? (body as any)?.message ?? "",
            chatId,
            ...(body ?? {}),
          },
        };
      },
    }),
    onData: (data) => {

      if (data.type === "final-answer") {
        try {
          const structuredResponse = data.data as StructuredResponse;

          if (
            !structuredResponse ||
            typeof structuredResponse.answer !== "string"
          ) {
            console.warn(
              "No valid answer in structuredResponse",
              structuredResponse,
            );
            setMessages((prev) => [
              ...prev,
              {
                id: "no-answer-" + Date.now(),
                role: "assistant",
                content: " No valid answer was generated.",
              },
            ]);
            setIsLoading(false);
            return;
          }

          let formattedAnswer: React.ReactNode = null;
          try {
            formattedAnswer = formatAnswer(
              structuredResponse.answer,
              structuredResponse.citations ?? [],
              (citation) => handleCitationClick(citation),
            );
          } catch (err) {
            formattedAnswer = <span> Error formatting answer.</span>;
          }

          let contentToShow = formattedAnswer;
          if (
            !formattedAnswer ||
            (typeof formattedAnswer === "string" &&
              formattedAnswer.trim() === "")
          ) {
            contentToShow = structuredResponse.answer || (
              <span> No answer.</span>
            );
          }

          setMessages((prevMessages) => [
            ...prevMessages,
            {
              id: "assistant-" + Date.now(),
              role: "assistant",
              content: contentToShow,
            },
          ]);
        } catch (e) {
          console.error("Error processing final-answer", e);
          setMessages((prev) => [
            ...prev,
            {
              id: "process-error-" + Date.now(),
              role: "assistant",
              content: "Error rendering AI response.",
            },
          ]);
        } finally {
          setIsLoading(false);
        }
      } else if (data.type === "error-message") {
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            id: "error-" + Date.now(),
            role: "assistant",
            content: data.data as string,
          },
        ]);
        setIsLoading(false);
      } else if (data.type === "data-chatId") {
        const newChatId = (data.data as { chatId: string }).chatId;
        utils.chat.getById
          .prefetch({ id: newChatId })
          .then(() => {
            router.push(`/chat/${newChatId}`);
          })
          .catch((e) => {
            console.error("Error in prefetch", e);
          });
      } else {
        console.debug("Unhandled stream event type:", data.type, data);
      }
    },
    onFinish: () => {
      console.log("onFinish");
      setIsLoading(false);
      void utils.chat.getById.invalidate();
    },
  });

  const handleCitationClick = (citation: VerifiedCitation) => {
    setShowPdfViewer(true);

    const message = chatData?.messages.find((msg: any) => {
      if (Array.isArray(msg.messageSources)) {
        return msg.messageSources.some(
          (ms: any) => ms.fileId === citation.fileId,
        );
      }
      if (Array.isArray(msg.messageFiles)) {
        return msg.messageFiles.some(
          (mf: any) => mf.fileId === citation.fileId,
        );
      }
      return false;
    });

    if (!message) {
      console.error("No message found for citation", citation);
      return;
    }

    const messageFile =
      message.messageSources?.find(
        (ms: any) => ms.fileId === citation.fileId,
      ) ||
      message.messageFiles?.find((mf: any) => mf.fileId === citation.fileId);

    const file = messageFile?.file ?? messageFile?.file?.file ?? undefined;

    const supabasePath =
      file?.supabasePath ?? file?.supabaseFileId ?? file?.path;

    if (!supabasePath) {
      console.error("File or path not found for citation", citation, {
        messageFile,
        file,
      });
      return;
    }

    setCitationData({
      citedText: citation.sourceText,
      fileUrl: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/files/${supabasePath}`,
      sourceId: citation.chunkId,
      pageNumber: citation.pageNumber ?? undefined,
      fileName: citation.fileName,
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
    if (!messageText.trim() || isLoading) return;
    setIsLoading(true);

    const userMessage: FinalMessage = {
      id: "user-" + Date.now(),
      role: "user",
      content: messageText,
    };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    try {
      await sendMessage({ text: messageText }, { body: { fileIds } });
    } catch (err) {
      console.error("sendMessage error", err);
      setMessages((prev) => [
        ...prev,
        {
          id: "send-error-" + Date.now(),
          role: "assistant",
          content: "Failed to send message.",
        },
      ]);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      {isMounted && (
        <ResizablePanelGroup direction="horizontal" className="min-h-0 flex-1">
          <ResizablePanel defaultSize={showPdfViewer ? 60 : 100} minSize={40}>
            <div className="flex h-full min-h-0 flex-col">
              <ScrollArea className="min-h-0 flex-1 p-4" ref={scrollAreaRef}>
                {messages.length === 0 && !isLoading ? (
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
                        className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-xl px-4 py-2 ${
                            message.role === "user"
                              ? "bg-gray-100 text-gray-800"
                              : "bg-blue-50 text-gray-900"
                          }`}
                        >
                          {message.content}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
              <ChatInput onSubmit={handleMessageSubmit} disabled={isLoading} />
            </div>
          </ResizablePanel>

          {showPdfViewer && (
            <>
              <ResizableHandle withHandle />
              <ResizablePanel defaultSize={40} minSize={30}>
                <div className="flex h-full flex-col border-l">
                  <div className="bg-muted/50 flex items-center justify-between border-b p-4">
                    <h2 className="text-sm font-medium">PDF Viewer</h2>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowPdfViewer(false)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex-1 overflow-hidden">
                    {citationData?.fileUrl && (
                      <>
                        <div className="border-b bg-gray-50 p-4">
                          <div className="mb-1 text-sm font-semibold">
                            Source: {citationData.fileName || "PDF"}
                          </div>
                          <div className="mb-2 text-xs text-gray-700">
                            Page: {citationData.pageNumber ?? "N/A"}
                          </div>
                          <div className="mb-2 text-sm whitespace-pre-line text-gray-900">
                            {citationData.citedText}
                          </div>
                        </div>
                        <PdfViewer
                          textToHighlight={citationData.citedText}
                          fileUrl={citationData.fileUrl}
                          initialPage={citationData.pageNumber}
                        />
                      </>
                    )}
                  </div>
                </div>
              </ResizablePanel>
            </>
          )}
        </ResizablePanelGroup>
      )}
    </div>
  );
}
