'use client';

import { useState } from 'react';
import { Dialog } from '@headlessui/react';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; unit: string; price: number; quantity: number }) => void;
};

export default function ManualItemModal({ isOpen, onClose, onSubmit }: Props) {
  const [name, setName] = useState('');
  const [unit, setUnit] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('1');

  const handleSave = () => {
    const priceNum = parseFloat(price);
    const qtyNum = parseFloat(quantity);
    if (!name || !unit || isNaN(priceNum) || isNaN(qtyNum)) return;
    onSubmit({ name, unit, price: priceNum, quantity: qtyNum });
    onClose();
    setName('');
    setUnit('');
    setPrice('');
    setQuantity('1');
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-md rounded-2xl bg-white shadow-xl border border-gray-200 p-6 space-y-5">
          <Dialog.Title className="text-xl font-semibold text-gray-800">
            Добавить позицию вручную
          </Dialog.Title>

          <div className="space-y-3">
            <input
              className="w-full border rounded px-3 py-2 text-sm text-gray-800 bg-white placeholder-gray-400 focus:ring-2 focus:ring-[#3A55DF] focus:outline-none"
              placeholder="Наименование"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              className="w-full border rounded px-3 py-2 text-sm text-gray-800 bg-white placeholder-gray-400 focus:ring-2 focus:ring-[#3A55DF] focus:outline-none"
              placeholder="Ед. изм."
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
            />
            <input
              className="w-full border rounded px-3 py-2 text-sm text-gray-800 bg-white placeholder-gray-400 focus:ring-2 focus:ring-[#3A55DF] focus:outline-none"
              placeholder="Цена"
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
            <input
              className="w-full border rounded px-3 py-2 text-sm text-gray-800 bg-white placeholder-gray-400 focus:ring-2 focus:ring-[#3A55DF] focus:outline-none"
              placeholder="Количество"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
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
