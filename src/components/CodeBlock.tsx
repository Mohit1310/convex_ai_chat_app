import { CheckIcon, CopyIcon, WrapTextIcon, ChevronDownIcon, ChevronRightIcon } from "lucide-react";
import { useEffect, useState } from "react";
import hljs from "highlight.js";
import "highlight.js/styles/github-dark.css";

interface CodeBlockProps {
  code: string;
  language: string;
}

export function CodeBlock({ code, language }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const [wrap, setWrap] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [highlightedCode, setHighlightedCode] = useState("");

  useEffect(() => {
    const highlighted = hljs.highlight(code, { language }).value;
    setHighlightedCode(highlighted);
  }, [code, language]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const codeLines = highlightedCode.split("\n");

  return (
    <div className="my-4 rounded-lg overflow-hidden border border-gray-200">
      <div className="bg-gray-50 px-4 py-2 flex items-center justify-between border-b border-gray-200">
        <div className="flex items-center gap-2">
          <button onClick={() => setCollapsed(!collapsed)} className="text-gray-600 hover:text-gray-800">
            {collapsed ? <ChevronRightIcon size={16} /> : <ChevronDownIcon size={16} />}
          </button>
          <span className="text-sm font-medium text-gray-600 capitalize">{language}</span>
        </div>
        <div className="flex items-center gap-3 text-sm text-gray-500">
          <button onClick={() => setWrap(!wrap)} className="hover:text-gray-700 flex items-center space-x-1 transition-colors">
            <WrapTextIcon size={16} />
          </button>
          <button onClick={handleCopy} className="hover:text-gray-700 flex items-center space-x-1 transition-colors">
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

      {!collapsed && (
        <div className="bg-gray-900 text-gray-100 text-sm overflow-x-auto">
          <pre className={`flex ${wrap ? "whitespace-pre-wrap break-words" : "whitespace-pre"}`}>
            <code className={`hljs language-${language} flex`}>
              {codeLines.map((line, index) => (
                <div key={index} className="flex">
                  <span className="select-none pr-4 text-gray-500 text-right w-8">{index + 1}</span>
                  <span dangerouslySetInnerHTML={{ __html: line || " " }} />
                </div>
              ))}
            </code>
          </pre>
        </div>
      )}
    </div>
  );
}
