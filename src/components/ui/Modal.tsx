import React, { useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  title: string;
  children: React.ReactNode;
  confirmText?: string;
  confirmVariant?: 'danger' | 'primary';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  children,
  confirmText = 'Confirm',
  confirmVariant = 'primary',
}) => {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-80 overflow-y-auto overflow-x-hidden flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-neutral-900/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-lg transform overflow-hidden rounded-xl bg-white border border-neutral-200 shadow-2xl transition-all scale-100 opacity-100 animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-100 px-4 py-3">
          <h3 className="text-sm font-bold text-neutral-800">{title}</h3>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 transition-colors"
          >
            <svg
              className="size-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-5">
          <div className="text-sm text-neutral-600 leading-relaxed">
            {children}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 border-t border-neutral-100 px-4 py-3 bg-neutral-50/50">
          <button
            onClick={onClose}
            className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-xs font-medium text-neutral-600 hover:bg-neutral-50 transition-colors"
          >
            Cancel
          </button>
          {onConfirm && (
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`rounded-lg px-3 py-2 text-xs font-medium text-white shadow-sm transition-colors ${
                confirmVariant === 'danger'
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {confirmText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
