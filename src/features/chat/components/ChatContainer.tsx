import React, { useState } from 'react';
import { useChat } from '../hooks/useChat';
import { useSettings } from '@/contexts/SettingsContext';
import { useModelManager } from '@/features/models/hooks/useModelManager';
import { useSSE } from '@/contexts/SSEContext';
import { ChatMessagesGemini } from './ui/ChatMessagesGemini';
import { ChatInputGemini } from './ui/ChatInputGemini';
import { X, Sparkles, Zap, Code2, BookOpen, ArrowRight } from 'lucide-react';

const QUICK_PROMPTS = [
  {
    icon: <Code2 size={15} />,
    label: 'Write code',
    prompt: 'Help me write a Python script to ',
  },
  {
    icon: <Sparkles size={15} />,
    label: 'Brainstorm',
    prompt: 'Help me brainstorm ideas for ',
  },
  {
    icon: <BookOpen size={15} />,
    label: 'Explain',
    prompt: 'Explain this concept simply: ',
  },
  {
    icon: <Zap size={15} />,
    label: 'Quick task',
    prompt: 'Summarize the following: ',
  },
];

const IdleScreen: React.FC<{ onQuickPrompt: (t: string) => void }> = ({
  onQuickPrompt,
}) => (
  <div
    className="flex flex-col items-center justify-center h-full w-full"
    style={{ background: 'var(--bg-base)', padding: '0 24px' }}
  >
    {/* Logo */}
    <div
      style={{
        marginBottom: 28,
        animation: 'fadeIn 0.5s cubic-bezier(0.16,1,0.3,1) both',
      }}
    >
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: 20,
          position: 'relative',
          overflow: 'hidden',
          background:
            'linear-gradient(135deg, var(--accent) 0%, color-mix(in srgb, var(--accent) 60%, #818cf8) 100%)',
          boxShadow:
            '0 8px 32px color-mix(in srgb, var(--accent) 35%, transparent)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(120deg, transparent 20%, rgba(255,255,255,0.18) 50%, transparent 80%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 2.5s linear infinite',
          }}
        />
        <span
          style={{
            fontSize: '1.5rem',
            fontWeight: 800,
            color: '#fff',
            position: 'relative',
            letterSpacing: '-0.04em',
          }}
        >
          AI
        </span>
      </div>
    </div>

    <h1
      style={{
        fontSize: '1.5rem',
        fontWeight: 700,
        color: 'var(--text-primary)',
        letterSpacing: '-0.03em',
        margin: '0 0 10px',
        animation: 'fadeIn 0.5s 0.08s both',
      }}
    >
      What can I help you with?
    </h1>
    <p
      style={{
        fontSize: '0.9rem',
        color: 'var(--text-secondary)',
        textAlign: 'center',
        marginBottom: 36,
        maxWidth: 380,
        lineHeight: 1.6,
        animation: 'fadeIn 0.5s 0.14s both',
      }}
    >
      Start a new chat or select a conversation from the sidebar. You can also
      type below to begin.
    </p>

    {/* Quick-start cards */}
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: 10,
        width: '100%',
        maxWidth: 460,
        animation: 'fadeIn 0.5s 0.2s both',
      }}
    >
      {QUICK_PROMPTS.map((p, i) => (
        <button
          key={i}
          onClick={() => onQuickPrompt(p.prompt)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '12px 14px',
            borderRadius: 12,
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            color: 'var(--text-primary)',
            cursor: 'pointer',
            textAlign: 'left',
            boxShadow: 'var(--shadow-sm)',
            transition: 'all 0.15s cubic-bezier(0.16,1,0.3,1)',
            animationDelay: `${0.22 + i * 0.05}s`,
            animation: 'fadeIn 0.5s cubic-bezier(0.16,1,0.3,1) both',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor =
              'color-mix(in srgb, var(--accent) 40%, transparent)';
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow =
              '0 4px 16px color-mix(in srgb, var(--accent) 12%, transparent)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--border)';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
          }}
        >
          <span
            style={{ color: 'var(--accent)', flexShrink: 0, opacity: 0.85 }}
          >
            {p.icon}
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{ fontSize: '0.83rem', fontWeight: 600, marginBottom: 1 }}
            >
              {p.label}
            </div>
            <div
              style={{
                fontSize: '0.75rem',
                color: 'var(--text-tertiary)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {p.prompt}…
            </div>
          </div>
          <ArrowRight
            size={13}
            style={{
              color: 'var(--text-tertiary)',
              flexShrink: 0,
              opacity: 0.6,
            }}
          />
        </button>
      ))}
    </div>

    <p
      style={{
        marginTop: 28,
        fontSize: '0.77rem',
        color: 'var(--text-tertiary)',
        animation: 'fadeIn 0.5s 0.45s both',
      }}
    >
      Press{' '}
      <kbd
        style={{
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border)',
          borderRadius: 4,
          padding: '1px 5px',
          fontSize: '0.72rem',
          fontFamily: 'monospace',
        }}
      >
        ↵ Enter
      </kbd>{' '}
      to send ·{' '}
      <kbd
        style={{
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border)',
          borderRadius: 4,
          padding: '1px 5px',
          fontSize: '0.72rem',
          fontFamily: 'monospace',
        }}
      >
        ⇧ Shift+Enter
      </kbd>{' '}
      for new line
    </p>
  </div>
);

export const ChatContainer: React.FC = () => {
  const {
    isConnected,
    messages,
    isGenerating,
    error,
    sendMessage,
    stopGeneration,
    clearError,
  } = useChat();
  const { settings } = useSettings();
  const { currentConversation } = useSSE();
  const [editText, setEditText] = useState('');
  const [idleInput, setIdleInput] = useState('');

  const handleSendMessage = (text: string, files: File[] = []) => {
    sendMessage(
      text,
      files[0] ?? null,
      {
        temperature: settings.temperature,
        max_tokens: settings.maxTokens,
        top_p: settings.topP,
        top_k: settings.topK,
      },
      settings.systemPrompt,
    );
  };

  const handleRetry = (msg: any) => handleSendMessage(msg.content || '');
  const handleEdit = (msg: any) => setEditText(msg.content || '');

  if (!currentConversation) {
    return (
      <div
        className="flex flex-col h-full min-h-0 w-full"
        style={{ background: 'var(--bg-base)' }}
      >
        <div className="flex-1 min-h-0 overflow-hidden">
          <IdleScreen onQuickPrompt={(text) => setIdleInput(text)} />
        </div>
        <ChatInputGemini
          onSend={(text, files) => handleSendMessage(text, files)}
          onStop={stopGeneration}
          disabled={!isConnected}
          isGenerating={isGenerating}
          initialText={idleInput}
          onTextChange={setIdleInput}
          onOpenTools={() => {}}
        />
      </div>
    );
  }

  return (
    <div
      className="flex flex-col h-full min-h-0 w-full"
      style={{ background: 'var(--bg-base)' }}
    >
      {/* Error banner */}
      {error && (
        <div
          className="flex items-center justify-between px-4 py-2.5 text-sm shrink-0"
          style={{
            background: 'color-mix(in srgb, var(--danger) 10%, transparent)',
            borderBottom:
              '1px solid color-mix(in srgb, var(--danger) 30%, transparent)',
            color: 'var(--danger)',
            animation: 'fadeIn 0.2s both',
          }}
        >
          <span>{error}</span>
          <button
            onClick={clearError}
            className="icon-btn"
            style={{ width: 24, height: 24, color: 'var(--danger)' }}
          >
            <X size={13} />
          </button>
        </div>
      )}

      <ChatMessagesGemini
        messages={messages.map((m) => ({
          id: undefined,
          role: m.role as any,
          content: m.content as string,
          attachments: (m as any).attachments,
          isTyping: (m as any).isTyping,
        }))}
        onEdit={handleEdit}
        onRetry={handleRetry}
      />

      <ChatInputGemini
        onSend={(text, files) => handleSendMessage(text, files)}
        onStop={stopGeneration}
        disabled={!isConnected}
        isGenerating={isGenerating}
        initialText={editText}
        onTextChange={setEditText}
        onOpenTools={() => {}}
      />
    </div>
  );
};
