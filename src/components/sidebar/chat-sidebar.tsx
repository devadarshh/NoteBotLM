"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { ChatList } from "./chat-list";
import { UserMenu } from "./user-menu";

interface ChatSidebarProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export function ChatSidebar({ user }: ChatSidebarProps) {
  return (
    <Sidebar collapsible="icon" className="bg-sidebar w-64 border-r">
      <SidebarHeader className="p-6 pb-4 group-data-[collapsible=icon]:p-2">
        <div className="flex items-center justify-between group-data-[collapsible=icon]:justify-center">
          <div className="flex items-center space-x-3 group-data-[collapsible=icon]:space-x-0">
            <div className="bg-primary flex h-7 w-7 items-center justify-center rounded group-data-[collapsible=icon]:h-8 group-data-[collapsible=icon]:w-8">
              <span className="text-primary-foreground text-sm font-semibold">
                N
              </span>
            </div>
            <span className="text-sidebar-foreground text-base font-medium group-data-[collapsible=icon]:hidden">
              NoteBotLM
            </span>
          </div>
          <div className="group-data-[collapsible=icon]:hidden"></div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-4 group-data-[collapsible=icon]:px-2">
        <div className="mb-6 group-data-[collapsible=icon]:mb-4">
          <Button
            asChild
            className="bg-primary text-primary-foreground hover:bg-primary/90 w-full justify-start gap-2 rounded-lg px-4 py-4 text-sm transition-all group-data-[collapsible=icon]:h-8 group-data-[collapsible=icon]:w-8 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0"
            size="sm"
          >
            <Link
              href="/chat"
              className="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:justify-center"
            >
              <Plus className="mr-2 h-4 w-4 group-data-[collapsible=icon]:mr-0 group-data-[collapsible=icon]:h-5 group-data-[collapsible=icon]:w-5" />
              <span className="group-data-[collapsible=icon]:hidden">
                New Chat
              </span>
            </Link>
          </Button>
        </div>

        <div className="flex-1 group-data-[collapsible=icon]:hidden">
          <ChatList />
        </div>
      </SidebarContent>

      <SidebarFooter className="border-sidebar-border border-t px-3 py-2 group-data-[collapsible=icon]:p-2">
        <div className="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
          <UserMenu user={user} />
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
