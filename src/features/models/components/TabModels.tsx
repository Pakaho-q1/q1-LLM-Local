// src/features/models/components/TabModels.tsx
import React, { useState } from 'react';
import { useModelManager } from '../hooks/useModelManager';
import { useSettings } from '../../../contexts/SettingsContext';
import { Tooltip } from '../../../components/ui/Tooltip';
import { Combobox } from '../../../components/ui/Combobox';
import { Modal } from '../../../components/ui/Modal';

export const TabModels: React.FC = () => {
  const {
    localModels,
    hfFiles,
    activeJobs,
    isLoadingModels,
    isSearchingHf,
    error,
    fetchLocalModels,
    searchHuggingFace,
    loadModel,
    deleteModel,
    downloadModel,
    cancelDownload,
    clearError,
  } = useModelManager();

  const { settings } = useSettings();

  // States สำหรับกล่องข้อความ
  const [repoInput, setRepoInput] = useState<string>('');
  const [selectedHfUrl, setSelectedHfUrl] = useState<string>('');
  const [directUrl, setDirectUrl] = useState<string>('');
  const [fileToDelete, setFileToDelete] = useState<string | null>(null);
  const handleLoadLocal = (filename: string) => {
    loadModel(filename, {
      n_ctx: settings.nCtx,
      n_gpu_layers: settings.nGpuLayers,
    });
  };

  const handleDeleteModel = async () => {
    if (fileToDelete) {
      await deleteModel(fileToDelete);
      setFileToDelete(null);
    }
  };

  const handleFetchRepo = () => {
    if (repoInput.trim()) {
      searchHuggingFace(repoInput.trim());
      setSelectedHfUrl('');
    }
  };

  return (
    <div className="space-y-8">
      {/* Error Banner */}
      {error && (
        <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-2 text-sm rounded-lg flex justify-between items-center">
          <span>❌ {error}</span>
          <button
            onClick={clearError}
            className="text-red-300 hover:text-red-200 font-bold"
          >
            ✕
          </button>
        </div>
      )}
      {/* ========================================== */}
      {/* 📦 1. Installed Models */}
      {/* ========================================== */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-slate-300 flex items-center gap-2">
            📦 Installed Models
          </h2>
          <button
            onClick={fetchLocalModels}
            className="text-xs text-blue-600 hover:underline"
          >
            Refresh
          </button>
        </div>

        <div className="flex flex-col  bg-slate-800 p-4 rounded-lg text-slate-200 rounded-xl border border-neutral-200/20 p-2 shadow-sm space-y-1">
          {isLoadingModels ? (
            <p className="text-sm text-slate-300 p-4 text-center">
              Loading models...
            </p>
          ) : localModels.length === 0 ? (
            <p className="text-sm text-slate-300 p-4 text-center border border-dashed border-neutral-500 rounded-lg m-2">
              No models found.
            </p>
          ) : (
            localModels.map((m) => (
              <div
                key={m.name}
                className="flex justify-between items-center p-3 hover:bg-white/5 rounded-lg group transition-colors"
              >
                <div className="flex flex-col min-w-0 pr-4">
                  <span
                    className="font-semibold text-slate-300 text-sm truncate"
                    title={m.name}
                  >
                    {m.name}
                  </span>
                  <span className="text-xs text-slate-300">
                    {m.size_str} |{' '}
                    <span className="font-mono bg-neutral-800 px-1 rounded text-slate-300">
                      {m.quant}
                    </span>
                  </span>
                </div>
                <div className="flex gap-2 shrink-0">
                  {/* 🟢 เปลี่ยนจาก deleteModel(m.name) มาเป็น setFileToDelete(m.name) */}
                  <button
                    onClick={() => setFileToDelete(m.name)}
                    className="bg-red-500/10 text-red-500 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-red-500 hover:text-white border border-red-500/20 transition-all"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* 🟢 Confirmation Modal สำหรับการลบโมเดล */}
        <Modal
          isOpen={!!fileToDelete}
          onClose={() => setFileToDelete(null)}
          onConfirm={handleDeleteModel}
          title="Confirm Delete"
          confirmText="Delete Permanently"
          confirmVariant="danger"
        >
          <div className="space-y-3">
            <p className="text-neutral-600">
              Are you sure you want to permanently delete this model?
            </p>
            <div className="bg-neutral-100 p-3 rounded-lg border border-neutral-200">
              <p className="text-xs font-mono text-neutral-800 break-all">
                {fileToDelete}
              </p>
            </div>
            <p className="text-[11px] text-red-500">
              * This action cannot be undone and will remove the file from your
              disk.
            </p>
          </div>
        </Modal>
      </section>

      {/* ========================================== */}
      {/* ⬇️ 2. Download Model */}
      {/* ========================================== */}
      <section>
        <h2 className="text-lg font-bold text-slate-300 flex items-center gap-2 mb-4">
          ⬇ Download Model
        </h2>

        <div className="space-y-4">
          {/* HuggingFace Shortcut */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex justify-between items-center">
            <span className="text-sm text-amber-900 font-medium">
              Download models from HuggingFace (GGUF)
            </span>
            <a
              href="https://huggingface.co/models?pipeline_tag=text-generation&library=gguf&sort=trending"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-white border border-amber-300 shadow-sm px-4 py-2 rounded-lg hover:bg-amber-100 transition-colors"
            >
              <span className="text-xl">🤗</span>
              <span className="text-sm font-bold text-amber-900">
                Browse HuggingFace
              </span>
            </a>
          </div>

          {/* Fetch Repo */}
          <div className="bg-slate-400/40  p-4 rounded-xl  border-neutral-200 shadow-sm space-y-3">
            <div className="flex gap-2 text-white ">
              <input
                type="text"
                placeholder="HuggingFace Repo ID"
                value={repoInput}
                onChange={(e) => setRepoInput(e.target.value)}
                className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <button
                onClick={handleFetchRepo}
                disabled={isSearchingHf || !repoInput.trim()}
                className="bg-sky-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-sky-800 disabled:opacity-50"
              >
                {isSearchingHf ? 'Fetching...' : 'Fetch Repo'}
              </button>
            </div>

            <div className="flex gap-2">
              <Combobox
                className="flex-1 text-neutral-50"
                options={hfFiles.map((f) => ({
                  value: f.url,
                  searchText: `${f.name} ${f.size_str} ${f.quant}`,
                  label: (
                    <div className="flex flex-col leading-tight">
                      <span
                        className="text-sm font-medium text-neutral-100 truncate w-full"
                        title={f.name}
                      >
                        {f.name}
                      </span>
                      <span className="text-xs text-neutral-100 truncate">
                        {f.size_str} · {f.quant}
                      </span>
                    </div>
                  ),
                }))}
                value={selectedHfUrl}
                onChange={setSelectedHfUrl}
                placeholder={
                  hfFiles.length > 0 ? 'Select file...' : 'No files fetched'
                }
              />

              <button
                onClick={() => selectedHfUrl && downloadModel(selectedHfUrl)}
                disabled={!selectedHfUrl}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                Download Selected
              </button>
            </div>
          </div>

          {/* Direct URL */}
          <div className="flex gap-2 text-slate-300 ">
            <input
              type="text"
              placeholder="Direct URL (https://...)"
              value={directUrl}
              onChange={(e) => setDirectUrl(e.target.value)}
              className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <button
              onClick={() => {
                if (directUrl) {
                  downloadModel(directUrl);
                  setDirectUrl('');
                }
              }}
              disabled={!directUrl.trim()}
              className="flex flex-col  bg-slate-800 p-4 rounded-lg text-slate-200  text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-500 disabled:opacity-50"
            >
              Download URL
            </button>
          </div>
        </div>
      </section>

      {/* ========================================== */}
      {/* 📡 3. Active Downloads */}
      {/* ========================================== */}
      <section>
        <h2 className="text-lg font-bold text-slate-300 flex items-center gap-2 mb-4">
          📡 Active Downloads
        </h2>
        <div className="space-y-3">
          {activeJobs.length === 0 ? (
            <p className="text-sm text-slate-300">No active downloads.</p>
          ) : (
            activeJobs.map((job) => (
              <div
                key={job.id}
                className="flex flex-col  bg-slate-800 p-4 rounded-lg text-slate-200  rounded-xl p-4 shadow-sm"
              >
                <div className="flex justify-between items-center mb-2">
                  <span
                    className="font-semibold text-sm text-slate-300 truncate"
                    title={job.filename}
                  >
                    {job.filename}
                  </span>
                  {job.status !== 'done' && job.status !== 'cancelled' && (
                    <button
                      onClick={() => cancelDownload(job.id)}
                      className="text-xs text-red-600 font-medium hover:underline"
                    >
                      Cancel
                    </button>
                  )}
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-neutral-100 rounded-full h-2.5 mb-2 overflow-hidden ">
                  <div
                    className={`h-2.5 rounded-full transition-all duration-300 ${job.status === 'error' ? 'bg-red-500' : job.status === 'done' ? 'bg-green-500' : 'bg-blue-600'}`}
                    style={{
                      width: `${Math.max(0, Math.min(100, job.progress * 100))}%`,
                    }}
                  ></div>
                </div>

                {/* Status Text */}
                <div className="text-xs font-mono text-slate-300">
                  {job.status === 'downloading' &&
                    `${(job.speed / 1024 / 1024).toFixed(2)} MB/s | ETA ${Math.round(job.eta)}s`}
                  {job.status === 'done' && (
                    <span className="text-green-600">Complete</span>
                  )}
                  {job.status === 'error' && (
                    <span className="text-red-600">Error: {job.error}</span>
                  )}
                  {job.status === 'cancelled' && (
                    <span className="text-slate-300">Cancelled</span>
                  )}
                  {job.status === 'queued' && <span>Queued...</span>}
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
};
