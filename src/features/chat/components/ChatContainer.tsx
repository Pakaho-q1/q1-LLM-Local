import React, { useState } from 'react';
import { useChat } from '../hooks/useChat';
import { useSettings } from '../../../contexts/SettingsContext';
import { useModelManager } from '../../models/hooks/useModelManager';
import Messageicon from '../../../components/ui/Messageicon';
import { useSSE } from '../../../contexts/SSEContext';
import { ChatMessagesGemini } from './ui/ChatMessagesGemini';
import { ChatInputGemini } from './ui/ChatInputGemini';

export const ChatContainer: React.FC = () => {
  const {
    isConnected,
    messages,
    isGenerating,
    error,
    sendMessage,
    clearError,
  } = useChat();
  const { settings } = useSettings();
  const { unloadModel } = useModelManager();

  const { currentConversation } = useSSE();
  const [editText, setEditText] = useState<string>('');

  const handleEdit = (msg: any) => {
    setEditText(msg.content || '');
  };

  const handleRetry = (msg: any) => {
    const params = {
      temperature: settings.temperature,
      max_tokens: settings.maxTokens,
      top_p: settings.topP,
      top_k: settings.topK,
    };
    sendMessage(msg.content || '', null, params, settings.systemPrompt);
  };

  const handleSendMessage = (text: string, files: File[] = []) => {
    const params = {
      temperature: settings.temperature,
      max_tokens: settings.maxTokens,
      top_p: settings.topP,
      top_k: settings.topK,
    };

    sendMessage(
      text,
      files && files.length > 0 ? files[0] : null,
      params,
      settings.systemPrompt,
    );
  };

  if (!currentConversation) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-0 bg-gradient-to-b from-slate-700 via-slate-800 to-slate-900 w-full relative text-slate-400">
        <div className="text-6xl mb-4">
          <Messageicon size={70} color="blue" strokeWidth={2} />
        </div>
        <h2 className="text-2xl font-semibold text-slate-200 mb-2">
          Select a Chat
        </h2>
        <p className="text-slate-400">
          {' '}
          Please select a conversation from the menu or start a new session.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-0 bg-gradient-to-b from-slate-700 via-slate-800 to-slate-900 w-full relative">
      {/* Error Banner */}
      {error && (
        <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-2 text-sm flex justify-between items-center">
          {/* ... */}
        </div>
      )}

      {/* Chat Messages */}
      <ChatMessagesGemini
        messages={messages.map((m) => ({
          id: undefined,
          role: m.role as any,
          content: m.content as string,
          attachments: (m as any).attachments,
        }))}
        onEdit={handleEdit}
        onRetry={handleRetry}
      />

      {/* Chat Input */}
      <ChatInputGemini
        onSend={(text, files) => handleSendMessage(text, files)}
        disabled={!isConnected}
        isGenerating={isGenerating}
        initialText={editText}
        onTextChange={(t) => setEditText(t)}
        onOpenTools={() => console.log('เปิดหน้าต่างเลือก Tools!')}
      />
    </div>
  );
};
