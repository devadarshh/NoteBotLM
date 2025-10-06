
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ChatComponent } from "@/components/chat/chat-component";

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
        <ChatComponent />
      </div>
    </div>
  );
}