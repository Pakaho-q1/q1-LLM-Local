import React from 'react';
import { MessageBubble } from './MessageBubble';
import { useSmartScroll } from '../../hooks/useSmartScroll';
import { Message } from './types';
import { ArrowDown } from 'lucide-react';

interface ChatMessagesProps {
  messages: Message[];
  onEdit?: (msg: Message) => void;
  onRetry?: (msg: Message) => void;
}

export const ChatMessagesGemini: React.FC<ChatMessagesProps> = ({
  messages,
  onEdit,
  onRetry,
}) => {
  const { scrollRef, showNewMessageButton, handleScrollToBottomClick } =
    useSmartScroll(messages);

  return (
    <div
      className="relative flex-1 w-full min-h-0"
      style={{ overflow: 'hidden' }}
    >
      <div
        ref={scrollRef}
        className="w-full h-full custom-scrollbar"
        style={{ overflowY: 'auto', paddingTop: 24, paddingBottom: 24 }}
      >
        <div
          className="flex flex-col mx-auto gap-1"
          style={{ maxWidth: '768px', width: '100%', padding: '0 16px' }}
        >
          {messages.map((msg, index) => (
            <MessageBubble
              key={msg.id || index}
              msg={msg}
              onEdit={onEdit}
              onRetry={onRetry}
              animIndex={index}
            />
          ))}
        </div>
      </div>

      {/* Scroll to bottom */}
      {showNewMessageButton && (
        <button
          onClick={handleScrollToBottomClick}
          className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium transition-all"
          style={{
            position: 'absolute',
            right: 24,
            bottom: 16,
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            color: 'var(--text-secondary)',
            boxShadow: 'var(--shadow-md)',
            animation: 'scaleIn 0.18s cubic-bezier(0.16,1,0.3,1) both',
          }}
        >
          <ArrowDown size={14} style={{ color: 'var(--accent)' }} />
          New messages
        </button>
      )}
    </div>
  );
};
