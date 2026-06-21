"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInMinutes < 1) return "Just now";
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  if (diffInHours < 24) return `${diffInHours}h ago`;
  if (diffInDays < 7) return `${diffInDays}d ago`;
  return date.toLocaleDateString();
}

interface ChatSection {
  title: string;
  chats: Array<{
    id: string;
    title: string | null;
    updatedAt: Date;
    messageCount: number;
  }>;
}

function groupChatsByDate(
  chats: Array<{
    id: string;
    title: string | null;
    updatedAt: Date;
    _count: { messages: number };
  }>,
): ChatSection[] {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

  const sections: ChatSection[] = [
    { title: "Today", chats: [] },
    { title: "Yesterday", chats: [] },
    { title: "Previous 7 days", chats: [] },
    { title: "Older", chats: [] },
  ];

  chats.forEach((chat) => {
    const chatDate = new Date(chat.updatedAt);
    const mappedChat = {
      id: chat.id,
      title: chat.title,
      updatedAt: chat.updatedAt,
      messageCount: chat._count.messages,
    };

    if (chatDate >= today) {
      sections[0]!.chats.push(mappedChat);
    } else if (chatDate >= yesterday) {
      sections[1]!.chats.push(mappedChat);
    } else if (chatDate >= weekAgo) {
      sections[2]!.chats.push(mappedChat);
    } else {
      sections[3]!.chats.push(mappedChat);
    }
  });

  return sections.filter((section) => section.chats.length > 0);
}

export function ChatList() {
  const params = useParams();
  const currentChatId = params?.chatId as string | undefined;

  const { data: chats, isLoading, error } = api.chat.list.useQuery();

  if (isLoading) {
    return (
      <ScrollArea className="flex-1">
        <div className="space-y-1.5 px-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-muted h-9 animate-pulse rounded-md" />
          ))}
        </div>
      </ScrollArea>
    );
  }

  if (error) {
    return (
      <ScrollArea className="flex-1">
        <div className="text-muted-foreground px-2 py-4 text-center text-xs">
          Failed to load chats
        </div>
      </ScrollArea>
    );
  }

  if (!chats || chats.length === 0) {
    return (
      <ScrollArea className="flex-1">
        <div className="text-muted-foreground px-2 py-4 text-center text-xs leading-relaxed">
          No conversations yet.
          <br />
          Start a new chat above.
        </div>
      </ScrollArea>
    );
  }

  const sections = groupChatsByDate(chats);

  return (
    <ScrollArea className="flex-1">
      <div className="space-y-4">
        {sections.map((section) => (
          <div key={section.title}>
            <p className="section-label mb-1.5 px-2">{section.title}</p>
            {section.chats.map((chat) => (
              <Button
                key={chat.id}
                asChild
                variant="ghost"
                className={cn(
                  "text-muted-foreground h-auto w-full justify-start px-2 py-2 text-left font-normal",
                  "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-md text-sm",
                  currentChatId === chat.id &&
                    "bg-sidebar-accent text-sidebar-accent-foreground font-medium",
                )}
                size="sm"
              >
                <Link href={`/chat/${chat.id}`} className="block truncate">
                  <div className="truncate group-data-[collapsible=icon]:hidden">
                    {chat.title ?? "New chat"}
                  </div>
                  <div className="text-muted-foreground mt-0.5 text-[11px] group-data-[collapsible=icon]:hidden">
                    {formatRelativeTime(new Date(chat.updatedAt))}
                  </div>
                </Link>
              </Button>
            ))}
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
