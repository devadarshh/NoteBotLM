import { SidebarTrigger } from "@/components/ui/sidebar";
import { ChatComponent } from "@/components/chat/chat-component";

export default function ChatPage() {
  return (
    <div className="flex h-screen flex-col">
      {/* Header with sidebar trigger */}
      <header className="flex h-16 items-center border-b px-4">
        <SidebarTrigger />
        <div className="ml-2">
          <h1 className="text-lg font-semibold">Chat</h1>
        </div>
      </header>

      {/* Main Chat Area */}
      <div className="flex flex-1 flex-col">
        <ChatComponent />
      </div>
    </div>
  );
}
