import { SidebarTrigger } from "@/components/ui/sidebar";
import { ChatComponent } from "@/components/chat/chat-component";

export default function ChatPage() {
  return (
    <div className="bg-background flex h-screen flex-col">
      {/* Header with sidebar trigger */}
      <header className="border-border bg-card flex h-16 items-center border-b px-4">
        <SidebarTrigger className="cursor-pointer" />

        <div className="ml-2 flex items-center space-x-2">
          <div className="bg-primary flex h-6 w-6 items-center justify-center rounded">
            <span className="text-primary-foreground text-xs font-semibold">
              N
            </span>
          </div>
          <h1 className="text-lg font-semibold">NoteBotLM</h1>
        </div>
      </header>

      {/* Main Chat Area */}
      <div className="flex flex-1 flex-col">
        <ChatComponent />
      </div>
    </div>
  );
}
