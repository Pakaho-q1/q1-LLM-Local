import React, { useEffect, useState, useMemo } from 'react';
import { useHistory } from '../hooks/useHistory';
import { Modal } from '@/components/ui/Modal';
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export const ChatHistoryTab: React.FC = () => {
  const {
    sessions,
    loading,
    error,
    fetchSessions,
    createSession,
    renameSession,
    deleteSession,
    getChatHistory,
    lastSessionKey,
  } = useHistory();

  const [selected, setSelected] = useState<string | null>(() =>
    localStorage.getItem(lastSessionKey),
  );
  const [createOpen, setCreateOpen] = useState(false);
  const [renameOpen, setRenameOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 12;

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);
  useEffect(() => {
    setPage(1);
  }, [search]);

  useEffect(() => {
    if (sessions.length === 0) return;
    const savedId = localStorage.getItem(lastSessionKey);
    if (savedId && sessions.some((s) => s.id === savedId) && !selected) {
      setSelected(savedId);
      getChatHistory(savedId);
    }
  }, [sessions]);

  useEffect(() => {
    if (
      selected &&
      sessions.length > 0 &&
      !sessions.some((s) => s.id === selected)
    ) {
      setSelected(null);
    }
  }, [sessions]);

  const filtered = useMemo(() => {
    if (!search.trim()) return sessions;
    return sessions.filter((s) =>
      s.title.toLowerCase().includes(search.toLowerCase()),
    );
  }, [sessions, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  const handleSelect = async (id: string) => {
    setSelected(id);
    await getChatHistory(id);
  };

  const handleCreate = async () => {
    if (!formTitle.trim()) return;
    setCreateOpen(false);
    await createSession(formTitle.trim());
    setFormTitle('');
  };

  const handleRename = async () => {
    if (!pendingId || !formTitle.trim()) return;
    setRenameOpen(false);
    await renameSession(pendingId, formTitle.trim());
    setPendingId(null);
    setFormTitle('');
  };

  const handleDelete = async () => {
    if (!pendingId) return;
    setDeleteOpen(false);
    if (selected === pendingId) setSelected(null);
    await deleteSession(pendingId);
    setPendingId(null);
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '8px 12px',
    fontSize: '0.83rem',
    background: 'var(--bg-elevated)',
    border: '1px solid var(--border)',
    borderRadius: 8,
    color: 'var(--text-primary)',
    outline: 'none',
    transition: 'border-color 0.15s, box-shadow 0.15s',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 2,
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
          {loading
            ? '...'
            : `${filtered.length} Session${filtered.length !== 1 ? 's' : ''}`}
        </span>
        <button
          onClick={() => {
            setFormTitle('New Chat');
            setCreateOpen(true);
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            padding: '6px 12px',
            borderRadius: 8,
            fontSize: '0.78rem',
            fontWeight: 600,
            background: 'var(--accent)',
            color: '#fff',
            border: 'none',
            cursor: 'pointer',
            boxShadow:
              '0 1px 4px color-mix(in srgb, var(--accent) 35%, transparent)',
            transition: 'opacity 0.15s',
          }}
        >
          <Plus size={13} /> New Chat
        </button>
      </div>

      {/* Search */}
      <div style={{ position: 'relative' }}>
        <Search
          size={13}
          style={{
            position: 'absolute',
            left: 10,
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--text-tertiary)',
            pointerEvents: 'none',
          }}
        />
        <input
          placeholder="Search sessions…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ ...inputStyle, paddingLeft: 30 }}
        />
      </div>

      {error && (
        <div
          style={{
            color: 'var(--danger)',
            fontSize: '0.8rem',
            padding: '4px 0',
          }}
        >
          {error}
        </div>
      )}

      {/* Session list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {loading && sessions.length === 0 ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '16px 0',
              color: 'var(--text-tertiary)',
              fontSize: '0.83rem',
            }}
          >
            <span
              style={{
                width: 14,
                height: 14,
                border: '2px solid var(--accent)',
                borderTopColor: 'transparent',
                borderRadius: '50%',
                display: 'inline-block',
                animation: 'spinSlow 1s linear infinite',
              }}
            />
            Loading…
          </div>
        ) : paged.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '20px 0',
              color: 'var(--text-tertiary)',
              fontSize: '0.83rem',
            }}
          >
            {search ? 'No results' : 'No sessions yet'}
          </div>
        ) : (
          paged.map((s, i) => {
            const isActive = selected === s.id;
            return (
              <div
                key={s.id}
                onClick={() => handleSelect(s.id)}
                className="group"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '9px 10px',
                  borderRadius: 10,
                  cursor: 'pointer',
                  background: isActive ? 'var(--accent-subtle)' : 'transparent',
                  border: `1px solid ${isActive ? 'color-mix(in srgb, var(--accent) 28%, transparent)' : 'transparent'}`,
                  transition: 'background 0.14s, border-color 0.14s',
                  animation: `fadeIn 0.2s ${i * 0.02}s both`,
                }}
                onMouseEnter={(e) => {
                  if (!isActive)
                    e.currentTarget.style.background = 'var(--bg-hover)';
                }}
                onMouseLeave={(e) => {
                  if (!isActive)
                    e.currentTarget.style.background = 'transparent';
                }}
              >
                <MessageSquare
                  size={13}
                  style={{
                    color: isActive ? 'var(--accent)' : 'var(--text-tertiary)',
                    flexShrink: 0,
                    marginRight: 9,
                  }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: '0.84rem',
                      fontWeight: isActive ? 600 : 400,
                      color: isActive ? 'var(--accent)' : 'var(--text-primary)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {s.title}
                  </div>
                  <div
                    style={{
                      fontSize: '0.7rem',
                      color: 'var(--text-tertiary)',
                      marginTop: 1,
                    }}
                  >
                    {s.updated_at
                      ? new Date(s.updated_at * 1000).toLocaleDateString(
                          undefined,
                          { month: 'short', day: 'numeric' },
                        )
                      : ''}
                  </div>
                </div>
                {/* Hover actions */}
                <div className="group-hover:opacity-100 flex items-center gap-2 opacity-0 transition-opacity duration-140">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPendingId(s.id);
                      setFormTitle(s.title);
                      setRenameOpen(true);
                    }}
                    className="
                    flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-[7px] cursor-pointer
                    border-[1px] border-solid border-stone-500/30
                    bg-stone-500/30
                    text-stone-500
                    transition-all duration-120
                    hover:bg-stone-500
                    hover:text-white
                  "
                    title="Rename"
                  >
                    <Edit2 size={12} />
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPendingId(s.id);
                      setDeleteOpen(true);
                    }}
                    className="
                    flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-[7px] cursor-pointer
                    border-[1px] border-solid border-[color-mix(in_srgb,var(--danger)_30%,transparent)]
                    bg-[color-mix(in_srgb,var(--danger)_8%,transparent)]
                    text-[var(--danger)]
                    transition-all duration-120
                    hover:bg-[var(--danger)]
                    hover:text-white
                  "
                    title="Delete"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: 8,
            borderTop: '1px solid var(--border)',
            marginTop: 2,
          }}
        >
          <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
            {page} / {totalPages}
          </span>
          <div style={{ display: 'flex', gap: 4 }}>
            {[
              {
                icon: <ChevronLeft size={13} />,
                action: () => setPage((p) => Math.max(1, p - 1)),
                disabled: page === 1,
              },
              {
                icon: <ChevronRight size={13} />,
                action: () => setPage((p) => Math.min(totalPages, p + 1)),
                disabled: page === totalPages,
              },
            ].map(({ icon, action, disabled }, i) => (
              <button
                key={i}
                onClick={action}
                disabled={disabled}
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: 7,
                  border: '1px solid var(--border)',
                  background: 'var(--bg-elevated)',
                  color: 'var(--text-secondary)',
                  cursor: disabled ? 'not-allowed' : 'pointer',
                  opacity: disabled ? 0.4 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {icon}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      <Modal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        onConfirm={handleCreate}
        title="New Chat"
        confirmText="Create"
        confirmVariant="primary"
      >
        <div>
          <label
            style={{
              display: 'block',
              fontSize: '0.8rem',
              fontWeight: 500,
              color: 'var(--text-secondary)',
              marginBottom: 6,
            }}
          >
            Chat Title
          </label>
          <input
            value={formTitle}
            onChange={(e) => setFormTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            autoFocus
            style={inputStyle}
            placeholder="Enter a title…"
          />
        </div>
      </Modal>

      <Modal
        isOpen={renameOpen}
        onClose={() => setRenameOpen(false)}
        onConfirm={handleRename}
        title="Rename Session"
        confirmText="Save"
        confirmVariant="primary"
      >
        <div>
          <label
            style={{
              display: 'block',
              fontSize: '0.8rem',
              fontWeight: 500,
              color: 'var(--text-secondary)',
              marginBottom: 6,
            }}
          >
            New Title
          </label>
          <input
            value={formTitle}
            onChange={(e) => setFormTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleRename()}
            autoFocus
            style={inputStyle}
          />
        </div>
      </Modal>

      <Modal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete Session"
        confirmText="Delete"
        confirmVariant="danger"
      >
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          This session will be permanently deleted and cannot be recovered.
        </p>
      </Modal>
    </div>
  );
};

export default ChatHistoryTab;
