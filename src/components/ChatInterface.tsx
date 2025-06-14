import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { SignOutButton } from "../SignOutButton";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";
import { Sidebar } from "./Sidebar";
import { SettingsModal } from "./SettingsModal";
import { toast } from "sonner";

interface ChatInterfaceProps {
  user: any;
  onShowOnboarding: () => void;
}

export function ChatInterface({ user, onShowOnboarding }: ChatInterfaceProps) {
  const [currentChatId, setCurrentChatId] = useState<Id<"chats"> | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const chats = useQuery(api.chats.listChats);
  const currentChat = useQuery(
    api.chats.getChat,
    currentChatId ? { chatId: currentChatId } : "skip"
  );
  const messages = useQuery(
    api.chats.getChatMessages,
    currentChatId ? { chatId: currentChatId } : "skip"
  );
  const models = useAction(api.ai.getAvailableModels);
  const getActiveApiKey = useAction(api.apiKeysActions.getActiveApiKey);

  const createChat = useMutation(api.chats.createChat);
  const sendMessage = useAction(api.ai.sendMessage);
  const addMessage = useMutation(api.chats.addMessage);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleNewChat = async () => {
    try {
      const availableModels = await models();
      const defaultModel = availableModels[0]?.id || "gemini-1.5-flash";
      
      const chatId = await createChat({
        title: "New Chat",
        model: defaultModel,
      });
      setCurrentChatId(chatId);
    } catch (error) {
      toast.error("Failed to create new chat");
    }
  };

  const handleSendMessage = async (content: string, selectedModel?: string) => {
    if (!currentChatId) {
      await handleNewChat();
      return;
    }

    setIsLoading(true);
    try {
      const model = selectedModel || currentChat?.model || "gemini-1.5-flash";
      
      // Get the active API key
      const activeApiKey = await getActiveApiKey({ provider: "google" });
      const apiKey = activeApiKey?.apiKey;

      await sendMessage({
        chatId: currentChatId,
        message: content,
        model,
        apiKey,
      });
    } catch (error) {
      toast.error("Failed to send message");
      console.error("Send message error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChatSelect = (chatId: Id<"chats">) => {
    setCurrentChatId(chatId);
  };

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Sidebar */}
      <Sidebar
        chats={chats || []}
        currentChatId={currentChatId}
        onChatSelect={handleChatSelect}
        onNewChat={handleNewChat}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors lg:hidden"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">
                {currentChat?.title || "AI Chat"}
              </h1>
              {currentChat && (
                <p className="text-sm text-gray-500 capitalize">
                  {currentChat.model.replace("-", " ")}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setSettingsOpen(true)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Settings"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
            <button
              onClick={onShowOnboarding}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Help"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
            <SignOutButton />
          </div>
        </header>

        {/* Chat Content */}
        <div className="flex-1 flex flex-col">
          {currentChatId && messages ? (
            <>
              <MessageList messages={messages} isLoading={isLoading} />
              <div ref={messagesEndRef} />
              <MessageInput
                onSendMessage={handleSendMessage}
                disabled={isLoading}
                currentModel={currentChat?.model}
              />
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center max-w-md mx-auto p-8">
                <div className="w-16 h-16 bg-linear-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-xl">AI</span>
                </div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                  Welcome to AI Chat
                </h2>
                <p className="text-gray-600 mb-6">
                  Start a conversation with AI models. Choose from Google's Gemini and other powerful language models.
                </p>
                <button
                  onClick={handleNewChat}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Start New Chat
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        user={user}
      />
    </div>
  );
}
