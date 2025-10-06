"use client"

import Link from "next/link"
import { Plus } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { ChatList } from "./chat-list"
import { UserMenu } from "./user-menu"

interface ChatSidebarProps {
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
  }
}

export function ChatSidebar({ user }: ChatSidebarProps) {
  return (
    <Sidebar collapsible="icon" className="w-64 border-r bg-sidebar">
      <SidebarHeader className="p-6 pb-4 group-data-[collapsible=icon]:p-2">
        <div className="flex items-center justify-between group-data-[collapsible=icon]:justify-center">
          <div className="flex items-center space-x-3 group-data-[collapsible=icon]:space-x-0">
            <div className="w-7 h-7 bg-blue-600 rounded flex items-center justify-center group-data-[collapsible=icon]:w-8 group-data-[collapsible=icon]:h-8">
              <span className="text-white font-semibold text-sm">S</span>
            </div>
            <span className="font-medium text-base text-sidebar-foreground group-data-[collapsible=icon]:hidden">
              Sage
            </span>
          </div>
          <div className="group-data-[collapsible=icon]:hidden">
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-4 group-data-[collapsible=icon]:px-2">
        <div className="mb-6 group-data-[collapsible=icon]:mb-4">
          <Button 
            asChild 
            className="w-full justify-start bg-blue-600 hover:bg-blue-700 text-white rounded-lg group-data-[collapsible=icon]:w-8 group-data-[collapsible=icon]:h-8 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:justify-center" 
            size="sm"
          >
            <Link href="/chat" className="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:justify-center">
              <Plus className="mr-2 h-4 w-4 group-data-[collapsible=icon]:mr-0 group-data-[collapsible=icon]:h-5 group-data-[collapsible=icon]:w-5" />
              <span className="group-data-[collapsible=icon]:hidden">New Chat</span>
            </Link>
          </Button>
        </div>
        
        <div className="flex-1 group-data-[collapsible=icon]:hidden">
          <ChatList />
        </div>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sidebar-border group-data-[collapsible=icon]:p-2">
        <div className="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
          <UserMenu user={user} />
        </div>
      </SidebarFooter>
      
      <SidebarRail />
    </Sidebar>
  )
}