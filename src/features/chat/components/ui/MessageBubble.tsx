import React, { useState, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import {
  Copy,
  Check,
  BrainCircuit,
  ChevronDown,
  ChevronRight,
  Edit2,
  RefreshCw,
  Paperclip,
} from 'lucide-react';
import { MermaidBlock } from './mermaid-repair-engine/MermaidBlock';
import { parseThinking, preprocessContent } from './utils';
import { MessageBubbleProps } from './types';

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  msg,
  onEdit,
  onRetry,
}) => {
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [isThinkingExpanded, setIsThinkingExpanded] = useState<boolean>(false);

  const { thinkingText, cleanContent } = parseThinking(msg.content);
  const formattedContent = preprocessContent(cleanContent);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedText(code);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const markdownComponents = useMemo(
    () => ({
      code({ node, inline, className, children, ...props }: any) {
        const match = /language-(\w+)/.exec(className || '');
        const codeString = String(children).replace(/\n$/, '');

        if (!inline && match && match[1] === 'mermaid') {
          return <MermaidBlock codeString={codeString} />;
        }

        return !inline && match ? (
          <div className="relative group/code mt-2 rounded-md overflow-hidden bg-[#1E1E1E]">
            <div className="flex justify-between items-center px-4 py-1 bg-slate-900 text-slate-400 text-xs">
              <span>{match[1]}</span>
              <button
                onClick={() => handleCopyCode(codeString)}
                className="hover:text-white transition-colors"
              >
                {copiedText === codeString ? (
                  <Check size={14} className="text-green-400" />
                ) : (
                  <Copy size={14} />
                )}
              </button>
            </div>
            <SyntaxHighlighter
              style={vscDarkPlus}
              language={match[1]}
              PreTag="div"
              customStyle={{ margin: 0, borderRadius: 0 }}
              {...props}
            >
              {codeString}
            </SyntaxHighlighter>
          </div>
        ) : (
          <code
            className="bg-slate-900 text-red-400 px-1 py-0.5 rounded text-sm"
            {...props}
          >
            {children}
          </code>
        );
      },
      table: ({ node, ...props }: any) => (
        <div className="overflow-x-auto my-5">
          <table
            className="min-w-full divide-y divide-slate-700 border border-slate-700 rounded-lg overflow-hidden"
            {...props}
          />
        </div>
      ),
      thead: ({ node, ...props }: any) => (
        <thead className="bg-slate-800" {...props} />
      ),
      tbody: ({ node, ...props }: any) => (
        <tbody
          className="divide-y divide-slate-700/50 bg-slate-800/30"
          {...props}
        />
      ),
      tr: ({ node, ...props }: any) => (
        <tr className="hover:bg-slate-700/30 transition-colors" {...props} />
      ),
      th: ({ node, ...props }: any) => (
        <th
          className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider"
          {...props}
        />
      ),
      td: ({ node, ...props }: any) => (
        <td className="px-4 py-3 text-sm text-slate-300" {...props} />
      ),
      blockquote: ({ node, ...props }: any) => (
        <blockquote
          className="border-l-4 border-blue-500 bg-slate-800/50 pl-4 py-2.5 my-4 italic text-slate-300 rounded-r-lg shadow-sm"
          {...props}
        />
      ),
    }),
    [copiedText],
  );

  return (
    <div
      className={`flex w-full px-4 py-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'} group`}
    >
      <div
        className={`max-w-[85%] sm:max-w-[75%] p-4 rounded-2xl relative ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-200 border border-slate-700 shadow-sm'}`}
      >
        {/* Thinking Process */}
        {thinkingText && (
          <div className="mb-3 border border-slate-600 rounded-lg bg-slate-900/50 overflow-hidden">
            <button
              onClick={() => setIsThinkingExpanded(!isThinkingExpanded)}
              className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-800 text-slate-400 text-sm font-medium transition-colors"
            >
              <BrainCircuit
                size={16}
                className={msg.isTyping ? 'animate-pulse text-blue-400' : ''}
              />
              <span>
                {msg.isTyping && !formattedContent
                  ? 'กำลังคิด...'
                  : 'กระบวนการคิด'}
              </span>
              {isThinkingExpanded ? (
                <ChevronDown size={16} className="ml-auto" />
              ) : (
                <ChevronRight size={16} className="ml-auto" />
              )}
            </button>
            {isThinkingExpanded && (
              <div className="p-3 text-sm text-slate-400 border-t border-slate-700 whitespace-pre-wrap">
                {thinkingText}
              </div>
            )}
          </div>
        )}

        {/* Attachments */}
        {msg.attachments && msg.attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {msg.attachments.map((file, idx) =>
              file.type.startsWith('image/') ? (
                <img
                  key={idx}
                  src={file.url}
                  alt={file.name || 'attachment'}
                  className="max-w-sm max-h-64 rounded-lg object-contain bg-black/10 border border-slate-600/50 shadow-sm"
                />
              ) : (
                <div
                  key={idx}
                  className="flex items-center gap-2 bg-slate-900/50 p-2 rounded-lg border border-slate-700/50 text-sm text-slate-300"
                >
                  <Paperclip size={16} className="text-slate-400" />
                  <span className="truncate max-w-[200px]">
                    {file.name || 'Flie'}
                  </span>
                </div>
              ),
            )}
          </div>
        )}

        {/* Markdown Content */}
        {formattedContent && (
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <ReactMarkdown
              remarkPlugins={[remarkGfm, remarkMath]}
              rehypePlugins={[rehypeKatex]}
              components={markdownComponents}
            >
              {formattedContent}
            </ReactMarkdown>
          </div>
        )}

        {/* Action Buttons */}
        <div className="absolute -bottom-6 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
          {msg.role === 'user' && onEdit && (
            <button
              onClick={() => onEdit(msg)}
              className="text-slate-400 hover:text-blue-400"
              title="แก้ไขข้อความ"
            >
              <Edit2 size={16} />
            </button>
          )}
          {msg.role === 'model' && onRetry && (
            <button
              onClick={() => onRetry(msg)}
              className="text-slate-400 hover:text-green-400"
              title="สร้างคำตอบใหม่"
            >
              <RefreshCw size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
