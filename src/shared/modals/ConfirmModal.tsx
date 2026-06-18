'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';

let resolvePromise: (result: boolean) => void;

export const showConfirm = ({
  title,
  message,
  confirmText,
  cancelText,
  confirmVariant,
}: {
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: 'danger' | 'primary';
}): Promise<boolean> => {
  const event = new CustomEvent('open-confirm-modal', {
    detail: { title, message, confirmText, cancelText, confirmVariant },
  });
  window.dispatchEvent(event);

  return new Promise((resolve) => {
    resolvePromise = resolve;
  });
};

export default function ConfirmModalContainer() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('Вы уверены?');
  const [message, setMessage] = useState('Это действие нельзя отменить.');
  const [confirmText, setConfirmText] = useState('Удалить');
  const [cancelText, setCancelText] = useState('Отмена');
  const [confirmVariant, setConfirmVariant] = useState<'danger' | 'primary'>('danger');

  useEffect(() => {
    const handler = (e: any) => {
      setTitle(e.detail?.title || 'Вы уверены?');
      setMessage(e.detail?.message || 'Это действие нельзя отменить.');
      setConfirmText(e.detail?.confirmText || 'Удалить');
      setCancelText(e.detail?.cancelText || 'Отмена');
      setConfirmVariant(e.detail?.confirmVariant || 'danger');
      setOpen(true);
    };
    window.addEventListener('open-confirm-modal', handler);
    return () => window.removeEventListener('open-confirm-modal', handler);
  }, []);

  const handleConfirm = () => {
    setOpen(false);
    resolvePromise(true);
  };

  const handleCancel = () => {
    setOpen(false);
    resolvePromise(false);
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      handleCancel();
    }
  };

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md border border-gray-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div
          className={`px-6 py-5 border-b flex items-start gap-3 ${
            confirmVariant === 'primary'
              ? 'bg-[#8eba1e]/5 border-[#8eba1e]/20'
              : 'bg-red-50/70 border-red-100'
          }`}
        >
          <div
            className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
              confirmVariant === 'primary' ? 'bg-[#8eba1e]/15' : 'bg-red-100'
            }`}
          >
            {confirmVariant === 'primary' ? (
              <CheckCircle2 className="w-5 h-5 text-[#7aa31a]" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-red-600" />
            )}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
            <p className="mt-1.5 text-sm text-gray-600 leading-relaxed">{message}</p>
          </div>
        </div>
        <div className="px-6 py-4 bg-gray-50/80 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={handleCancel}
            className="px-5 py-2.5 text-sm font-medium rounded-xl bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 transition-all"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            className={`px-5 py-2.5 text-sm font-medium rounded-xl text-white transition-all shadow-lg ${
              confirmVariant === 'primary'
                ? 'bg-[#8eba1e] hover:bg-[#7aa31a] hover:shadow-[#8eba1e]/30'
                : 'bg-red-600 hover:bg-red-700 hover:shadow-red-500/30'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
