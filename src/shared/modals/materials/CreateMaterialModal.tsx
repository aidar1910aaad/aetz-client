'use client';

import { useState, useRef } from 'react';
import { CreateMaterialRequest } from '@/api/material';
import { useMaterials } from '@/hooks/useMaterials';
import { showToast } from '@/shared/modals/ToastProvider';

interface Props {
  onClose: () => void;
  onCreate: (data: CreateMaterialRequest) => Promise<void>;
}

export default function CreateMaterialModal({ onClose, onCreate }: Props) {
  const { handleCreate, allCategories } = useMaterials();

  const [form, setForm] = useState<CreateMaterialRequest>({
    name: '',
    unit: '',
    price: 0,
    categoryId: 0,
    code: '',
  });

  const [search, setSearch] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  const filteredCategories = allCategories.filter((cat) =>
    cat.name.toLowerCase().includes(search.toLowerCase())
  );

  const selectedCategory = allCategories.find((cat) => cat.id === form.categoryId);

  const handleSubmit = async () => {
    if (!form.name || !form.unit || !form.price || !form.categoryId) {
      showToast('Пожалуйста, заполните все поля', 'error');
      return;
    }

    const { code, ...rest } = form;
    const dataToSend = code?.trim() ? form : rest;

    await onCreate(dataToSend as CreateMaterialRequest);
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center"
      onClick={handleBackdropClick}
    >
      <div ref={modalRef} className="bg-white p-6 rounded-lg w-full max-w-md relative">
        {/* X-кнопка */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-xl"
        >
          ×
        </button>

        <h2 className="text-xl font-semibold mb-4">Создать материал</h2>

        <input
          type="text"
          placeholder="Название"
          className="border p-2 rounded w-full mb-3 text-sm"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <input
          type="text"
          placeholder="Единица измерения (шт, м и т.п.)"
          className="border p-2 rounded w-full mb-3 text-sm"
          value={form.unit}
          onChange={(e) => setForm({ ...form, unit: e.target.value })}
        />

        <input
          type="number"
          placeholder="Цена"
          className="border p-2 rounded w-full mb-3 text-sm placeholder:text-gray-400"
          value={form.price || ''}
          onChange={(e) => setForm({ ...form, price: +e.target.value })}
        />

        <input
          type="text"
          placeholder="Код (опционально)"
          className="border p-2 rounded w-full mb-3 text-sm"
          value={form.code || ''}
          onChange={(e) => setForm({ ...form, code: e.target.value })}
        />

        {/* Поиск категории */}
        <div className="mb-4 relative">
          <div className="relative">
            <input
              type="text"
              placeholder="Поиск категории..."
              className="border px-3 py-2 rounded w-full text-sm pr-8"
              value={search || selectedCategory?.name || ''}
              onChange={(e) => {
                setSearch(e.target.value);
                setDropdownOpen(true);
                setForm({ ...form, categoryId: 0 });
              }}
              onFocus={() => setDropdownOpen(true)}
            />
            {selectedCategory && (
              <button
                onClick={() => {
                  setForm({ ...form, categoryId: 0 });
                  setSearch('');
                  setDropdownOpen(true);
                }}
                className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            )}
          </div>

          {dropdownOpen && (
            <ul className="absolute z-50 mt-1 w-full max-h-40 overflow-y-auto bg-white border rounded shadow text-sm">
              {filteredCategories.length === 0 ? (
                <li className="px-4 py-2 text-gray-500">Ничего не найдено</li>
              ) : (
                filteredCategories.map((cat) => (
                  <li
                    key={cat.id}
                    onClick={() => {
                      setForm({ ...form, categoryId: cat.id });
                      setSearch(cat.name);
                      setDropdownOpen(false);
                    }}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  >
                    {cat.name}
                  </li>
                ))
              )}
            </ul>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded bg-gray-200 hover:bg-gray-300"
          >
            Отмена
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 text-sm rounded bg-[#3A55DF] text-white hover:bg-blue-700"
          >
            Создать
          </button>
        </div>
      </div>
    </div>
  );
}
