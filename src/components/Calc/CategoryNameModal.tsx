'use client';

import { useState } from 'react';
import { Dialog } from '@headlessui/react';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string) => void;
};

export default function CategoryNameModal({ isOpen, onClose, onSubmit }: Props) {
  const [name, setName] = useState('');

  const handleSave = () => {
    if (!name.trim()) return;
    onSubmit(name.trim());
    setName('');
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-md rounded-xl bg-white p-6 border border-gray-200 shadow-xl space-y-4">
          <Dialog.Title className="text-lg font-semibold text-gray-800">
            Новая категория
          </Dialog.Title>

          <input
            className="w-full border rounded px-3 py-2 text-sm text-gray-800 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3A55DF]"
            placeholder="Введите название категории"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <div className="flex justify-end gap-2">
            <button
              onClick={onClose}
              className="text-sm px-4 py-2 rounded bg-gray-100 hover:bg-gray-200 text-gray-700"
            >
              Отмена
            </button>
            <button
              onClick={handleSave}
              className="bg-[#3A55DF] text-white px-4 py-2 rounded text-sm hover:bg-[#2e46c5]"
            >
              Сохранить
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
