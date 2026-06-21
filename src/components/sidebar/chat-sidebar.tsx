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
import { BrandLogo } from "@/components/layout/brand-logo";

interface ChatSidebarProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export function ChatSidebar({ user }: ChatSidebarProps) {
  return (
    <Sidebar
      collapsible="icon"
      className="border-sidebar-border bg-sidebar w-64 border-r"
    >
      <SidebarHeader className="border-sidebar-border border-b p-4 group-data-[collapsible=icon]:p-2">
        <BrandLogo size="sm" className="group-data-[collapsible=icon]:hidden" />
        <div className="hidden group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
          <div className="bg-primary text-primary-foreground flex h-8 w-8 items-center justify-center rounded-lg font-display text-sm italic">
            N
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3 py-4 group-data-[collapsible=icon]:px-2">
        <div className="mb-4">
          <Button
            asChild
            className="group-data-[collapsible=icon]:h-8 group-data-[collapsible=icon]:w-8 group-data-[collapsible=icon]:p-0 w-full justify-start gap-2"
            size="sm"
          >
            <Link
              href="/chat"
              className="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:justify-center"
            >
              <Plus className="h-4 w-4 group-data-[collapsible=icon]:mr-0" />
              <span className="group-data-[collapsible=icon]:hidden">
                New chat
              </span>
            </Link>
          </Button>
        </div>

        <div className="flex-1 group-data-[collapsible=icon]:hidden">
          <ChatList />
        </div>
      </SidebarContent>

      <SidebarFooter className="border-sidebar-border border-t p-3 group-data-[collapsible=icon]:p-2">
        <div className="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
          <UserMenu user={user} />
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
