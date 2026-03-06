import React, { useState } from 'react';
import { useModelManager } from '../hooks/useModelManager';
import { useSettings } from '@/contexts/SettingsContext';
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

  const [repoInput, setRepoInput] = useState('');
  const [selectedHfUrl, setSelectedHfUrl] = useState('');
  const [directUrl, setDirectUrl] = useState('');
  const [fileToDelete, setFileToDelete] = useState<string | null>(null);

  const sectionTitle = (text: string, action?: React.ReactNode) => (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
      }}
    >
      <span
        style={{
          fontSize: '0.78rem',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          color: 'var(--text-tertiary)',
        }}
      >
        {text}
      </span>
      {action}
    </div>
  );

  const btn = (
    label: React.ReactNode,
    onClick: () => void,
    variant: 'primary' | 'danger' | 'ghost' = 'primary',
    disabled = false,
  ) => {
    const styles: Record<string, React.CSSProperties> = {
      primary: {
        background: 'var(--accent)',
        color: '#fff',
        boxShadow:
          '0 1px 4px color-mix(in srgb, var(--accent) 35%, transparent)',
      },
      danger: { background: 'var(--danger)', color: '#fff' },
      ghost: {
        background: 'var(--bg-hover)',
        color: 'var(--text-secondary)',
        border: '1px solid var(--border)',
      },
    };
    return (
      <button
        onClick={onClick}
        disabled={disabled}
        style={{
          ...styles[variant],
          padding: '7px 14px',
          borderRadius: 8,
          fontSize: '0.8rem',
          fontWeight: 600,
          border: 'none',
          cursor: disabled ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          opacity: disabled ? 0.45 : 1,
          transition: 'all 0.14s',
        }}
      >
        {label}
      </button>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Error */}
      {error && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '10px 14px',
            borderRadius: 8,
            fontSize: '0.83rem',
            background: 'color-mix(in srgb, var(--danger) 10%, transparent)',
            border:
              '1px solid color-mix(in srgb, var(--danger) 30%, transparent)',
            color: 'var(--danger)',
            animation: 'fadeIn 0.2s both',
          }}
        >
          <span>{error}</span>
          <button
            onClick={clearError}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--danger)',
            }}
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Installed models */}
      <section>
        {sectionTitle(
          'Installed Models',
          <button
            onClick={fetchLocalModels}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--accent)',
              fontSize: '0.78rem',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <RefreshCw size={12} /> Refresh
          </button>,
        )}
        <div
          style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border)',
            borderRadius: 10,
            overflow: 'hidden',
          }}
        >
          {isLoadingModels ? (
            <div
              style={{
                padding: '20px',
                textAlign: 'center',
                color: 'var(--text-tertiary)',
                fontSize: '0.83rem',
              }}
            >
              <span
                style={{
                  display: 'inline-block',
                  width: 16,
                  height: 16,
                  border: '2px solid var(--accent)',
                  borderTopColor: 'transparent',
                  borderRadius: '50%',
                  animation: 'spinSlow 1s linear infinite',
                  marginRight: 8,
                  verticalAlign: 'middle',
                }}
              />
              Loading models…
            </div>
          ) : localModels.length === 0 ? (
            <div
              style={{
                padding: '20px',
                textAlign: 'center',
                color: 'var(--text-tertiary)',
                fontSize: '0.83rem',
              }}
            >
              No models found
            </div>
          ) : (
            localModels.map((m, i) => (
              <div
                key={m.name}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px 14px',
                  borderBottom:
                    i < localModels.length - 1
                      ? '1px solid var(--border)'
                      : 'none',
                  transition: 'background 0.12s',
                  animation: `fadeIn 0.2s ${i * 0.04}s both`,
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = 'var(--bg-hover)')
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = 'transparent')
                }
              >
                <div style={{ minWidth: 0, paddingRight: 12 }}>
                  <div
                    style={{
                      fontSize: '0.84rem',
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                    title={m.name}
                  >
                    {m.name}
                  </div>
                  <div
                    style={{
                      fontSize: '0.75rem',
                      color: 'var(--text-tertiary)',
                      display: 'flex',
                      gap: 6,
                      marginTop: 2,
                    }}
                  >
                    <span
                      style={{ display: 'flex', alignItems: 'center', gap: 3 }}
                    >
                      <HardDrive size={10} /> {m.size_str}
                    </span>
                    <span
                      style={{
                        background: 'var(--bg-code)',
                        color: 'var(--text-secondary)',
                        padding: '0 5px',
                        borderRadius: 4,
                        fontFamily: 'monospace',
                        fontSize: '0.72rem',
                      }}
                    >
                      {m.quant}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setFileToDelete(m.name)}
                  className="
                    flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-[7px] cursor-pointer
                    border-[1px] border-solid border-[color-mix(in_srgb,var(--danger)_30%,transparent)]
                    bg-[color-mix(in_srgb,var(--danger)_8%,transparent)]
                    text-[var(--danger)]
                    transition-all duration-120
                    hover:bg-[var(--danger)]
                    hover:text-white
                  "
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
          <p
            style={{
              fontSize: '0.875rem',
              color: 'var(--text-secondary)',
              marginBottom: 10,
            }}
          >
            Are you sure you want to permanently delete this model?
          </p>
          <div
            style={{
              background: 'var(--bg-elevated)',
              padding: '8px 12px',
              borderRadius: 8,
              border: '1px solid var(--border)',
            }}
          >
            <code
              style={{
                fontSize: '0.78rem',
                color: 'var(--danger)',
                wordBreak: 'break-all',
              }}
            >
              {fileToDelete}
            </code>
          </div>
        </Modal>
      </section>

      {/* Download */}
      <section>
        {sectionTitle('Download Model')}

        {/* HF link */}
        <a
          href="https://huggingface.co/models?pipeline_tag=text-generation&library=gguf&sort=trending"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 14px',
            borderRadius: 10,
            marginBottom: 10,
            background: 'color-mix(in srgb, #f59e0b 8%, transparent)',
            border: '1px solid color-mix(in srgb, #f59e0b 30%, transparent)',
            color: '#d97706',
            textDecoration: 'none',
            fontSize: '0.83rem',
            fontWeight: 500,
            transition: 'background 0.12s',
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: '1.1rem' }}>🤗</span> Browse HuggingFace
            GGUF
          </span>
          <ExternalLink size={14} />
        </a>

        {/* Repo search */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
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
            style={{ flex: 1, padding: '8px 12px', fontSize: '0.83rem' }}
          />
          {btn(
            isSearchingHf ? (
              <>
                <span
                  style={{
                    width: 12,
                    height: 12,
                    border: '2px solid #fff',
                    borderTopColor: 'transparent',
                    borderRadius: '50%',
                    display: 'inline-block',
                    animation: 'spinSlow 1s linear infinite',
                  }}
                />{' '}
                Fetching…
              </>
            ) : (
              'Fetch'
            ),
            () => {
              if (repoInput.trim()) {
                searchHuggingFace(repoInput.trim());
                setSelectedHfUrl('');
              }
            },
            'primary',
            isSearchingHf || !repoInput.trim(),
          )}
        </div>

        {hfFiles.length > 0 && (
          <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <div style={{ flex: 1 }}>
              <Combobox
                className="w-full"
                options={hfFiles.map((f) => ({
                  value: f.url,
                  searchText: `${f.name} ${f.size_str} ${f.quant}`,
                  label: (
                    <div style={{ lineHeight: 1.3 }}>
                      <div
                        style={{
                          fontSize: '0.83rem',
                          fontWeight: 500,
                          color: 'var(--text-primary)',
                        }}
                        title={f.name}
                      >
                        {f.name}
                      </div>
                      <div
                        style={{
                          fontSize: '0.75rem',
                          color: 'var(--text-tertiary)',
                        }}
                      >
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
            {btn(
              <>
                <Download size={13} /> Download
              </>,
              () => selectedHfUrl && downloadModel(selectedHfUrl),
              'primary',
              !selectedHfUrl,
            )}
          </div>
        )}

        {/* Direct URL */}
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            type="text"
            placeholder="Direct URL (https://…)"
            value={directUrl}
            onChange={(e) => setDirectUrl(e.target.value)}
            style={{ flex: 1, padding: '8px 12px', fontSize: '0.83rem' }}
          />
          {btn(
            <>
              <Download size={13} /> URL
            </>,
            () => {
              if (directUrl) {
                downloadModel(directUrl);
                setDirectUrl('');
              }
            },
            'ghost',
            !directUrl.trim(),
          )}
        </div>
      </section>

      {/* Active downloads */}
      {activeJobs.length > 0 && (
        <section>
          {sectionTitle('Active Downloads')}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {activeJobs.map((job, i) => (
              <div
                key={job.id}
                style={{
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border)',
                  borderRadius: 10,
                  padding: '12px 14px',
                  animation: `fadeIn 0.2s ${i * 0.05}s both`,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 8,
                  }}
                >
                  <span
                    style={{
                      fontSize: '0.83rem',
                      fontWeight: 500,
                      color: 'var(--text-primary)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      maxWidth: '180px',
                    }}
                    title={job.filename}
                  >
                    {job.filename}
                  </span>
                  {job.status !== 'done' && job.status !== 'cancelled' && (
                    <button
                      onClick={() => cancelDownload(job.id)}
                      style={{
                        fontSize: '0.75rem',
                        color: 'var(--danger)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      Cancel
                    </button>
                  )}
                </div>
                {/* Progress bar */}
                <div
                  style={{
                    background: 'var(--bg-base)',
                    borderRadius: 4,
                    height: 6,
                    overflow: 'hidden',
                    marginBottom: 6,
                  }}
                >
                  <div
                    className={
                      job.status === 'downloading'
                        ? 'progress-bar-animated'
                        : ''
                    }
                    style={{
                      height: '100%',
                      borderRadius: 4,
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
                <div
                  style={{
                    fontSize: '0.75rem',
                    color: 'var(--text-tertiary)',
                    fontFamily: 'monospace',
                  }}
                >
                  {job.status === 'downloading' &&
                    `${(job.speed / 1024 / 1024).toFixed(2)} MB/s · ETA ${Math.round(job.eta)}s · ${(job.progress * 100).toFixed(1)}%`}
                  {job.status === 'done' && (
                    <span style={{ color: 'var(--success)' }}>✓ Complete</span>
                  )}
                  {job.status === 'error' && (
                    <span style={{ color: 'var(--danger)' }}>
                      Error: {job.error}
                    </span>
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
