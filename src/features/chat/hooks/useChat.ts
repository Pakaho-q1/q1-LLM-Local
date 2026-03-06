import { useState, useEffect, useCallback, useRef } from 'react';
import { useSSE } from '../../../contexts/SSEContext';
import { ChatMessage } from '../../../types/chat.types';

export interface Attachment {
  url: string;
  type: string;
  name?: string;
  file?: File;
}

type InternalMessage = ChatMessage & {
  id: string;
  role: 'user' | 'assistant' | 'system' | 'model';
  attachments?: Attachment[];
  isTyping?: boolean;
};

export const useChat = () => {
  const {
    isConnected,
    sendPayload,
    sendForm,
    lastMessage,
    subscribeToChat,
    error,
    currentConversation,
  } = useSSE();

  const creatingSessionRef = useRef(false);
  const currentConversationRef = useRef<string | null>(currentConversation);

  useEffect(() => {
    currentConversationRef.current = currentConversation;
  }, [currentConversation]);

  const [messages, setMessages] = useState<InternalMessage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);

  const idRef = useRef(0);
  const messagesRef = useRef<InternalMessage[]>([]);
  const createId = () => `msg-${Date.now()}-${idRef.current++}`;

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    if (!lastMessage) return;
    try {
      if (
        lastMessage.type === 'chat_history' &&
        Array.isArray(lastMessage.data)
      ) {
        const historyMessages: InternalMessage[] = (
          lastMessage.data as any[]
        ).map((msg) => ({
          id: createId(),
          role: msg.role || 'user',
          content: msg.content || '',
        }));
        setMessages(historyMessages);
        setChatError(null);
        setIsGenerating(false);
      }
    } catch (err) {
      console.error('Error processing history:', err);
    }
  }, [lastMessage]);

  useEffect(() => {
    const handleIncoming = (msg: any) => {
      try {
        if (msg === '[DONE]') {
          setMessages((prev) => {
            const copy = [...prev];
            const last = copy[copy.length - 1];
            if (last?.role === 'assistant')
              copy[copy.length - 1] = { ...last, isTyping: false };
            return copy;
          });
          setIsGenerating(false);
          return;
        }

        if (msg.choices && Array.isArray(msg.choices)) {
          const delta = msg.choices[0]?.delta;
          const finish = msg.choices[0]?.finish_reason;
          if (delta?.content) appendAssistantChunk(delta.content, msg.id);
          if (finish != null) {
            setIsGenerating(false);
            setMessages((prev) => {
              const copy = [...prev];
              const last = copy[copy.length - 1];
              if (last?.role === 'assistant')
                copy[copy.length - 1] = { ...last, isTyping: false };
              return copy;
            });
          }
          return;
        }

        if (msg.type === 'chunk' && msg.content) {
          appendAssistantChunk(msg.content);
        } else if (msg.type === 'done' || msg.type === 'success') {
          setIsGenerating(false);
          setMessages((prev) => {
            const copy = [...prev];
            const last = copy[copy.length - 1];
            if (last?.role === 'assistant')
              copy[copy.length - 1] = { ...last, isTyping: false };
            return copy;
          });
        } else if (msg.type === 'error') {
          setChatError(msg.message || 'Unknown error');
          setIsGenerating(false);
        }
      } catch (err) {
        setChatError(err instanceof Error ? err.message : 'Processing error');
        setIsGenerating(false);
      }
    };

    return subscribeToChat(handleIncoming);
  }, [subscribeToChat]);

  const appendAssistantChunk = (chunk: string, msgId?: string) => {
    setMessages((prev) => {
      const copy = [...prev];
      const last = copy[copy.length - 1];
      if (last?.role === 'assistant') {
        copy[copy.length - 1] = {
          ...last,
          content: last.content + chunk,
          isTyping: true,
        };
      } else {
        copy.push({
          id: msgId || createId(),
          role: 'assistant',
          content: chunk,
          isTyping: true,
        });
      }
      return copy;
    });
  };

  const stopGeneration = useCallback(async () => {
    setIsGenerating(false);

    setMessages((prev) => {
      const copy = [...prev];
      const last = copy[copy.length - 1];
      if (last?.role === 'assistant')
        copy[copy.length - 1] = { ...last, isTyping: false };
      return copy;
    });
    try {
      await sendPayload({ action: 'stop_generation' });
    } catch (_) {}
  }, [sendPayload]);

  const sendMessage = useCallback(
    async (
      text: string,
      file: File | null = null,
      params: Record<string, unknown> = {},
      systemPrompt = '',
    ) => {
      if ((!text.trim() && !file) || !isConnected || isGenerating) return;

      try {
        setChatError(null);

        let attachments: Attachment[] | undefined;
        if (file) {
          attachments = [
            {
              url: URL.createObjectURL(file),
              type: file.type,
              name: file.name,
              file,
            },
          ];
        }

        const userMsg: InternalMessage = {
          id: createId(),
          role: 'user',
          content: text,
          attachments,
        };
        setIsGenerating(true);
        setMessages((prev) => {
          const next = [...prev, userMsg];
          messagesRef.current = next;
          return next;
        });

        let history = messagesRef.current.map((m) => ({
          role: m.role,
          content: m.content,
        }));
        if (systemPrompt.trim())
          history = [{ role: 'system', content: systemPrompt }, ...history];

        if (!currentConversationRef.current && !creatingSessionRef.current) {
          creatingSessionRef.current = true;
          try {
            await sendPayload({
              action: 'create_session',
              title: text.slice(0, 60) || 'New Chat',
            });
            const start = Date.now();
            while (
              !currentConversationRef.current &&
              Date.now() - start < 5000
            ) {
              await new Promise((r) => setTimeout(r, 100));
            }
          } finally {
            creatingSessionRef.current = false;
          }
        }

        const request_id = `req_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

        if (file) {
          const fd = new FormData();
          fd.append('file', file, file.name);
          fd.append('action', 'chat_with_file');
          fd.append('content', text);
          fd.append('messages', JSON.stringify(history));
          fd.append('params', JSON.stringify(params));
          fd.append('request_id', request_id);
          if (currentConversationRef.current)
            fd.append('conversation_id', currentConversationRef.current);

          await sendForm('chat_file', fd);
        } else {
          const payload: Record<string, unknown> = {
            action: 'chat',
            content: text,
            messages: history,
            params,
            request_id,
          };
          if (currentConversationRef.current)
            payload.conversation_id = currentConversationRef.current;
          await sendPayload(payload);
        }
      } catch (err) {
        setChatError(err instanceof Error ? err.message : 'Failed to send');
        setIsGenerating(false);
      }
    },
    [isConnected, isGenerating, sendPayload, sendForm],
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
    setChatError(null);
  }, []);
  const clearError = useCallback(() => setChatError(null), []);

  return {
    isConnected,
    messages,
    isGenerating,
    error: chatError || error,
    sendMessage,
    stopGeneration,
    clearMessages,
    clearError,
  };
};
