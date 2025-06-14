import { useState } from 'react';
import { CodeBlock } from './CodeBlock';
import { CheckIcon, CopyIcon, DownloadIcon, XIcon } from 'lucide-react';
import { toast } from 'sonner';

interface Message {
  _id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  contentType: 'text' | 'image';
  imageData?: string;
  timestamp: number;
}

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const [copied, setCopied] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyImage = async () => {
    if (message.imageData) {
      try {
        // convert base64 to blob
        const response = await fetch(
          `data:image/png;base64,${message.imageData}`
        );
        const blob = await response.blob();

        // copy to clipboard
        await navigator.clipboard.write([
          new ClipboardItem({
            [blob.type]: blob,
          }),
        ]);

        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error: any) {
        toast.error('Failed to copy image:', error);
      }
    }
  };

  const handleDownloadImage = async () => {
    if (message.imageData) {
      const link = document.createElement('a');
      link.href = `data:image/png;base64,${message.imageData}`;
      link.download = `generate-image-${Date.now()}.png`;
      link.click();
      document.body.removeChild(link);
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderContent = (content: string) => {
    // Split image content
    if (content.startsWith('data:image/')) {
      return (
        <img
          src={content}
          alt="Generated"
          className="rounded-lg border border-gray-200 max-w-full"
        />
      );
    }
    // Split content by code blocks
    const parts = content.split(/(```[\s\S]*?```)/g);

    return parts.map((part, index) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        // Extract language and code
        const lines = part.slice(3, -3).split('\n');
        const language = lines[0].trim() || 'text';
        const code = lines.slice(1).join('\n');

        return <CodeBlock key={index} code={code} language={language} />;
      } else {
        // Regular text with inline code
        const textParts = part.split(/(`[^`]+`)/g);
        return textParts.map((textPart, textIndex) => {
          if (textPart.startsWith('`') && textPart.endsWith('`')) {
            return (
              <code
                key={`${index}-${textIndex}`}
                className="bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded text-sm font-mono"
              >
                {textPart.slice(1, -1)}
              </code>
            );
          }
          return (
            <span key={`${index}-${textIndex}`} className="whitespace-pre-wrap">
              {textPart}
            </span>
          );
        });
      }
    });
  };

  if (message.role === 'user') {
    return (
      <div className="flex items-start justify-end space-x-3">
        <div className="bg-blue-600 text-white rounded-2xl rounded-tr-sm px-4 py-3 max-w-3xl shadow-sm">
          <div className="whitespace-pre-wrap">{message.content}</div>
          <div className="text-xs text-blue-100 mt-2 text-right">
            {formatTime(message.timestamp)}
          </div>
        </div>
        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center shrink-0">
          <span className="text-white font-bold text-xs">U</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start space-x-3">
      <div className="w-8 h-8 bg-linear-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center shrink-0">
        <span className="text-white font-bold text-xs">AI</span>
      </div>
      <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm border border-gray-200 max-w-3xl group">
        <div className="prose prose-sm max-w-none">
          {message.contentType === 'image' && message.imageData ? (
            <div className="space-y-3">
              <div className="text-sm text-gray-700">{message.content}</div>
              <div className="relative">
                {!imageLoaded && !imageError ? (
                  <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                    <div className="flex items-center space-x-2 text-gray-500">
                      <div className="size-5 border-gray-500 border-t-blue-500 rounded-full animate-spin"></div>
                      <span className="text-sm">Loading Image...</span>
                    </div>
                  </div>
                ) : null}
                {imageError ? (
                  <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <XIcon />
                      <p className="text-sm">Failed to load image</p>
                    </div>
                  </div>
                ) : null}
                <img
                  src={`data:image/png;base64,${message.imageData}`}
                  alt="Generated"
                  className={`max-w-full h-auto rounded-lg shadow-sm ${imageLoaded ? 'block' : 'hidden'}`}
                  onLoad={() => setImageLoaded(true)}
                  onError={() => setImageError(true)}
                />
                {imageLoaded ? (
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex space-x-1">
                      <button
                        onClick={handleCopyImage}
                        className="p-2 bg-black bg-opacity-50 text-white rounded-lg hover:bg-opacity-70 transition-colors"
                      >
                        <CheckIcon size={16} />
                        <span>Copy</span>
                      </button>
                      <button
                        onClick={handleDownloadImage}
                        className="p-2 bg-black bg-opacity-50 text-white rounded-lg hover:bg-opacity-70 transition-colors"
                      >
                        <DownloadIcon size={16} />
                        <span>Download</span>
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          ) : (
            renderContent(message.content)
          )}
        </div>
        <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100">
          <div className="text-xs text-gray-500">
            {formatTime(message.timestamp)}
          </div>
          <button
            onClick={handleCopy}
            className="opacity-0 group-hover:opacity-100 transition-opacity text-xs text-gray-500 hover:text-gray-700 flex items-center space-x-1"
          >
            {copied ? (
              <>
                <CheckIcon size={16} />
                <span>Copied</span>
              </>
            ) : (
              <>
                <CopyIcon size={16} />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
