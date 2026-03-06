import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { ChatContainer } from '@/features/chat/components/ChatContainer';
import { useModelManager } from '@/features/models/hooks/useModelManager';
import { useMainLayout } from './hooks/useMainLayout';
import { useSettings } from '@/contexts/SettingsContext';
import { useSSE } from '@/contexts/SSEContext';
import { Combobox } from '@/components/ui/Combobox';
import { Sun, Moon, Menu, ChevronRight, Zap, ZapOff } from 'lucide-react';

enum ConnectionState {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  ERROR = 'error',
}

const LAST_MODEL_KEY = 'v1_last_selected_model';

function useTheme() {
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);
  return { dark, toggle: () => setDark((p) => !p) };
}

export const MainLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLoadingAction, setIsLoadingAction] = useState<
    'load' | 'unload' | null
  >(null);
  const { dark, toggle } = useTheme();

  const { localModels, isLoadingModels, unloadModel, loadModel } =
    useModelManager();
  const { currentModel, isModelRunning, isModelLoading } = useMainLayout();
  const { settings } = useSettings();
  const { isConnected, connectionState } = useSSE();

  const [selectedModel, setSelectedModel] = useState<string>(
    () => localStorage.getItem(LAST_MODEL_KEY) || '',
  );

  useEffect(() => {
    if (localModels.length === 0) return;
    const cached = localStorage.getItem(LAST_MODEL_KEY);
    if (cached && !localModels.some((m) => m.name === cached)) {
      setSelectedModel('');
      localStorage.removeItem(LAST_MODEL_KEY);
    }
  }, [localModels]);

  const handleModelChange = (val: string) => {
    setSelectedModel(val);
    if (val) localStorage.setItem(LAST_MODEL_KEY, val);
    else localStorage.removeItem(LAST_MODEL_KEY);
  };

  const handleLoadModel = async () => {
    if (!selectedModel) return;
    setIsLoadingAction('load');
    try {
      await unloadModel();
      await loadModel(selectedModel, {
        n_ctx: settings.nCtx,
        n_gpu_layers: settings.nGpuLayers,
        n_threads: settings.nThreads,
        n_batch: settings.nBatch,
      });
    } catch (err) {
      console.error('Failed to load model:', err);
    } finally {
      setIsLoadingAction(null);
    }
  };

  const handleUnloadModel = async () => {
    setIsLoadingAction('unload');
    try {
      await unloadModel();
    } finally {
      setIsLoadingAction(null);
    }
  };

  const connDot =
    connectionState === ConnectionState.CONNECTED
      ? 'var(--success)'
      : connectionState === ConnectionState.CONNECTING
        ? 'var(--warning)'
        : connectionState === ConnectionState.ERROR
          ? 'var(--danger)'
          : 'var(--text-tertiary)';

  const connPulse = connectionState === ConnectionState.CONNECTING;

  const modelStatus = isModelLoading
    ? {
        label: 'Loading',
        color: 'var(--warning)',
        bgColor: 'color-mix(in srgb, var(--warning) 10%, transparent)',
        borderColor: 'color-mix(in srgb, var(--warning) 30%, transparent)',
      }
    : isModelRunning
      ? {
          label: currentModel?.split('/').pop() || 'Running',
          color: 'var(--success)',
          bgColor: 'color-mix(in srgb, var(--success) 10%, transparent)',
          borderColor: 'color-mix(in srgb, var(--success) 30%, transparent)',
        }
      : {
          label: 'No Model',
          color: 'var(--text-tertiary)',
          bgColor: 'var(--bg-hover)',
          borderColor: 'var(--border)',
        };

  const Spinner = () => (
    <span
      style={{
        width: 10,
        height: 10,
        border: '2px solid currentColor',
        borderTopColor: 'transparent',
        borderRadius: '50%',
        display: 'inline-block',
        animation: 'spinSlow 1s linear infinite',
        flexShrink: 0,
      }}
    />
  );

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: 'var(--bg-base)', color: 'var(--text-primary)' }}
    >
      {/* Sidebar */}
      <div
        style={{
          width: isSidebarOpen ? '350px' : '0px',
          background: 'var(--bg-sidebar)',
          borderRight: '1px solid var(--border)',
          boxShadow: isSidebarOpen ? 'var(--shadow-sidebar)' : 'none',
          transition: 'width 0.3s cubic-bezier(0.16,1,0.3,1)',
          overflow: 'hidden',
          flexShrink: 0,
          zIndex: 30,
        }}
      >
        <Sidebar onClose={() => setIsSidebarOpen(false)} />
      </div>

      {/* Main */}
      <div
        className="flex-1 flex flex-col min-w-0"
        style={{ background: 'var(--bg-base)' }}
      >
        {/* Header */}
        <header
          className="flex items-center justify-between px-4 shrink-0 z-20 gap-3"
          style={{
            height: '56px',
            background: 'var(--bg-header)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderBottom: '1px solid var(--border)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          {/* Left */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setIsSidebarOpen((v) => !v)}
              className="icon-btn"
              title={isSidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
            >
              {isSidebarOpen ? <ChevronRight size={17} /> : <Menu size={17} />}
            </button>
            <div className="flex items-center gap-2">
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  background: connDot,
                  display: 'inline-block',
                  flexShrink: 0,
                  animation: connPulse
                    ? 'pulseDot 1.2s ease-in-out infinite'
                    : 'none',
                  boxShadow: `0 0 6px ${connDot}`,
                }}
              />
              <span
                style={{
                  fontWeight: 700,
                  fontSize: '1.3rem',
                  color: 'var(--text-primary)',
                  letterSpacing: '-0.02em',
                  whiteSpace: 'nowrap',
                }}
              >
                q1-LLM-Local
              </span>
            </div>
          </div>

          {/* Right: model controls */}
          <div className="flex items-center gap-2 min-w-0">
            {/* Model status badge */}
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium shrink-0"
              style={{
                color: modelStatus.color,
                background: modelStatus.bgColor,
                borderColor: modelStatus.borderColor,
                maxWidth: 160,
              }}
            >
              {isModelLoading ? (
                <Spinner />
              ) : (
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: modelStatus.color,
                    display: 'inline-block',
                    flexShrink: 0,
                    animation: isModelRunning
                      ? 'pulseDot 2s ease-in-out infinite'
                      : 'none',
                  }}
                />
              )}
              <span
                style={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
                title={isModelRunning ? currentModel || 'Running' : undefined}
              >
                {modelStatus.label}
              </span>
            </div>

            {/* Model selector */}
            <div style={{ width: 190, flexShrink: 0 }}>
              <Combobox
                className="w-full text-sm"
                options={localModels.map((m) => ({
                  value: m.name,
                  label: (
                    <span
                      style={{
                        fontSize: '0.8rem',
                        color: 'var(--text-primary)',
                      }}
                      title={m.name}
                    >
                      {m.name}
                    </span>
                  ),
                }))}
                value={selectedModel}
                onChange={handleModelChange}
                placeholder={isLoadingModels ? 'Loading…' : 'Select model…'}
                disabled={isLoadingModels || !isConnected}
              />
            </div>

            {/* Load */}
            <button
              onClick={handleLoadModel}
              disabled={
                !selectedModel || !isConnected || isLoadingAction !== null
              }
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 disabled:opacity-40 shrink-0"
              style={{
                background: 'var(--success)',
                color: '#fff',
                border: 'none',
                cursor:
                  !selectedModel || !isConnected ? 'not-allowed' : 'pointer',
              }}
            >
              {isLoadingAction === 'load' ? <Spinner /> : <Zap size={12} />}
              Load
            </button>

            {/* Unload */}
            <button
              onClick={handleUnloadModel}
              disabled={!isConnected || isLoadingAction !== null}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 disabled:opacity-40 shrink-0"
              style={{
                background: 'var(--danger)',
                color: '#fff',
                border: 'none',
                cursor: !isConnected ? 'not-allowed' : 'pointer',
              }}
            >
              {isLoadingAction === 'unload' ? (
                <Spinner />
              ) : (
                <ZapOff size={12} />
              )}
              Unload
            </button>

            {/* Theme toggle */}
            <button
              onClick={toggle}
              className="icon-btn shrink-0"
              title={dark ? 'Light mode' : 'Dark mode'}
            >
              {dark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>
        </header>

        {/* Chat */}
        <div className="flex-1 overflow-hidden min-h-0">
          <ChatContainer />
        </div>
      </div>
    </div>
  );
};
