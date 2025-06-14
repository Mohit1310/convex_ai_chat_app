import { useState, useRef, useEffect } from 'react';
import { useAction } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Textarea } from './ui/textarea';
import { SendIcon } from 'lucide-react';
import { Button } from './ui/button';

interface MessageInputProps {
  onSendMessage: (content: string, model?: string) => void;
  onGenrateImage: (prompt: string) => void;
  disabled: boolean;
  currentModel?: string;
}

export function MessageInput({
  onSendMessage,
  onGenrateImage,
  disabled,
  currentModel,
}: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [showModelSelector, setShowModelSelector] = useState(false);
  const [selectedModel, setSelectedModel] = useState(
    currentModel || 'gemini-2.5-flash-preview-05-20'
  );
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const getModels = useAction(api.ai.getAvailableModels);
  const [models, setModels] = useState<
    Array<{ id: string; name: string; provider: string }>
  >([]);

  useEffect(() => {
    const loadModels = async () => {
      try {
        const availableModels = await getModels();
        setModels(availableModels);
      } catch (error) {
        console.error('Failed to load models:', error);
      }
    };
    loadModels();
  }, [getModels]);

  useEffect(() => {
    if (currentModel) {
      setSelectedModel(currentModel);
    }
  }, [currentModel]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim && !disabled) {
      const isImageGeneration =
        selectedModel === 'gemini-2.5-flash-preview-05-20';

      if (isImageGeneration) {
        onGenrateImage(message.trim());
      } else {
        onSendMessage(message.trim(), selectedModel || currentModel);
      }
    }
    // if (message.trim() && !disabled) {
    //   onSendMessage(message.trim(), selectedModel);
    //   setMessage("");
    //   if (textareaRef.current) {
    //     textareaRef.current.style.height = 'auto';
    //   }
    // }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [message]);

  const currentModelData = models.find(
    (m) => m.id === (selectedModel || currentModel)
  );
  const isImageGeneration = selectedModel === 'gemini-2.5-flash-preview-05-20';

  return (
    <div className="sticky bottom-0 bg-white border-t border-gray-200 z-10">
      <div className="max-w-4xl mx-auto p-4">
        <form onSubmit={handleSubmit} className="relative">
          <div className="flex items-end space-x-3">
            {/* Model Selector */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowModelSelector(!showModelSelector)}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                title="Select AI Model"
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
                    d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </button>

              {showModelSelector && (
                <div className="absolute bottom-full left-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg py-2 min-w-48 z-10">
                  <div className="px-3 py-2 text-xs font-medium text-gray-500 border-b border-gray-100">
                    Select AI Model
                  </div>
                  {models.map((model) => (
                    <button
                      key={model.id}
                      type="button"
                      onClick={() => {
                        setSelectedModel(model.id);
                        setShowModelSelector(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors ${
                        selectedModel === model.id
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-gray-700'
                      }`}
                    >
                      <div className="font-medium">{model.name}</div>
                      <div className="text-xs text-gray-500 capitalize">
                        {model.provider}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Message Input */}
            <div className="flex-1 relative">
              <Textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                className="w-full resize-none"
                disabled={disabled}
              />

              {/* Model indicator */}
              {currentModelData && (
                <div className="absolute bottom-2 right-12 flex items-center space-x-1">
                  <div
                    className={`w-2 h-2 rounded-full ${isImageGeneration ? 'bg-purple-500' : 'bg-blue-500'}`}
                  />
                  <span className="text-xs text-gray-500 capitalize">
                    {currentModelData.name.split(' ').slice(0, 2).join(' ')}
                  </span>
                </div>
              )}

              {/* Send Button */}
              <Button
                type="submit"
                disabled={!message.trim() || disabled}
                className="absolute right-2 bottom-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <SendIcon className="rotate-45" />
              </Button>
            </div>
          </div>

          {/* Model indicator */}
          <div className="mt-2 text-xs text-gray-500 flex items-center space-x-2">
            <span>Using:</span>
            <span className="font-medium capitalize">
              {models.find((m) => m.id === selectedModel)?.name ||
                selectedModel.replace('-', ' ')}
            </span>
          </div>
        </form>
      </div>
    </div>
  );
}
