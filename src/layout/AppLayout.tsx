import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useState } from 'react';
import { Id } from '../../convex/_generated/dataModel';
import { useNavigate } from 'react-router-dom';

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const chats = useQuery(api.chats.listChats);

  const handleChatSelect = (chatId: Id<'chats'>) => {
    navigate(`/chat/${chatId}`);
  };

  const handleNewChat = () => {
    navigate('/chat');
  };

  return (
    <div className="h-screen flex bg-gray-50">
      <Sidebar
        chats={chats || []}
        currentChatId={null}
        onChatSelect={handleChatSelect}
        onNewChat={handleNewChat}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />
      <main className="flex-1 flex flex-col overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
}
