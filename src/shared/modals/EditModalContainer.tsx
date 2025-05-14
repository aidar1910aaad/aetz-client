'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

let resolveModal: (value: string | null) => void;

export const showEditModal = ({
  title,
  initialValue,
  placeholder,
}: {
  title?: string;
  initialValue?: string;
  placeholder?: string;
}): Promise<string | null> => {
  const event = new CustomEvent('open-edit-modal', {
    detail: { title, initialValue, placeholder },
  });
  window.dispatchEvent(event);

  return new Promise((resolve) => {
    resolveModal = resolve;
  });
};

export default function EditModalContainer() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');
  const [initial, setInitial] = useState('');
  const [title, setTitle] = useState('Редактировать');
  const [placeholder, setPlaceholder] = useState('Введите значение');

  useEffect(() => {
    const handler = (e: any) => {
      setTitle(e.detail?.title || 'Редактировать');
      setInitial(e.detail?.initialValue || '');
      setValue(e.detail?.initialValue || '');
      setPlaceholder(e.detail?.placeholder || 'Введите значение');
      setOpen(true);
    };
    window.addEventListener('open-edit-modal', handler);
    return () => window.removeEventListener('open-edit-modal', handler);
  }, []);

  const handleCancel = () => {
    setOpen(false);
    resolveModal(null);
  };

  const handleSave = () => {
    setOpen(false);
    resolveModal(value.trim());
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) handleCancel();
  };

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center"
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-lg shadow-xl p-6 w-[90%] max-w-md text-sm">
        <h2 className="text-lg font-semibold mb-4 text-black">{title}</h2>
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          className="w-full border border-gray-300 px-4 py-2 rounded text-black focus:outline-[#3A55DF]"
        />
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-sm rounded bg-gray-100 hover:bg-gray-200 text-black"
          >
            Отмена
          </button>
          <button
            onClick={handleSave}
            disabled={!value.trim() || value.trim() === initial}
            className="px-4 py-2 text-sm rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            Сохранить
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
