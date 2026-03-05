import React, { useEffect, useState, useMemo } from 'react';
import { useHistory } from '../hooks/useHistory';
import { Modal } from '../../../components/ui/Modal';

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
  } = useHistory();

  const [selected, setSelected] = useState<string | null>(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [renameOpen, setRenameOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  const filtered = useMemo(() => {
    if (!search.trim()) return sessions;
    return sessions.filter((s) =>
      s.title.toLowerCase().includes(search.toLowerCase()),
    );
  }, [sessions, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  const openCreate = () => {
    setFormTitle('New Chat');
    setCreateOpen(true);
  };

  const handleCreate = async () => {
    if (!formTitle.trim()) return;
    await createSession(formTitle.trim());
    setCreateOpen(false);
    setFormTitle('');
  };

  const openRename = (id: string, currentTitle: string) => {
    setPendingId(id);
    setFormTitle(currentTitle);
    setRenameOpen(true);
  };

  const handleRename = async () => {
    if (!pendingId || !formTitle.trim()) return;
    await renameSession(pendingId, formTitle.trim());
    setRenameOpen(false);
    setPendingId(null);
    setFormTitle('');
  };

  const openDelete = (id: string) => {
    setPendingId(id);
    setDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!pendingId) return;
    await deleteSession(pendingId);
    if (selected === pendingId) setSelected(null);
    setDeleteOpen(false);
    setPendingId(null);
  };

  const handleSelect = async (id: string) => {
    setSelected(id);

    if (getChatHistory) {
      await getChatHistory(id);
    }
  };

  return (
    <div className="flex flex-col  bg-slate-800 p-4 rounded-lg text-slate-200 rounded-xl border border-neutral-200/20 p-2 shadow-sm space-y-1">
      {/* 🟢 ส่วนจัดการด้านบน (Top Controls) */}
      <div className="flex flex-col gap-3 mb-4">
        <div className="flex items-center justify-between">
          <strong className="text-lg font-semibold">Chat History</strong>
          <button
            onClick={openCreate}
            className="text-sm px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded transition-colors"
          >
            + New Chat
          </button>
        </div>

        <input
          placeholder="Search sessions..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full text-sm px-3 py-2 rounded bg-slate-900 border border-slate-700 text-slate-200 outline-none focus:border-blue-500 transition-colors"
        />
      </div>

      {loading && (
        <div className="text-sm text-slate-400 my-2">Loading sessions...</div>
      )}
      {error && <div className="text-sm text-red-400 my-2">{error}</div>}

      {/* 🟢 รายการแชท (ยืดลงด้านล่าง) */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-2">
        {paged.length === 0 && !loading && (
          <div className="text-sm text-slate-500 text-center mt-4">
            No sessions found.
          </div>
        )}

        {paged.map((s) => (
          <div
            key={s.id}
            onClick={() => handleSelect(s.id)}
            className={`group p-3 rounded-md cursor-pointer border transition-all ${
              selected === s.id
                ? 'bg-slate-700 border-slate-500 shadow-sm'
                : 'bg-slate-900 border-transparent hover:bg-slate-700 hover:border-slate-600'
            }`}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1 min-w-0 pr-2">
                <div className="font-medium text-slate-100 truncate">
                  {s.title}
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  {s.updated_at
                    ? new Date(s.updated_at * 1000).toLocaleString()
                    : ''}
                </div>
              </div>

              {/* ปุ่ม Action จะแสดงชัดขึ้นเมื่อเอาเมาส์ไปชี้ (Hover) */}
              <div className="flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openRename(s.id, s.title);
                  }}
                  className="text-xs px-2 py-1 bg-slate-600 hover:bg-slate-500 rounded text-slate-200"
                >
                  Rename
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openDelete(s.id);
                  }}
                  className="text-xs px-2 py-1 bg-red-900 hover:bg-red-800 rounded text-red-200"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 🟢 Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-700 text-sm text-slate-400">
          <div>
            Page {page} of {totalPages}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed rounded"
            >
              Prev
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed rounded"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* 🟢 Modals */}
      <Modal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        onConfirm={handleCreate}
        title="Create Session"
        confirmText="Create"
        confirmVariant="primary"
      >
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">
            Chat Title
          </label>
          <input
            value={formTitle}
            onChange={(e) => setFormTitle(e.target.value)}
            placeholder="Enter a title..."
            className="w-full p-2 rounded border border-neutral-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
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
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">
            New Title
          </label>
          <input
            value={formTitle}
            onChange={(e) => setFormTitle(e.target.value)}
            className="w-full p-2 rounded border border-neutral-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
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
        <p className="text-slate-700">
          Are you sure you want to delete this session? This action cannot be
          undone.
        </p>
      </Modal>
    </div>
  );
};

export default ChatHistoryTab;
