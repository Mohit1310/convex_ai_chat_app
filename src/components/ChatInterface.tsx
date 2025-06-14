import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useAction } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { SignOutButton } from '../SignOutButton';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { Sidebar } from './Sidebar';
import { SettingsModal } from './SettingsModal';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { HelpCircleIcon, SettingsIcon } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

interface ChatInterfaceProps {
  user: any;
  onShowOnboarding: () => void;
  chatId: string;
}

export function ChatInterface({ user, onShowOnboarding }: ChatInterfaceProps) {
  const { chatid } = useParams();
  const navigate = useNavigate();
  const chatId = chatid as Id<'chats'> | null;

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const chats = useQuery(api.chats.listChats);
  const currentChat = useQuery(api.chats.getChat, chatId ? { chatId } : 'skip');
  const messages = useQuery(
    api.chats.getChatMessages,
    chatId ? { chatId } : 'skip'
  );

  const models = useAction(api.ai.getAvailableModels);
  const getActiveApiKey = useAction(api.apiKeysActions.getActiveApiKey);
  const createChat = useMutation(api.chats.createChat);
  const generateImage = useAction(api.ai.generateImage);
  const sendMessage = useAction(api.ai.sendMessage);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollToBottom = () =>
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleNewChat = async () => {
    try {
      const availableModels = await models();
      const defaultModel =
        availableModels[0]?.id || 'gemini-2.5-flash-preview-05-20';
      const newChatId = await createChat({
        title: 'New Chat',
        model: defaultModel,
      });
      navigate(`/chat/${newChatId}`);
    } catch (error) {
      toast.error('Failed to create new chat');
    }
  };

  const handleSendMessage = async (content: string, selectedModel?: string) => {
    if (!chatId) {
      await handleNewChat();
      return;
    }

    setIsLoading(true);
    try {
      const model =
        selectedModel || currentChat?.model || 'gemini-2.5-flash-preview-05-20';
      const apiKey = (await getActiveApiKey({ provider: 'google' }))?.apiKey;
      await sendMessage({ chatId, message: content, model, apiKey });
    } catch (error) {
      toast.error('Failed to send message');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateImage = async (prompt: string) => {
    if (!chatId) {
      await handleNewChat();
      return;
    }

    setIsLoading(true);
    try {
      // Get the active API key
      const activeApiKey = await getActiveApiKey({ provider: 'google' });
      const apiKey = activeApiKey?.apiKey;

      await generateImage({
        chatId: chatId,
        model: currentChat?.model || 'gemini-2.5-flash-preview-05-20',
        prompt,
        apiKey,
      });
    } catch (error) {
      toast.error('Failed to generate image');
      console.error('Generate image error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChatSelect = (chatId: Id<'chats'>) => {
    navigate(`/chat/${chatId}`);
  };

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Sidebar */}
      <Sidebar
        chats={chats || []}
        currentChatId={chatId}
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
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">
                {currentChat?.title || 'AI Chat'}
              </h1>
              {currentChat && (
                <p className="text-sm text-gray-500 capitalize">
                  {currentChat.model.replace('-', ' ')}
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
              <SettingsIcon />
            </button>
            <button
              onClick={onShowOnboarding}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Help"
            >
              <HelpCircleIcon />
            </button>
            <SignOutButton />
          </div>
        </header>

        {/* Chat Content */}
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
          {chatId && messages ? (
            <>
              <MessageList messages={messages} isLoading={isLoading} />
              <div ref={messagesEndRef} />
              <MessageInput
                onSendMessage={handleSendMessage}
                onGenrateImage={handleGenerateImage}
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
                  Start a conversation with AI models. Choose from Google's
                  Gemini and other powerful language models.
                </p>
                <Button onClick={handleNewChat}>Start New Chat</Button>
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
