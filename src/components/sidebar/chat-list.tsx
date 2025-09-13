"use client"

import Link from "next/link"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// Mock data inspired by the design but with Sage functionality
const mockChats = [
  {
    id: "section1",
    title: "Today",
    isSection: true,
  },
  {
    id: "1",
    title: "React Performance Optimization",
    timestamp: "2 min ago",
    isActive: true,
  },
  {
    id: "2",
    title: "Database Schema Design",
    timestamp: "1 hour ago",
    isActive: false,
  },
  {
    id: "section2",
    title: "Yesterday", 
    isSection: true,
  },
  {
    id: "3",
    title: "API Integration Guide",
    timestamp: "Yesterday",
    isActive: false,
  },
  {
    id: "4",
    title: "CSS Grid Layouts",
    timestamp: "Yesterday",
    isActive: false,
  },
  {
    id: "section3",
    title: "Previous 7 days",
    isSection: true,
  },
  {
    id: "5",
    title: "State Management Patterns",
    timestamp: "3 days ago",
    isActive: false,
  },
  {
    id: "6",
    title: "Testing Strategies",
    timestamp: "5 days ago",
    isActive: false,
  },
  {
    id: "7",
    title: "Deployment Best Practices",
    timestamp: "6 days ago",
    isActive: false,
  },
]

export function ChatList() {
  return (
    <ScrollArea className="flex-1">
      <div className="space-y-0.5">
        {mockChats.map((chat) => (
          <div key={chat.id}>
            {chat.isSection ? (
              <div className="px-2 py-3 first:pt-0">
                <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {chat.title}
                </h3>
              </div>
            ) : (
              <Button
                asChild
                variant="ghost"
                className={cn(
                  "w-full justify-start h-auto px-3 py-2.5 text-left font-normal group-data-[collapsible=icon]:p-2",
                  "hover:bg-gray-100 text-gray-700 text-sm rounded-lg",
                  chat.isActive && "bg-gray-200 hover:bg-gray-200"
                )}
                size="sm"
              >
                <Link href={`/chat/${chat.id}`} className="block truncate">
                  <div className="truncate">
                    {chat.title}
                  </div>
                  {chat.timestamp && (
                    <div className="text-xs text-gray-500 mt-0.5 group-data-[collapsible=icon]:hidden">
                      {chat.timestamp}
                    </div>
                  )}
                </Link>
              </Button>
            )}
          </div>
        ))}
      </div>
    </ScrollArea>
  )
}