'use client';

import { useEffect, useState } from 'react';
import { Material, getAllMaterials } from '@/api/material';
import { Trash2 } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';

type ManualItem = {
  name: string;
  unit: string;
  price: number;
  quantity: number;
};

type CalcItem = ManualItem & { id?: number };

type Props = {
  categoryId: string;
  name: string;
  open: boolean;
  items: CalcItem[];
  searchQuery: string;
  onToggle: () => void;
  onSearchChange: (value: string) => void;
  onAddManual: () => void;
  onAddMaterial: (material: Material) => void;
  onRemoveItem: (index: number) => void;
  onChangeQuantity: (index: number, value: number) => void;
};

export default function CategoryBlock({
  onChangeQuantity,
  categoryId,
  name,
  open,
  items,
  searchQuery,
  onToggle,
  onSearchChange,
  onAddManual,
  onAddMaterial,
  onRemoveItem,
}: Props) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [results, setResults] = useState<Material[]>([]);
  const debouncedSearch = useDebounce(searchQuery, 400);

  useEffect(() => {
    console.log('Поиск по:', debouncedSearch);
    const fetch = async () => {
      if (!debouncedSearch.trim()) return setResults([]);
      try {
        const token = localStorage.getItem('token') || '';
        const { data } = await getAllMaterials(token, { search: debouncedSearch, limit: 50 });
        setResults(data);
      } catch (err: any) {
        console.error('Ошибка поиска материалов:', err.message);
      }
    };
    fetch();
  }, [debouncedSearch]);

  const handleQuantityChange = (index: number, value: number) => {
    onChangeQuantity(index, value);
  };

  return (
    <div className="mb-6 border rounded-lg bg-white shadow">
      <div
        onClick={onToggle}
        className="cursor-pointer px-4 py-3 font-semibold bg-gray-100 rounded-t-lg flex justify-between items-center"
      >
        <span>{name}</span>
        <span>{open ? '−' : '+'}</span>
      </div>

      {open && (
        <div className="p-4 space-y-4">
          <button
            onClick={onAddManual}
            className="bg-[#3A55DF] text-white px-3 py-1.5 rounded hover:bg-[#2e46c5]"
          >
            + Добавить вручную
          </button>

          <div className="relative">
            <input
              type="text"
              placeholder="Поиск материалов..."
              value={searchQuery}
              onFocus={() => setShowDropdown(true)}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm"
            />

            {showDropdown && results.length > 0 && (
              <div className="absolute z-10 w-full bg-white border mt-1 rounded shadow max-h-72 overflow-y-auto">
                {results.map((m) => (
                  <div
                    key={m.id}
                    onClick={() => {
                      onAddMaterial(m);
                      setShowDropdown(false);
                    }}
                    className="px-3 py-2 cursor-pointer hover:bg-gray-100 text-sm flex justify-between items-center"
                  >
                    <div>
                      <div className="font-medium">{m.name}</div>
                      <div className="text-gray-500 text-xs">
                        {m.unit}, {m.price.toLocaleString()} тг
                      </div>
                    </div>
                    <span className="text-[#3A55DF] text-sm">Добавить</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {items.length === 0 ? (
            <p className="text-sm text-gray-500">Пока нет позиций</p>
          ) : (
            <table className="w-full text-sm border">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2 border">Наименование</th>
                  <th className="p-2 border">Ед.</th>
                  <th className="p-2 border">Цена</th>
                  <th className="p-2 border">Кол-во</th>
                  <th className="p-2 border">Сумма</th>
                  <th className="p-2 border"></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={index}>
                    <td className="p-2 border">{item.name}</td>
                    <td className="p-2 border">{item.unit}</td>
                    <td className="p-2 border">{item.price}</td>
                    <td className="p-2 border">
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleQuantityChange(index, parseFloat(e.target.value))}
                        className="w-16 border rounded px-2 py-1"
                        min={1}
                      />
                    </td>
                    <td className="p-2 border">{(item.price * item.quantity).toLocaleString()}</td>
                    <td className="p-2 border text-right">
                      <button
                        onClick={() => onRemoveItem(index)}
                        className="text-red-500 hover:underline"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
