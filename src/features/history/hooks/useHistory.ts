import { useCallback, useEffect, useState } from 'react';
import { useSSE } from '../../../contexts/SSEContext';

interface SessionItem {
  id: string;
  title: string;
  updated_at?: number;
}

interface HistoryMessage {
  role: string;
  content: string;
}

export const useHistory = () => {
  const { sendPayload, lastMessage, setCurrentConversation } = useSSE();

  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [currentHistory, setCurrentHistory] = useState<HistoryMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!lastMessage) return;

    try {
      const t = lastMessage.type;
      if (t === 'sessions_list' && Array.isArray(lastMessage.data)) {
        setSessions(lastMessage.data as SessionItem[]);
        setLoading(false);
        setError(null);
      } else if (t === 'session_created' && lastMessage.data) {
        const item = lastMessage.data as SessionItem;
        setSessions((s) => [item, ...s]);
        setLoading(false);

        if (setCurrentConversation) setCurrentConversation(item.id);
      } else if (t === 'session_renamed') {
        fetchSessions();
      } else if (t === 'session_deleted') {
        const data = lastMessage.data as Record<string, any> | undefined;
        const convId =
          lastMessage.conversation_id || data?.id || data?.conversation_id;
        if (convId) setSessions((s) => s.filter((x) => x.id !== convId));
      } else if (t === 'chat_history' && lastMessage.conversation_id) {
        setCurrentHistory(lastMessage.data as HistoryMessage[]);
        setLoading(false);

        if (setCurrentConversation)
          setCurrentConversation(lastMessage.conversation_id as string);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Processing history message failed',
      );
      setLoading(false);
    }
  }, [lastMessage]);

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await sendPayload({ action: 'list_sessions' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to list sessions');
      setLoading(false);
    }
  }, [sendPayload]);

  const createSession = useCallback(
    async (title = 'New Chat') => {
      setLoading(true);
      setError(null);
      try {
        await sendPayload({ action: 'create_session', title });
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to create session',
        );
        setLoading(false);
      }
    },
    [sendPayload],
  );

  const renameSession = useCallback(
    async (conversation_id: string, title: string) => {
      setLoading(true);
      setError(null);
      try {
        await sendPayload({ action: 'rename_session', conversation_id, title });
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to rename session',
        );
        setLoading(false);
      }
    },
    [sendPayload],
  );

  const deleteSession = useCallback(
    async (conversation_id: string) => {
      setLoading(true);
      setError(null);
      try {
        await sendPayload({ action: 'delete_session', conversation_id });
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to delete session',
        );
        setLoading(false);
      }
    },
    [sendPayload],
  );

  const getChatHistory = useCallback(
    async (conversation_id: string) => {
      setLoading(true);
      setError(null);
      try {
        await sendPayload({ action: 'get_chat_history', conversation_id });

        if (setCurrentConversation) setCurrentConversation(conversation_id);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to get chat history',
        );
        setLoading(false);
      }
    },
    [sendPayload],
  );

  return {
    sessions,
    currentHistory,
    loading,
    error,
    fetchSessions,
    createSession,
    renameSession,
    deleteSession,
    getChatHistory,
  };
};

export type { SessionItem, HistoryMessage };
