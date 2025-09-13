import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Send } from "lucide-react";

export default function ChatPage() {
  return (
    <div className="flex flex-col h-screen">
      {/* Header with sidebar trigger */}
      <header className="flex items-center h-16 px-4 border-b">
        <SidebarTrigger />
        <div className="ml-2">
          <h1 className="text-lg font-semibold">Chat</h1>
        </div>
      </header>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Messages Area */}
        <ScrollArea className="flex-1 p-4">
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
        </ScrollArea>

        {/* Chat Input */}
        <div className="border-t p-4">
          <div className="flex space-x-2 max-w-4xl mx-auto">
            <Input
              type="text"
              placeholder="Type your message..."
              className="flex-1"
            />
            <Button type="button" size="icon">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}