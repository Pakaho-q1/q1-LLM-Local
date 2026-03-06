import React, { useState } from 'react';
import { useModelManager } from '../hooks/useModelManager';
import { Combobox } from '@/components/ui/Combobox';
import { Modal } from '@/components/ui/Modal';
import {
  RefreshCw,
  Trash2,
  Download,
  HardDrive,
  ExternalLink,
  X,
} from 'lucide-react';

const baseInputClass =
  'w-full rounded-lg border border-[var(--border)] bg-[var(--bg-base)] px-3 py-2 text-[0.83rem] text-[var(--text-primary)]';

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
    deleteModel,
    downloadModel,
    cancelDownload,
    clearError,
  } = useModelManager();

  const [repoInput, setRepoInput] = useState('');
  const [selectedHfUrl, setSelectedHfUrl] = useState('');
  const [directUrl, setDirectUrl] = useState('');
  const [fileToDelete, setFileToDelete] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-6">
      {error && (
        <div className="flex animate-[fadeIn_0.2s_both] items-center justify-between rounded-lg border border-[color-mix(in_srgb,var(--danger)_30%,transparent)] bg-[color-mix(in_srgb,var(--danger)_10%,transparent)] px-3.5 py-2.5 text-[0.83rem] text-[var(--danger)]">
          <span>{error}</span>
          <button onClick={clearError} className="text-[var(--danger)]">
            <X size={14} />
          </button>
        </div>
      )}

      <section>
        <div className="mb-2.5 flex items-center justify-between">
          <span className="text-[0.78rem] font-semibold uppercase tracking-[0.06em] text-[var(--text-tertiary)]">
            Installed Models
          </span>
          <button
            onClick={fetchLocalModels}
            className="flex items-center gap-1 text-[0.78rem] text-[var(--accent)]"
          >
            <RefreshCw size={12} /> Refresh
          </button>
        </div>

        <div className="overflow-hidden rounded-[10px] border border-[var(--border)] bg-[var(--bg-elevated)]">
          {isLoadingModels ? (
            <div className="px-5 py-5 text-center text-[0.83rem] text-[var(--text-tertiary)]">
              <span className="mr-2 inline-block h-4 w-4 animate-[spinSlow_1s_linear_infinite] rounded-full border-2 border-[var(--accent)] border-t-transparent align-middle" />
              Loading models…
            </div>
          ) : localModels.length === 0 ? (
            <div className="px-5 py-5 text-center text-[0.83rem] text-[var(--text-tertiary)]">
              No models found
            </div>
          ) : (
            localModels.map((m, i) => (
              <div
                key={m.name}
                className={`flex items-center justify-between px-3.5 py-2.5 transition hover:bg-[var(--bg-hover)] ${
                  i < localModels.length - 1 ? 'border-b border-[var(--border)]' : ''
                }`}
              >
                <div className="min-w-0 pr-3">
                  <div
                    className="truncate text-[0.84rem] font-semibold text-[var(--text-primary)]"
                    title={m.name}
                  >
                    {m.name}
                  </div>
                  <div className="mt-0.5 flex gap-1.5 text-[0.75rem] text-[var(--text-tertiary)]">
                    <span className="flex items-center gap-1">
                      <HardDrive size={10} /> {m.size_str}
                    </span>
                    <span className="rounded bg-[var(--bg-code)] px-1.5 font-mono text-[0.72rem] text-[var(--text-secondary)]">
                      {m.quant}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setFileToDelete(m.name)}
                  className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-[7px] border border-[color-mix(in_srgb,var(--danger)_30%,transparent)] bg-[color-mix(in_srgb,var(--danger)_8%,transparent)] text-[var(--danger)] transition hover:bg-[var(--danger)] hover:text-white"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))
          )}
        </div>

        <Modal
          isOpen={!!fileToDelete}
          onClose={() => setFileToDelete(null)}
          onConfirm={async () => {
            if (fileToDelete) {
              await deleteModel(fileToDelete);
              setFileToDelete(null);
            }
          }}
          title="Delete Model"
          confirmText="Delete Permanently"
          confirmVariant="danger"
        >
          <p className="mb-2.5 text-[0.875rem] text-[var(--text-secondary)]">
            Are you sure you want to permanently delete this model?
          </p>
          <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2">
            <code className="break-all text-[0.78rem] text-[var(--danger)]">
              {fileToDelete}
            </code>
          </div>
        </Modal>
      </section>

      <section>
        <div className="mb-2.5">
          <span className="text-[0.78rem] font-semibold uppercase tracking-[0.06em] text-[var(--text-tertiary)]">
            Download Model
          </span>
        </div>

        <a
          href="https://huggingface.co/models?pipeline_tag=text-generation&library=gguf&sort=trending"
          target="_blank"
          rel="noopener noreferrer"
          className="mb-2.5 flex items-center justify-between rounded-[10px] border border-[color-mix(in_srgb,#f59e0b_30%,transparent)] bg-[color-mix(in_srgb,#f59e0b_8%,transparent)] px-3.5 py-2.5 text-[0.83rem] font-medium text-amber-600 no-underline transition"
        >
          <span className="flex items-center gap-2">
            <span className="text-[1.1rem]">🤗</span> Browse HuggingFace GGUF
          </span>
          <ExternalLink size={14} />
        </a>

        <div className="mb-2 flex gap-2">
          <input
            type="text"
            placeholder="HuggingFace repo ID (e.g. TheBloke/Mistral-7B-GGUF)"
            value={repoInput}
            onChange={(e) => setRepoInput(e.target.value)}
            onKeyDown={(e) =>
              e.key === 'Enter' &&
              repoInput.trim() &&
              (searchHuggingFace(repoInput.trim()), setSelectedHfUrl(''))
            }
            className={baseInputClass}
          />
          <button
            onClick={() => {
              if (repoInput.trim()) {
                searchHuggingFace(repoInput.trim());
                setSelectedHfUrl('');
              }
            }}
            disabled={isSearchingHf || !repoInput.trim()}
            className="flex items-center gap-1.5 rounded-lg bg-[var(--accent)] px-3.5 py-2 text-[0.8rem] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-45"
          >
            {isSearchingHf ? (
              <>
                <span className="inline-block h-3 w-3 animate-[spinSlow_1s_linear_infinite] rounded-full border-2 border-white border-t-transparent" />
                Fetching…
              </>
            ) : (
              'Fetch'
            )}
          </button>
        </div>

        {hfFiles.length > 0 && (
          <div className="mb-2 flex gap-2">
            <div className="flex-1">
              <Combobox
                className="w-full"
                options={hfFiles.map((f) => ({
                  value: f.url,
                  searchText: `${f.name} ${f.size_str} ${f.quant}`,
                  label: (
                    <div className="leading-tight">
                      <div
                        className="text-[0.83rem] font-medium text-[var(--text-primary)]"
                        title={f.name}
                      >
                        {f.name}
                      </div>
                      <div className="text-[0.75rem] text-[var(--text-tertiary)]">
                        {f.size_str} · {f.quant}
                      </div>
                    </div>
                  ),
                }))}
                value={selectedHfUrl}
                onChange={setSelectedHfUrl}
                placeholder="Select file…"
              />
            </div>
            <button
              onClick={() => selectedHfUrl && downloadModel(selectedHfUrl)}
              disabled={!selectedHfUrl}
              className="flex items-center gap-1.5 rounded-lg bg-[var(--accent)] px-3.5 py-2 text-[0.8rem] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-45"
            >
              <Download size={13} /> Download
            </button>
          </div>
        )}

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Direct URL (https://…)"
            value={directUrl}
            onChange={(e) => setDirectUrl(e.target.value)}
            className={baseInputClass}
          />
          <button
            onClick={() => {
              if (directUrl) {
                downloadModel(directUrl);
                setDirectUrl('');
              }
            }}
            disabled={!directUrl.trim()}
            className="flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--bg-hover)] px-3.5 py-2 text-[0.8rem] font-semibold text-[var(--text-secondary)] disabled:cursor-not-allowed disabled:opacity-45"
          >
            <Download size={13} /> URL
          </button>
        </div>
      </section>

      {activeJobs.length > 0 && (
        <section>
          <div className="mb-2.5">
            <span className="text-[0.78rem] font-semibold uppercase tracking-[0.06em] text-[var(--text-tertiary)]">
              Active Downloads
            </span>
          </div>

          <div className="flex flex-col gap-2">
            {activeJobs.map((job) => (
              <div
                key={job.id}
                className="rounded-[10px] border border-[var(--border)] bg-[var(--bg-elevated)] px-3.5 py-3"
              >
                <div className="mb-2 flex items-center justify-between">
                  <span
                    className="max-w-[180px] truncate text-[0.83rem] font-medium text-[var(--text-primary)]"
                    title={job.filename}
                  >
                    {job.filename}
                  </span>
                  {job.status !== 'done' && job.status !== 'cancelled' && (
                    <button
                      onClick={() => cancelDownload(job.id)}
                      className="text-[0.75rem] text-[var(--danger)]"
                    >
                      Cancel
                    </button>
                  )}
                </div>

                <div className="mb-1.5 h-1.5 overflow-hidden rounded bg-[var(--bg-base)]">
                  <div
                    className={job.status === 'downloading' ? 'progress-bar-animated h-full rounded' : 'h-full rounded'}
                    style={{
                      width: `${Math.max(0, Math.min(100, job.progress * 100))}%`,
                      background:
                        job.status === 'error'
                          ? 'var(--danger)'
                          : job.status === 'done'
                            ? 'var(--success)'
                            : undefined,
                      transition: 'width 0.4s ease',
                    }}
                  />
                </div>

                <div className="font-mono text-[0.75rem] text-[var(--text-tertiary)]">
                  {job.status === 'downloading' &&
                    `${(job.speed / 1024 / 1024).toFixed(2)} MB/s · ETA ${Math.round(job.eta)}s · ${(job.progress * 100).toFixed(1)}%`}
                  {job.status === 'done' && (
                    <span className="text-[var(--success)]">✓ Complete</span>
                  )}
                  {job.status === 'error' && (
                    <span className="text-[var(--danger)]">Error: {job.error}</span>
                  )}
                  {job.status === 'cancelled' && <span>Cancelled</span>}
                  {job.status === 'queued' && <span>Queued…</span>}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
