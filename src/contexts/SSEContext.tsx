import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  ReactNode,
  useCallback,
} from 'react';
import { WS_URL, API_BASE } from '../services/api.service';
import { WsResponse } from '../types/chat.types';

enum ConnectionState {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  ERROR = 'error',
}

interface SSEContextType {
  isConnected: boolean;
  connectionState: ConnectionState;
  sendPayload: (payload: Record<string, unknown>) => Promise<any>;
  lastMessage: any | null;
  error: string | null;
  retry: () => void;
  currentConversation?: string | null;
  setCurrentConversation?: (id: string | null) => void;

  subscribeToChat: (callback: (msg: any) => void) => () => void;
}

const SSEContext = createContext<SSEContextType | null>(null);

const CLIENT_ID = `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
const RECONNECT_DELAY = 3000;
const MAX_RECONNECT_ATTEMPTS = 5;

const genRequestId = () =>
  `req_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

export const SSEProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [connectionState, setConnectionState] = useState<ConnectionState>(
    ConnectionState.DISCONNECTED,
  );
  const [lastMessage, setLastMessage] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentConversation, setCurrentConversation] = useState<string | null>(
    null,
  );

  const esRef = useRef<EventSource | null>(null);
  const reconnectAttemptsRef = useRef<number>(0);
  const lastActionRef = useRef<string>('');

  const chatListenersRef = useRef<Set<(msg: any) => void>>(new Set());

  const subscribeToChat = useCallback((cb: (msg: any) => void) => {
    chatListenersRef.current.add(cb);
    return () => chatListenersRef.current.delete(cb);
  }, []);

  const notifyChatListeners = (data: any) => {
    chatListenersRef.current.forEach((cb) => cb(data));
  };

  const connect = useCallback(() => {
    if (esRef.current) return;
    setConnectionState(ConnectionState.CONNECTING);
    setError(null);

    try {
      const es = new EventSource(
        `${API_BASE}/sse/stream?client_id=${CLIENT_ID}`,
      );

      es.onopen = () => {
        setIsConnected(true);
        setConnectionState(ConnectionState.CONNECTED);
        reconnectAttemptsRef.current = 0;
        setError(null);
      };

      es.onmessage = (ev: MessageEvent) => {
        try {
          if (ev.data === '[DONE]') {
            notifyChatListeners('[DONE]');
            return;
          }

          const data = JSON.parse(ev.data);
          setLastMessage(data);

          if (data.choices && Array.isArray(data.choices)) {
            notifyChatListeners(data);
            return;
          }

          if (data.type === 'session_deleted') {
            setCurrentConversation((prev) => {
              if (prev === data.conversation_id) {
                return null;
              }

              return prev;
            });
          }

          const chatTypes = ['chunk', 'done', 'error', 'status'];
          if (chatTypes.includes(data.type)) notifyChatListeners(data);

          if (data.type === 'session_created' && data.data?.id)
            setCurrentConversation(data.data.id);
          if (data.type === 'chat_history' && data.conversation_id)
            setCurrentConversation(data.conversation_id);
        } catch (err) {
          console.error('❌ Failed to parse SSE message:', err);
        }
      };

      const sseEventTypes = [
        'chunk',
        'done',
        'status',
        'sessions_list',
        'session_created',
        'session_renamed',
        'session_deleted',
        'chat_history',
        'models_list',
        'model_status',
        'hf_files',
        'download_status',
        'token_count',
        'presets',
        'preset_data',
        'success',
        'error',
      ];

      sseEventTypes.forEach((evt) => {
        es.addEventListener(evt, (ev: MessageEvent) => {
          try {
            const rawData = (ev as any).data;
            if (rawData === '[DONE]') {
              notifyChatListeners('[DONE]');
              return;
            }

            const data = JSON.parse(rawData);
            setLastMessage(data);

            if (data.type === 'session_deleted') {
              setCurrentConversation?.((prev) => {
                if (prev === data.conversation_id) {
                  return null;
                }
                return prev;
              });
            }

            const chatTypes = ['chunk', 'done', 'error', 'status'];
            if (chatTypes.includes(data.type)) notifyChatListeners(data);

            if (data.type === 'session_created' && data.data?.id)
              setCurrentConversation?.(data.data.id);
            if (data.type === 'chat_history' && data.conversation_id)
              setCurrentConversation?.(data.conversation_id);
          } catch (err) {
            console.error('❌ Failed to parse named SSE message:', err);
          }
        });
      });

      es.addEventListener('error', (ev) => {
        console.error('❌ SSE error', ev);
        setConnectionState(ConnectionState.ERROR);
        setError('SSE connection error');
        setIsConnected(false);
        if (reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
          reconnectAttemptsRef.current++;
          const delay =
            RECONNECT_DELAY * Math.pow(1.5, reconnectAttemptsRef.current - 1);
          setTimeout(() => {
            if (esRef.current) {
              esRef.current.close();
              esRef.current = null;
            }
            connect();
          }, delay);
        }
      });

      esRef.current = es;
    } catch (err) {
      console.error('❌ SSE connection failed:', err);
      setError(err instanceof Error ? err.message : 'Connection failed');
      setConnectionState(ConnectionState.ERROR);
    }
  }, []);

  const sendPayload = useCallback(
    async (payload: Record<string, unknown>): Promise<any> => {
      const action = (payload.action as string) || '';
      lastActionRef.current = action;

      try {
        if (action === 'chat') {
          const req = { ...payload } as any;
          if (!req.request_id) req.request_id = genRequestId();
          const resp = await fetch(`${API_BASE}/sse/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...req, client_id: CLIENT_ID }),
          });
          return resp.json();
        }

        const resp = await fetch(`${API_BASE}/api/action`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...payload, client_id: CLIENT_ID }),
        });
        return resp.json();
      } catch (err) {
        console.error('❌ Failed to send payload via REST:', err);
        setError(err instanceof Error ? err.message : 'Send failed');
        throw err;
      }
    },
    [],
  );

  const retry = useCallback(() => {
    reconnectAttemptsRef.current = 0;
    if (esRef.current) {
      esRef.current.close();
      esRef.current = null;
    }
    connect();
  }, [connect]);

  useEffect(() => {
    connect();
    return () => {
      if (esRef.current) {
        esRef.current.close();
        esRef.current = null;
      }
    };
  }, [connect]);

  const value: SSEContextType = {
    isConnected,
    connectionState,
    sendPayload,
    lastMessage,
    error,
    retry,
    currentConversation,
    setCurrentConversation,
    subscribeToChat,
  };

  return <SSEContext.Provider value={value}>{children}</SSEContext.Provider>;
};

export const useSSE = (): SSEContextType => {
  const context = useContext(SSEContext);
  if (!context) {
    throw new Error('useSSE must be used within a SSEProvider');
  }
  return context;
};
