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
    <div className="relative flex-1 w-full h-full min-h-0">
      <div
        ref={scrollRef}
        className="flex-1 w-full h-full min-h-0 overflow-y-auto custom-scrollbar pb-8 pt-4"
      >
        <div className="flex flex-col max-w-5xl mx-auto w-full gap-2 pb-4">
          {messages.map((msg, index) => (
            <MessageBubble
              key={msg.id || index}
              msg={msg}
              onEdit={onEdit}
              onRetry={onRetry}
            />
          ))}
        </div>
      </div>

      {/* ปุ่มกดเพื่อเลื่อนลงล่างสุด (แสดงเมื่อมีข้อความใหม่และผู้ใช้เลื่อนหน้าจอขึ้นไป) */}
      {showNewMessageButton && (
        <button
          onClick={handleScrollToBottomClick}
          className="absolute right-6 bottom-4 flex items-center gap-2 bg-slate-800/30 text-white p-3 rounded-full shadow-xl border border-slate-600 transition-transform hover:scale-105 z-10"
          title="scroll down"
        >
          <ArrowDown size={20} className="text-blue-400 animate-bounce" />
        </button>
      )}
    </div>
  );
};
