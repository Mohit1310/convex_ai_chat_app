import { Sidebar } from '@/components/Sidebar';
import { api } from '../../convex/_generated/api';
import { useAction, useMutation, useQuery } from 'convex/react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { MessageInput } from '@/components/MessageInput';
import { useState } from 'react';
import { Id } from '../../convex/_generated/dataModel';

const Home = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const chats = useQuery(api.chats.listChats);
  const models = useAction(api.ai.getAvailableModels);
  const createChat = useMutation(api.chats.createChat);
  const navigate = useNavigate();
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
  const handleSendMessage = (message: string, model?: string) => {
    console.log('Message:', message, 'Model:', model);
    // You can handle chat logic here or redirect to `/chat/:chatId`
  };

  const handleChatSelect = (chatId: Id<'chats'>) => {
    navigate(`/chat/${chatId}`);
  };

  return (
    <div className="h-screen flex relative">
      <Sidebar
        isOpen={true}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        onChatSelect={handleChatSelect}
        onNewChat={handleNewChat}
        chats={chats || []}
      />
      <div className="flex-1 flex-col flex">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-xl mx-auto p-8">
            <div className="w-16 h-16 bg-linear-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-xl">AI</span>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Welcome to AI Chat
            </h2>
            <p className="text-gray-600 mb-6">
              Start a conversation with AI models. Choose from Google's Gemini
              and other powerful language models.
            </p>
          </div>
        </div>
        <MessageInput onSendMessage={handleSendMessage} disabled={false} />
      </div>
    </div>
  );
};

export default Home;
