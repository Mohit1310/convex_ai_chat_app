import { useState } from "react";
import { CodeBlock } from "./CodeBlock";

interface Message {
  _id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: number;
}

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const renderContent = (content: string) => {
    // Split content by code blocks
    const parts = content.split(/(```[\s\S]*?```)/g);
    
    return parts.map((part, index) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        // Extract language and code
        const lines = part.slice(3, -3).split('\n');
        const language = lines[0].trim() || 'text';
        const code = lines.slice(1).join('\n');
        
        return (
          <CodeBlock
            key={index}
            code={code}
            language={language}
          />
        );
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

  if (message.role === "user") {
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
          {renderContent(message.content)}
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
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Copied</span>
              </>
            ) : (
              <>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
