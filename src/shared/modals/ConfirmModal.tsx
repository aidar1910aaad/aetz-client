'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

let resolvePromise: (result: boolean) => void;

export const showConfirm = ({
  title,
  message,
}: {
  title?: string;
  message?: string;
}): Promise<boolean> => {
  const event = new CustomEvent('open-confirm-modal', {
    detail: { title, message },
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

  useEffect(() => {
    const handler = (e: any) => {
      setTitle(e.detail?.title || 'Вы уверены?');
      setMessage(e.detail?.message || 'Это действие нельзя отменить.');
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
      className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center"
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-lg shadow-xl p-6 w-[90%] max-w-md text-sm">
        <h2 className="text-lg font-semibold mb-2 text-black">{title}</h2>
        <p className="mb-4 text-black">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-sm rounded bg-gray-100 hover:bg-gray-200 text-black"
          >
            Отмена
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 text-sm rounded bg-red-600 text-white hover:bg-red-700"
          >
            Подтвердить
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
