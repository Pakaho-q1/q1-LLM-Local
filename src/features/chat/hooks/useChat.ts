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
};

export const useChat = () => {
  const {
    isConnected,
    sendPayload,
    lastMessage,
    subscribeToChat,
    error,
    currentConversation,
  } = useSSE();
  const creatingSessionRef = useRef<boolean>(false);
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
      console.log('🔍 lastMessage received:', lastMessage.type, lastMessage);

      if (
        lastMessage.type === 'chat_history' &&
        Array.isArray(lastMessage.data)
      ) {
        console.log(
          '✅ Loading chat history with',
          lastMessage.data.length,
          'messages',
        );
        const historyMessages: InternalMessage[] = (
          lastMessage.data as any[]
        ).map((msg: any) => ({
          id: createId(),
          role: msg.role || 'user',
          content: msg.content || '',
        }));
        setMessages(historyMessages);
        setChatError(null);
        console.log('✅ Chat history loaded successfully');
      }
    } catch (err) {
      console.error('❌ Error processing history:', err);
    }
  }, [lastMessage]);

  useEffect(() => {
    const handleIncomingMessage = (incomingMsg: any) => {
      try {
        if (incomingMsg === '[DONE]') {
          setIsGenerating(false);
          return;
        }

        if (incomingMsg.choices && Array.isArray(incomingMsg.choices)) {
          const delta = incomingMsg.choices[0]?.delta;
          const finish_reason = incomingMsg.choices[0]?.finish_reason;

          if (delta && delta.content) {
            setMessages((prev) => {
              const updated = [...prev];
              const last = updated[updated.length - 1];

              if (last && last.role === 'assistant') {
                updated[updated.length - 1] = {
                  ...last,
                  content: last.content + delta.content,
                };
              } else {
                updated.push({
                  id: incomingMsg.id || createId(),
                  role: 'assistant',
                  content: delta.content,
                });
              }
              return updated;
            });
          }

          if (finish_reason != null) {
            setIsGenerating(false);
          }
          return;
        }

        if (incomingMsg.type === 'chunk' && incomingMsg.content) {
          setMessages((prev) => {
            const updated = [...prev];
            const last = updated[updated.length - 1];

            if (last && last.role === 'assistant') {
              updated[updated.length - 1] = {
                ...last,
                content: last.content + incomingMsg.content,
              };
            } else {
              updated.push({
                id: createId(),
                role: 'assistant',
                content: incomingMsg.content ?? '',
              });
            }
            return updated;
          });
        } else if (
          incomingMsg.type === 'done' ||
          incomingMsg.type === 'success'
        ) {
          setIsGenerating(false);
        } else if (incomingMsg.type === 'error') {
          setChatError(incomingMsg.message || 'Unknown error');
          setIsGenerating(false);
        }
      } catch (err) {
        setChatError(err instanceof Error ? err.message : 'Processing error');
        setIsGenerating(false);
      }
    };

    const unsubscribe = subscribeToChat(handleIncomingMessage);

    return () => {
      unsubscribe();
    };
  }, [subscribeToChat]);

  const sendMessage = useCallback(
    async (
      text: string,
      file: File | null = null,
      params: Record<string, unknown> = {},
      systemPrompt: string = '',
    ) => {
      if ((!text.trim() && !file) || !isConnected || isGenerating) return;

      try {
        setChatError(null);

        let newAttachments: Attachment[] | undefined = undefined;
        if (file) {
          newAttachments = [
            {
              url: URL.createObjectURL(file),
              type: file.type,
              name: file.name,
              file: file,
            },
          ];
        }

        const userMsg: InternalMessage = {
          id: createId(),
          role: 'user',
          content: text,
          attachments: newAttachments,
        };

        setIsGenerating(true);

        setMessages((prev) => {
          const next = [...prev, userMsg];
          messagesRef.current = next;
          return next;
        });

        let chatHistory = messagesRef.current.map((m) => ({
          role: m.role,
          content: m.content,
        }));
        if (systemPrompt.trim()) {
          chatHistory = [
            { role: 'system', content: systemPrompt },
            ...chatHistory,
          ];
        }

        if (!currentConversationRef.current && !creatingSessionRef.current) {
          creatingSessionRef.current = true;
          try {
            await sendPayload({ action: 'create_session', title: 'New Chat' });

            const start = Date.now();
            while (
              !currentConversationRef.current &&
              Date.now() - start < 5000
            ) {
              await new Promise((res) => setTimeout(res, 100));
            }
          } catch (err) {
            console.warn('Failed to create session automatically:', err);
          } finally {
            creatingSessionRef.current = false;
          }
        }

        const request_id = `req_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
        const payload: Record<string, unknown> = {
          action: 'chat',
          content: text,
          messages: chatHistory,
          params,
          request_id,
        };
        if (currentConversationRef.current)
          payload.conversation_id = currentConversationRef.current;
        const resp = await sendPayload(payload);

        if (resp && (resp as any).request_id) {
        }
      } catch (err) {
        setChatError(err instanceof Error ? err.message : 'Failed to send');
        setIsGenerating(false);
      }
    },
    [isConnected, isGenerating, sendPayload],
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
    setChatError(null);
  }, []);

  const clearError = useCallback(() => {
    setChatError(null);
  }, []);

  return {
    isConnected,
    messages,
    isGenerating,
    error: chatError || error,
    sendMessage,
    clearMessages,
    clearError,
  };
};
