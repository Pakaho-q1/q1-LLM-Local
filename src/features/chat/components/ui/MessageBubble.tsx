import React, { useState, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
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

export const MessageBubble: React.FC<
  MessageBubbleProps & { animIndex?: number }
> = ({ msg, onEdit, onRetry, animIndex = 0 }) => {
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [isThinkingExpanded, setIsThinkingExpanded] = useState(false);

  const { thinkingText, cleanContent } = parseThinking(msg.content);
  const formattedContent = preprocessContent(cleanContent);
  const isUser = msg.role === 'user';

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
          <div
            style={{
              position: 'relative',
              marginTop: 10,
              marginBottom: 10,
              borderRadius: 10,
              overflow: 'hidden',
              background: 'var(--bg-code)',
              border: '1px solid var(--border)',
            }}
          >
            {/* Code header */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '6px 14px',
                background: 'rgba(0,0,0,0.3)',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <span
                style={{
                  fontSize: '0.72rem',
                  color: 'rgba(255,255,255,0.5)',
                  fontFamily: 'monospace',
                  letterSpacing: '0.05em',
                }}
              >
                {match[1].toUpperCase()}
              </span>
              <button
                onClick={() => handleCopyCode(codeString)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  fontSize: '0.72rem',
                  color:
                    copiedText === codeString
                      ? '#10b981'
                      : 'rgba(255,255,255,0.5)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'color 0.15s',
                  padding: '2px 6px',
                  borderRadius: 5,
                }}
              >
                {copiedText === codeString ? (
                  <Check size={12} />
                ) : (
                  <Copy size={12} />
                )}
                {copiedText === codeString ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <SyntaxHighlighter
              style={oneDark}
              language={match[1]}
              PreTag="div"
              customStyle={{
                margin: 0,
                borderRadius: 0,
                background: 'transparent',
                fontSize: '0.84rem',
              }}
              {...props}
            >
              {codeString}
            </SyntaxHighlighter>
          </div>
        ) : (
          <code
            style={{
              background: 'var(--bg-code)',
              color: '#e06c75',
              padding: '0.12em 0.42em',
              borderRadius: 5,
              fontSize: '0.86em',
              fontFamily: "'JetBrains Mono','Fira Code',monospace",
            }}
            {...props}
          >
            {children}
          </code>
        );
      },

      table: ({ node, ...props }: any) => (
        <div style={{ overflowX: 'auto', margin: '16px 0' }}>
          <table
            style={{
              minWidth: '100%',
              borderCollapse: 'collapse',
              border: '1px solid var(--border)',
              borderRadius: 8,
              overflow: 'hidden',
            }}
            {...props}
          />
        </div>
      ),
      thead: ({ node, ...props }: any) => (
        <thead style={{ background: 'var(--bg-elevated)' }} {...props} />
      ),
      tbody: ({ node, ...props }: any) => <tbody {...props} />,
      tr: ({ node, ...props }: any) => (
        <tr
          style={{
            borderBottom: '1px solid var(--border)',
            transition: 'background 0.12s',
          }}
          {...props}
        />
      ),
      th: ({ node, ...props }: any) => (
        <th
          style={{
            padding: '10px 14px',
            textAlign: 'left',
            fontSize: '0.78rem',
            fontWeight: 600,
            color: 'var(--text-secondary)',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
          }}
          {...props}
        />
      ),
      td: ({ node, ...props }: any) => (
        <td
          style={{
            padding: '9px 14px',
            fontSize: '0.875rem',
            color: 'var(--text-primary)',
          }}
          {...props}
        />
      ),
      blockquote: ({ node, ...props }: any) => (
        <blockquote
          style={{
            borderLeft: '3px solid var(--accent)',
            background: 'var(--accent-subtle)',
            padding: '10px 16px',
            margin: '12px 0',
            borderRadius: '0 8px 8px 0',
            color: 'var(--text-secondary)',
            fontStyle: 'normal',
          }}
          {...props}
        />
      ),
    }),
    [copiedText],
  );

  return (
    <div
      className={`flex w-full px-2 py-1 group ${isUser ? 'justify-end' : 'justify-start'}`}
      style={{
        animation: `fadeIn 0.22s cubic-bezier(0.16,1,0.3,1) ${Math.min(animIndex * 0.03, 0.15)}s both`,
      }}
    >
      {/* AI avatar */}
      {!isUser && (
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            background: 'var(--accent-subtle)',
            border:
              '1px solid color-mix(in srgb, var(--accent) 25%, transparent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            marginRight: 10,
            marginTop: 4,
          }}
        >
          <span
            style={{
              fontSize: '0.65rem',
              fontWeight: 700,
              color: 'var(--accent)',
            }}
          >
            AI
          </span>
        </div>
      )}

      <div
        style={{
          maxWidth: isUser ? '75%' : '90%',
          position: 'relative',
        }}
      >
        <div
          style={{
            padding: isUser ? '10px 14px' : '12px 16px',
            borderRadius: isUser ? '18px 18px 6px 18px' : '4px 18px 18px 18px',
            background: isUser ? 'var(--bg-bubble-user)' : 'var(--bg-surface)',
            color: isUser ? 'var(--text-bubble-user)' : 'var(--text-bubble-ai)',
            border: isUser ? 'none' : '1px solid var(--border)',
            boxShadow: isUser
              ? '0 2px 12px color-mix(in srgb, var(--accent) 25%, transparent)'
              : 'var(--shadow-sm)',
            transition: 'box-shadow 0.15s',
          }}
        >
          {/* Thinking */}
          {thinkingText && (
            <div
              style={{
                marginBottom: 10,
                borderRadius: 8,
                overflow: 'hidden',
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border)',
              }}
            >
              <button
                onClick={() => setIsThinkingExpanded((p) => !p)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 12px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-secondary)',
                  fontSize: '0.8rem',
                  fontWeight: 500,
                  transition: 'background 0.12s',
                }}
              >
                <BrainCircuit
                  size={14}
                  style={{
                    color: msg.isTyping
                      ? 'var(--accent)'
                      : 'var(--text-secondary)',
                    flexShrink: 0,
                    animation: msg.isTyping
                      ? 'pulseDot 1.5s ease-in-out infinite'
                      : 'none',
                  }}
                />
                <span style={{ flex: 1, textAlign: 'left' }}>
                  {msg.isTyping && !formattedContent
                    ? 'Thinking…'
                    : 'Chain of thought'}
                </span>
                {isThinkingExpanded ? (
                  <ChevronDown size={13} />
                ) : (
                  <ChevronRight size={13} />
                )}
              </button>
              {isThinkingExpanded && (
                <div
                  style={{
                    padding: '10px 12px',
                    borderTop: '1px solid var(--border)',
                    fontSize: '0.8rem',
                    lineHeight: 1.6,
                    color: 'var(--text-secondary)',
                    whiteSpace: 'pre-wrap',
                    fontFamily: "'JetBrains Mono','Fira Code',monospace",
                    animation: 'fadeIn 0.18s both',
                  }}
                >
                  {thinkingText}
                </div>
              )}
            </div>
          )}

          {/* Attachments */}
          {msg.attachments?.length > 0 && (
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 8,
                marginBottom: 10,
              }}
            >
              {msg.attachments.map((file: any, idx: number) =>
                file.type?.startsWith('image/') ? (
                  <img
                    key={idx}
                    src={file.url}
                    alt={file.name || 'attachment'}
                    style={{
                      maxWidth: 280,
                      maxHeight: 200,
                      borderRadius: 10,
                      objectFit: 'contain',
                      border: '1px solid var(--border)',
                    }}
                  />
                ) : (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '6px 10px',
                      borderRadius: 8,
                      background: 'var(--bg-elevated)',
                      border: '1px solid var(--border)',
                      fontSize: '0.8rem',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    <Paperclip size={13} />
                    <span
                      style={{
                        maxWidth: 180,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {file.name || 'File'}
                    </span>
                  </div>
                ),
              )}
            </div>
          )}

          {/* Typing indicator */}
          {msg.isTyping && !formattedContent && !thinkingText && (
            <div
              style={{
                display: 'flex',
                gap: 5,
                alignItems: 'center',
                padding: '4px 0',
              }}
            >
              <span className="typing-dot" />
              <span className="typing-dot" />
              <span className="typing-dot" />
            </div>
          )}

          {/* Content */}
          {formattedContent && (
            <div className={`prose prose-sm${isUser ? '' : ''}`}>
              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeKatex]}
                components={markdownComponents}
              >
                {formattedContent}
              </ReactMarkdown>
              {msg.isTyping && <span className="cursor-blink" />}
            </div>
          )}
        </div>

        {/* Action buttons (hover) */}
        <div
          style={{
            position: 'absolute',
            bottom: -22,
            right: isUser ? 4 : 'auto',
            left: isUser ? 'auto' : 4,
            display: 'flex',
            gap: 6,
            opacity: 0,
            transition: 'opacity 0.15s',
          }}
          className="group-hover:opacity-100"
        >
          {msg.role === 'user' && onEdit && (
            <button
              onClick={() => onEdit(msg)}
              title="Edit message"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                padding: '3px 8px',
                borderRadius: 6,
                fontSize: '0.72rem',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                transition: 'color 0.12s',
              }}
            >
              <Edit2 size={11} /> Edit
            </button>
          )}
          {msg.role === 'model' && onRetry && (
            <button
              onClick={() => onRetry(msg)}
              title="Regenerate response"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                padding: '3px 8px',
                borderRadius: 6,
                fontSize: '0.72rem',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                transition: 'color 0.12s',
              }}
            >
              <RefreshCw size={11} /> Retry
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
