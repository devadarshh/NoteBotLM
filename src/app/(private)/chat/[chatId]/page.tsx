
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ChatComponent } from "@/components/chat/chat-component";

interface ChatPageProps {
  params: Promise<{ chatId: string }>;
}

export default async function ChatPage({ params }: ChatPageProps) {
  const resolvedParams = await params;
  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header with sidebar trigger */}
      <header className="flex items-center h-16 px-4 border-b">
        <SidebarTrigger />
        <div className="ml-2">
          <h1 className="text-lg font-semibold">Chat</h1>
        </div>
      </header>

      {/* Main Chat Area */}
      <div className="flex-1 min-h-0 flex flex-col">
        <ChatComponent 
          chatId={resolvedParams.chatId} 
        />
      </div>
    </div>
  );
}