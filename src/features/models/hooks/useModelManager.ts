import { useState, useEffect, useCallback } from 'react';
import { useSSE } from '../../../contexts/SSEContext';
import { ModelItem, HfFile } from '../../../types/chat.types';

export interface DownloadJob {
  id: string;
  filename: string;
  progress: number;
  speed: number;
  eta: number;
  status: 'queued' | 'downloading' | 'done' | 'error' | 'cancelled';
  error?: string;
}

export const useModelManager = () => {
  const { isConnected, sendPayload, lastMessage, error: wsError } = useSSE();

  const [localModels, setLocalModels] = useState<ModelItem[]>([]);
  const [hfFiles, setHfFiles] = useState<HfFile[]>([]);
  const [activeJobs, setActiveJobs] = useState<DownloadJob[]>([]);

  const [isLoadingModels, setIsLoadingModels] = useState<boolean>(false);
  const [isSearchingHf, setIsSearchingHf] = useState<boolean>(false);
  const [currentModel, setCurrentModel] = useState<string | null>(null);
  const [isModelRunning, setIsModelRunning] = useState<boolean>(false);
  const [isModelLoading, setIsModelLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!lastMessage) return;

    try {
      if (lastMessage.type === 'models_list' && lastMessage.data) {
        setLocalModels(lastMessage.data as ModelItem[]);
        setIsLoadingModels(false);
      } else if (lastMessage.type === 'model_status' && lastMessage.data) {
        try {
          const d = lastMessage.data as any;
          setCurrentModel(d.name || null);
          setIsModelRunning(!!d.running);
          setIsModelLoading(false);
        } catch (err) {
          setCurrentModel(null);
          setIsModelRunning(false);
          setIsModelLoading(false);
        }
      } else if (lastMessage.type === 'hf_files' && lastMessage.data) {
        setHfFiles(lastMessage.data as HfFile[]);
        setIsSearchingHf(false);
      } else if (lastMessage.type === 'download_status' && lastMessage.data) {
        setActiveJobs(lastMessage.data as DownloadJob[]);
      } else if (lastMessage.type === 'done') {
        setError(null);

        setTimeout(() => fetchLocalModels(), 1000);
      } else if (lastMessage.type === 'success' && lastMessage.message) {
        try {
          const m = (lastMessage.message as string).toLowerCase();
          if (m.includes('deleted') || m.includes('delete')) {
            fetchLocalModels();
          }
        } catch (err) {}
      } else if (
        lastMessage.type === 'success' &&
        lastMessage.message?.includes('Download started')
      ) {
        fetchDownloadStatus();
      } else if (lastMessage.type === 'error') {
        setError(lastMessage.message || 'An error occurred');
        setIsLoadingModels(false);
        setIsSearchingHf(false);
      }
    } catch (err) {
      console.error('❌ Error processing model message:', err);
      setError(err instanceof Error ? err.message : 'Processing error');
    }
  }, [lastMessage]);

  const fetchLocalModels = useCallback(async () => {
    try {
      setIsLoadingModels(true);
      setError(null);
      await sendPayload({ action: 'list_models' });
    } catch (err) {
      console.error('❌ Failed to fetch models:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch models');
      setIsLoadingModels(false);
    }
  }, [sendPayload]);

  const searchHuggingFace = useCallback(
    async (repo: string) => {
      try {
        setIsSearchingHf(true);
        setError(null);
        await sendPayload({ action: 'fetch_hf', repo });
      } catch (err) {
        console.error('❌ Failed to search HuggingFace:', err);
        setError(
          err instanceof Error ? err.message : 'Failed to search HuggingFace',
        );
        setIsSearchingHf(false);
      }
    },
    [sendPayload],
  );

  const loadModel = useCallback(
    async (modelPath: string, params: Record<string, unknown> = {}) => {
      try {
        setError(null);

        setIsModelRunning(false);
        setCurrentModel(null);
        setIsModelLoading(true);
        await sendPayload({
          action: 'load_model',
          model_path: modelPath,
          params,
        });
      } catch (err) {
        console.error('❌ Failed to load model:', err);
        setError(err instanceof Error ? err.message : 'Failed to load model');
      }
    },
    [sendPayload],
  );

  const deleteModel = useCallback(
    async (filename: string) => {
      try {
        setError(null);
        await sendPayload({ action: 'delete_model', filename });
      } catch (err) {
        console.error('❌ Failed to delete model:', err);
        setError(err instanceof Error ? err.message : 'Failed to delete model');
      }
    },
    [sendPayload],
  );

  const downloadModel = useCallback(
    async (url: string) => {
      try {
        setError(null);
        await sendPayload({ action: 'download_model', url });
      } catch (err) {
        console.error('❌ Failed to download model:', err);
        setError(
          err instanceof Error ? err.message : 'Failed to start download',
        );
      }
    },
    [sendPayload],
  );

  const cancelDownload = useCallback(
    async (jobId: string) => {
      try {
        setError(null);
        await sendPayload({ action: 'cancel_download', job_id: jobId });
      } catch (err) {
        console.error('❌ Failed to cancel download:', err);
        setError(
          err instanceof Error ? err.message : 'Failed to cancel download',
        );
      }
    },
    [sendPayload],
  );

  const fetchDownloadStatus = useCallback(async () => {
    try {
      await sendPayload({ action: 'download_status' });
    } catch (err) {
      console.error('❌ Failed to fetch download status:', err);
    }
  }, [sendPayload]);

  const unloadModel = useCallback(async () => {
    try {
      setError(null);
      await sendPayload({ action: 'unload_model' });
    } catch (err) {
      console.error('❌ Failed to unload model:', err);
      setError(err instanceof Error ? err.message : 'Failed to unload model');
    }
  }, [sendPayload]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    if (isConnected) {
      fetchLocalModels();
      fetchDownloadStatus();

      sendPayload({ action: 'get_model_status' }).catch(() => {});
    }
  }, [isConnected, fetchLocalModels, fetchDownloadStatus]);

  useEffect(() => {
    if (!isConnected) return;
    const interval = setInterval(() => {
      fetchDownloadStatus();
    }, 1000);
    return () => clearInterval(interval);
  }, [isConnected, fetchDownloadStatus]);

  return {
    localModels,
    hfFiles,
    activeJobs,
    isLoadingModels,
    isSearchingHf,
    error: error || wsError,
    currentModel,
    isModelRunning,
    isModelLoading,
    fetchLocalModels,
    searchHuggingFace,
    loadModel,
    deleteModel,
    downloadModel,
    cancelDownload,
    unloadModel,
    clearError,
  };
};
