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
    <Sidebar collapsible="icon" className="w-64 border-r bg-gray-50">
      <SidebarHeader className="p-6 pb-4">
        <div className="flex items-center space-x-3">
          <div className="w-7 h-7 bg-blue-600 rounded flex items-center justify-center">
            <span className="text-white font-semibold text-sm">S</span>
          </div>
          <span className="font-medium text-base text-gray-900 group-data-[collapsible=icon]:hidden">
            Sage
          </span>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-4">
        <div className="mb-6">
          <Button 
            asChild 
            className="w-full justify-start bg-blue-600 hover:bg-blue-700 text-white rounded-lg" 
            size="sm"
          >
            <Link href="/chat">
              <Plus className="mr-2 h-4 w-4" />
              <span className="group-data-[collapsible=icon]:hidden">New Chat</span>
            </Link>
          </Button>
        </div>
        
        <div className="flex-1">
          <ChatList />
        </div>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-gray-200">
        <UserMenu user={user} />
      </SidebarFooter>
      
      <SidebarRail />
    </Sidebar>
  )
}