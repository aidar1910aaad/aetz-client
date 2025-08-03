'use client';

import React, { useEffect, useState, useRef } from 'react';
import ReactDOM from 'react-dom';
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
  const inputRef = useRef<HTMLInputElement>(null);
  const [dropdownPos, setDropdownPos] = useState({ left: 0, top: 0, width: 0 });
  const [dropdownDirection, setDropdownDirection] = useState<'down' | 'up'>('down');

  const handleShowDropdown = () => {
    setShowDropdown(true);
    if (inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      const dropdownHeight = 300; // px
      if (spaceBelow < dropdownHeight && spaceAbove > dropdownHeight) {
        setDropdownDirection('up');
        setDropdownPos({ left: rect.left, top: rect.top, width: rect.width });
      } else {
        setDropdownDirection('down');
        setDropdownPos({ left: rect.left, top: rect.bottom, width: rect.width });
      }
    }
  };

  // Обновлять позицию при scroll/resize
  useEffect(() => {
    if (!showDropdown) return;
    const updateDropdownPos = () => {
      if (inputRef.current) {
        const rect = inputRef.current.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;
        const dropdownHeight = 300; // px
        if (spaceBelow < dropdownHeight && spaceAbove > dropdownHeight) {
          setDropdownDirection('up');
          setDropdownPos({ left: rect.left, top: rect.top, width: rect.width });
        } else {
          setDropdownDirection('down');
          setDropdownPos({ left: rect.left, top: rect.bottom, width: rect.width });
        }
      }
    };
    window.addEventListener('resize', updateDropdownPos);
    window.addEventListener('scroll', updateDropdownPos, true);
    return () => {
      window.removeEventListener('resize', updateDropdownPos);
      window.removeEventListener('scroll', updateDropdownPos, true);
    };
  }, [showDropdown]);

  // Закрытие по клику вне
  useEffect(() => {
    if (!showDropdown) return;
    const handleClick = (e: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showDropdown]);

  useEffect(() => {
    console.log('Поиск по:', debouncedSearch);
    const fetch = async () => {
      if (!debouncedSearch.trim()) return setResults([]);
      try {
        const token = localStorage.getItem('token') || '';
        const data = await getAllMaterials(token);
        setResults(data);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        console.error('Ошибка поиска материалов:', message);
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
              ref={inputRef}
              type="text"
              placeholder="Поиск материалов..."
              value={searchQuery}
              onFocus={handleShowDropdown}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm"
            />

            {showDropdown &&
              results.length > 0 &&
              typeof window !== 'undefined' &&
              document.body &&
              ReactDOM.createPortal(
                <div
                  className="z-[99999] bg-white border rounded shadow max-h-[300px] overflow-y-auto"
                  style={{
                    position: 'fixed',
                    left: dropdownPos.left,
                    top: dropdownDirection === 'down' ? dropdownPos.top : undefined,
                    bottom:
                      dropdownDirection === 'up' ? window.innerHeight - dropdownPos.top : undefined,
                    width: dropdownPos.width,
                  }}
                >
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
                </div>,
                document.body
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
