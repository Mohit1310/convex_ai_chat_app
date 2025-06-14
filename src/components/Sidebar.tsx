import { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { PlusIcon, XIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Chat {
  _id: Id<'chats'>;
  title: string;
  model: string;
  updatedAt: number;
}

interface SidebarProps {
  chats: Chat[];
  currentChatId?: Id<'chats'> | null;
  onChatSelect: (chatId: Id<'chats'>) => void;
  onNewChat: () => void;
  isOpen: boolean;
  onToggle: () => void;
}

export function Sidebar({
  chats,
  currentChatId,
  onChatSelect,
  onNewChat,
  isOpen,
  onToggle,
}: SidebarProps) {
  const [editingChatId, setEditingChatId] = useState<Id<'chats'> | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const updateChatTitle = useMutation(api.chats.updateChatTitle);
  const deleteChat = useMutation(api.chats.deleteChat);

  const handleEditStart = (chat: Chat) => {
    setEditingChatId(chat._id);
    setEditTitle(chat.title);
  };

  const handleEditSave = async (chatId: Id<'chats'>) => {
    if (editTitle.trim()) {
      try {
        await updateChatTitle({ chatId, title: editTitle.trim() });
        setEditingChatId(null);
      } catch (error) {
        toast.error('Failed to update chat title');
      }
    }
  };

  const handleEditCancel = () => {
    setEditingChatId(null);
    setEditTitle('');
  };

  const handleDelete = async (chatId: Id<'chats'>) => {
    if (confirm('Are you sure you want to delete this chat?')) {
      try {
        await deleteChat({ chatId });
        if (currentChatId === chatId) {
          // If deleting current chat, select another or clear
          const remainingChats = chats.filter((c) => c._id !== chatId);
          if (remainingChats.length > 0) {
            onChatSelect(remainingChats[0]._id);
          }
        }
        toast.success('Chat deleted');
      } catch (error) {
        toast.error('Failed to delete chat');
      }
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
    } else if (diffInHours < 24 * 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed lg:relative inset-y-0 left-0 z-50 w-80 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <Link to="/" className="flex items-center space-x-3">
                <img src="/logo.svg" alt="Logo" className="w-8 h-8" />
                <h2 className="text-lg font-semibold text-gray-900">AI Chat</h2>
              </Link>
              <button
                onClick={onToggle}
                className="p-1 hover:bg-gray-100 rounded lg:hidden"
              >
                <XIcon />
              </button>
            </div>
            <Button onClick={onNewChat} className="w-full">
              <PlusIcon />
              <span>New Chat</span>
            </Button>
          </div>

          {/* Chat List */}
          <div className="flex-1 overflow-y-auto">
            {chats.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <p>No chats yet</p>
                <p className="text-sm mt-1">Start a new conversation</p>
              </div>
            ) : (
              <div className="p-2">
                {chats.map((chat) => (
                  <div
                    key={chat._id}
                    className={`
                      group relative p-3 rounded-lg cursor-pointer transition-colors mb-1
                      ${
                        currentChatId === chat._id
                          ? 'bg-blue-50 border border-blue-200'
                          : 'hover:bg-gray-50'
                      }
                    `}
                    onClick={() => onChatSelect(chat._id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        {editingChatId === chat._id ? (
                          <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            onBlur={() => handleEditSave(chat._id)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleEditSave(chat._id);
                              } else if (e.key === 'Escape') {
                                handleEditCancel();
                              }
                            }}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            autoFocus
                            onClick={(e) => e.stopPropagation()}
                          />
                        ) : (
                          <>
                            <h3 className="font-medium text-gray-900 truncate">
                              {chat.title}
                            </h3>
                            <div className="flex items-center justify-between mt-1">
                              <p className="text-xs text-gray-500 capitalize">
                                {chat.model.replace('-', ' ')}
                              </p>
                              <p className="text-xs text-gray-400">
                                {formatDate(chat.updatedAt)}
                              </p>
                            </div>
                          </>
                        )}
                      </div>

                      {editingChatId !== chat._id && (
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-1 ml-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditStart(chat);
                            }}
                            className="p-1 hover:bg-gray-200 rounded text-gray-500 hover:text-gray-700"
                            title="Edit title"
                          >
                            <svg
                              className="w-3 h-3"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(chat._id);
                            }}
                            className="p-1 hover:bg-red-100 rounded text-gray-500 hover:text-red-600"
                            title="Delete chat"
                          >
                            <svg
                              className="w-3 h-3"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
