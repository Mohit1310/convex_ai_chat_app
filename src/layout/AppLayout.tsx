import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

export default function AppLayout() {
  const chats = useQuery(api.chats.listChats);

  return (
    <div className="h-screen flex bg-gray-50">
      <Sidebar
        chats={chats || []}
        currentChatId={null}
        onChatSelect={() => {}}
        onNewChat={() => {}}
        isOpen={true}
        onToggle={() => {}}
      />
      <Outlet />
    </div>
  );
}
