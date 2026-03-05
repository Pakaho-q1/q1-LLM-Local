// src/components/layouts/MainLayout.tsx
import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { ChatContainer } from '../../features/chat/components/ChatContainer';
import { useModelManager } from '../../features/models/hooks/useModelManager';
import { useMainLayout } from './hooks/useMainLayout';
import { useSettings } from '../../contexts/SettingsContext';
import { useSSE } from '../../contexts/SSEContext';
import { StatusBadge } from '../ui/StatusBadge';
import { Combobox } from '../ui/Combobox';

enum ConnectionState {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  ERROR = 'error',
}

export const MainLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);

  const { localModels, isLoadingModels, unloadModel, loadModel, error } =
    useModelManager();
  const { currentModel, isModelRunning, isModelLoading } = useMainLayout();
  const { settings } = useSettings();
  const { isConnected, connectionState, error: wsError, retry } = useSSE();
  const [selectedModel, setSelectedModel] = useState<string>('');

  const handleLoadModel = async () => {
    if (!selectedModel) return;

    try {
      await unloadModel();
      await loadModel(selectedModel, {
        n_ctx: settings.nCtx,
        n_gpu_layers: settings.nGpuLayers,
        n_threads: settings.nThreads,
        n_batch: settings.nBatch,
      });
    } catch (err) {
      console.error('❌ Failed to load model:', err);
    }
  };

  const handleUnloadModel = async () => {
    await unloadModel();
  };

  const getConnectionColor = () => {
    if (connectionState === ConnectionState.CONNECTED) return 'bg-green-500';
    if (connectionState === ConnectionState.CONNECTING) return 'bg-yellow-500';
    if (connectionState === ConnectionState.ERROR) return 'bg-red-500';
    return 'bg-gray-500';
  };

  const getConnectionLabel = () => {
    switch (connectionState) {
      case ConnectionState.CONNECTED:
        return 'Online';
      case ConnectionState.CONNECTING:
        return 'Connecting...';
      case ConnectionState.ERROR:
        return 'Error';
      case ConnectionState.DISCONNECTED:
        return 'Offline';
    }
  };

  return (
    <div className="flex h-screen overflow-hidden  bg-gradient-to-b from-gray-600 via-gray-500 to-slate-600 font-sans">
      {/* Sidebar */}
      <div
        className={`
          ${isSidebarOpen ? 'w-100 overflow-visible' : 'w-0 overflow-hidden'} 
          transition-all duration-300  border-neutral-200 bg-gradient-to-b from-slate-700 via-slate-800 to-slate-900 backdrop-blur-md
          flex flex-col shrink-0 relative z-30 shadow-[4px_0_24px_rgba(0,0,0,0.02)]
        `}
      >
        <Sidebar onClose={() => setIsSidebarOpen(false)} />
      </div>

      {/* Main Area */}
      <div className="bg-gradient-to-b from-slate-700 via-slate-800 to-slate-900 flex-1 flex flex-col relative min-w-0 z-10">
        {/* Top Header Bar */}
        <header className="h-15 bg-slate-800  border-neutral-200 flex items-center justify-between px-4 shrink-0 shadow-sm z-20">
          <div className="flex items-center gap-3">
            {!isSidebarOpen && (
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="p-1.5 text-gray-50 hover:bg-[#64748b] rounded-md"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            )}
            <div className="flex items-center gap-2">
              <span
                className={`w-2.5 h-2.5 rounded-full ${getConnectionColor()}`}
                title={getConnectionLabel()}
              ></span>
              <span className="font-semibold text-gray-50 text-sm">
                Enterprise LLM
              </span>
            </div>
          </div>

          {/* Model Selector & Actions */}
          <div className="flex items-center gap-2">
            <StatusBadge
              status={
                isModelLoading
                  ? 'loading'
                  : isModelRunning
                    ? 'running'
                    : 'stopped'
              }
              label={
                isModelLoading
                  ? 'Loading'
                  : isModelRunning
                    ? currentModel || 'Running'
                    : 'No Model'
              }
            />
            <Combobox
              className="w-50 text-sm bg-neutral-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
              options={localModels.map((m) => ({
                value: m.name,
                label: (
                  <span
                    className="font-semibold text-gray-700 text-sm truncate"
                    title={m.name}
                  >
                    {m.name}
                  </span>
                ),
              }))}
              value={selectedModel}
              onChange={setSelectedModel}
              placeholder={isLoadingModels ? 'Loading...' : 'Search Model...'}
              disabled={isLoadingModels || !isConnected}
            />
            <button
              onClick={handleLoadModel}
              disabled={!selectedModel || !isConnected}
              className="text-sm bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg disabled:opacity-50"
            >
              Load
            </button>
            <button
              onClick={handleUnloadModel}
              disabled={!isConnected}
              className="text-sm bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg disabled:opacity-50"
            >
              Unload
            </button>
          </div>
        </header>

        {/* Chat Container */}
        <div className="flex-1 overflow-hidden min-h-0">
          <ChatContainer />
        </div>
      </div>
    </div>
  );
};
