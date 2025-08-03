'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { searchMaterials } from '@/api/material';
import { useAuth } from '@/hooks/useAuth';
import ReactDOM from 'react-dom';

interface MaterialSearchProps {
  onSelect: (material: { id: string; name: string; price: number; unit: string }) => void;
  onClose: () => void;
  categoryId?: number;
  cellType?: string;
  anchorRef?: React.RefObject<HTMLInputElement>;
  dropdownMinWidth?: number;
}

export default function MaterialSearch({
  onSelect,
  onClose,
  categoryId,
  cellType,
  anchorRef,
  dropdownMinWidth,
}: MaterialSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [materials, setMaterials] = useState<
    Array<{ id: number; name: string; price: number; unit: string }>
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);
  const { token, loading: authLoading } = useAuth();
  const searchRef = useRef<HTMLDivElement>(null);
  const mountedRef = useRef(true);
  const [dropdownPos, setDropdownPos] = useState({ left: 0, top: 0, width: 0 });

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const handleClickOutside = useCallback(
    (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [handleClickOutside]);

  const performSearch = useCallback(
    async (term: string) => {
      if (!term.trim()) {
        setMaterials([]);
        return;
      }

      if (authLoading) {
        return;
      }

      if (!token) {
        setError('Требуется авторизация');
        setMaterials([]);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const results = await searchMaterials(term, token);
        if (mountedRef.current) {
          if (results && Array.isArray(results)) {
            // Filter by category if categoryId is provided
            let filteredResults = categoryId
              ? results.filter((item) => item.category === categoryId)
              : results;

            // Filter by cell type if provided
            if (cellType) {
              const cellTypeKeywords: { [key: string]: string[] } = {
                switch: ['выключатель', 'автоматический выключатель', 'автомат'],
                rza: ['рза', 'релейная защита', 'автоматика'],
                counter: ['счетчик'],
                sr: ['ср', 'сигнальное реле'],
                tsn: ['тсн', 'трансформатор собственных нужд'],
                tn: ['тн', 'трансформатор напряжения'],
                pu: ['пу', 'прибор учета'],
                disconnector: ['разъединитель'],
                busbar: ['сборные шины', 'шины'],
                busbridge: ['шинный мост'],
              };

              const keywords = cellTypeKeywords[cellType.toLowerCase()] || [];
              // Если пользователь ничего не ввёл, фильтруем по ключевым словам cellType
              if (!term.trim() && keywords.length > 0) {
                filteredResults = filteredResults.filter((item) =>
                  keywords.some((keyword) =>
                    item.name.toLowerCase().includes(keyword.toLowerCase())
                  )
                );
              }
              // Если пользователь что-то ввёл, ищем только по его запросу (уже реализовано через searchMaterials)
            }

            // Remove duplicates by id
            const uniqueResults = Array.from(
              new Map(filteredResults.map((item) => [item.id, item])).values()
            );
            setMaterials(uniqueResults);
          } else {
            setMaterials([]);
          }
        }
      } catch {
        if (mountedRef.current) {
          setError('Ошибка при поиске материалов');
          setMaterials([]);
        }
      } finally {
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    },
    [token, authLoading, categoryId, cellType]
  );

  useEffect(() => {
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    searchTimeout.current = setTimeout(() => {
      performSearch(searchTerm);
    }, 300);

    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, [searchTerm, performSearch]);

  // Вычислять позицию dropdown если anchorRef есть
  useEffect(() => {
    if (!anchorRef || !anchorRef.current) return;
    const updateDropdownPos = () => {
      const rect = anchorRef.current!.getBoundingClientRect();
      setDropdownPos({ left: rect.left, top: rect.bottom, width: rect.width });
    };
    updateDropdownPos();
    window.addEventListener('resize', updateDropdownPos);
    window.addEventListener('scroll', updateDropdownPos, true);
    return () => {
      window.removeEventListener('resize', updateDropdownPos);
      window.removeEventListener('scroll', updateDropdownPos, true);
    };
  }, [anchorRef]);

  const handleMaterialSelect = useCallback(
    (material: { id: string; name: string; price: number; unit: string }) => {
      onSelect(material);
      onClose();
    },
    [onSelect, onClose]
  );

  if (anchorRef && anchorRef.current) {
    // Вычисляем смещение влево, если dropdown шире кнопки
    let left = dropdownPos.left;
    let width = dropdownMinWidth
      ? Math.max(dropdownPos.width, dropdownMinWidth)
      : dropdownPos.width;
    if (dropdownMinWidth && width > dropdownPos.width) {
      left = left - (width - dropdownPos.width) / 2;
      if (left < 0) left = 0;
    }
    return (
      <>
        {ReactDOM.createPortal(
          <div
            className="z-[99999] bg-white border border-gray-200 rounded-lg shadow-lg max-h-[400px] overflow-y-auto"
            style={{
              position: 'fixed',
              left,
              top: dropdownPos.top,
              width,
              minWidth: dropdownMinWidth || undefined,
              boxSizing: 'border-box',
            }}
          >
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Введите название материала..."
              className="w-full px-4 py-2 border-b border-gray-200 focus:outline-none text-gray-800 placeholder-gray-500"
              style={{ width: '100%' }}
              autoFocus
            />
            {(loading || materials.length > 0 || error) && (
              <div>
                {loading ? (
                  <div className="p-4 text-center text-gray-500">Поиск...</div>
                ) : error ? (
                  <div className="p-4 text-center text-red-500">{error}</div>
                ) : materials.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">Ничего не найдено</div>
                ) : (
                  <ul className="w-full divide-y divide-gray-200">
                    {materials.map((material) => (
                      <li
                        key={material.id}
                        className="w-full px-4 py-3 hover:bg-gray-50 cursor-pointer"
                        style={{ width: '100%' }}
                        onClick={() =>
                          handleMaterialSelect({
                            id: material.id.toString(),
                            name: material.name,
                            price: material.price,
                            unit: material.unit,
                          })
                        }
                      >
                        <div className="flex justify-between items-center w-full">
                          <div className="text-sm font-medium text-gray-800">{material.name}</div>
                          <div className="text-sm text-gray-600">
                            {material.price.toLocaleString()} ₸
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>,
          document.body
        )}
      </>
    );
  }

  // Старое поведение если anchorRef нет
  return (
    <div ref={searchRef} className="relative">
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Введите название материала..."
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3A55DF] focus:border-[#3A55DF]"
        autoFocus
      />

      {(loading || materials.length > 0 || error) && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-[500px] overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-gray-500">Поиск...</div>
          ) : error ? (
            <div className="p-4 text-center text-red-500">{error}</div>
          ) : materials.length === 0 ? (
            <div className="p-4 text-center text-gray-500">Ничего не найдено</div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {materials.map((material) => (
                <li
                  key={material.id}
                  className="px-4 py-3 hover:bg-gray-50 cursor-pointer"
                  onClick={() =>
                    handleMaterialSelect({
                      id: material.id.toString(),
                      name: material.name,
                      price: material.price,
                      unit: material.unit,
                    })
                  }
                >
                  <div className="flex justify-between items-center">
                    <div className="text-sm font-medium text-gray-900">{material.name}</div>
                    <div className="text-sm text-gray-500">{material.price.toLocaleString()} ₸</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
