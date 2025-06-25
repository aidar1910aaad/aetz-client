'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { searchMaterials } from '@/api/material';
import { useAuth } from '@/hooks/useAuth';

interface MaterialSearchProps {
  onSelect: (material: { id: string; name: string; price: number }) => void;
  onClose: () => void;
  categoryId?: number;
  cellType?: string;
}

export default function MaterialSearch({
  onSelect,
  onClose,
  categoryId,
  cellType,
}: MaterialSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [materials, setMaterials] = useState<Array<{ id: number; name: string; price: number }>>(
    []
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchTimeout = useRef<NodeJS.Timeout>();
  const { token, loading: authLoading } = useAuth();
  const searchRef = useRef<HTMLDivElement>(null);
  const mountedRef = useRef(true);

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
                vacuum: ['вакуумный выключатель'],
                counter: ['счетчик'],
                sr: ['ср', 'сигнальное реле'],
                tsn: ['тсн', 'трансформатор собственных нужд'],
                tn: ['тн', 'трансформатор напряжения'],
              };

              const keywords = cellTypeKeywords[cellType.toLowerCase()] || [];
              if (keywords.length > 0) {
                filteredResults = filteredResults.filter((item) =>
                  keywords.some((keyword) =>
                    item.name.toLowerCase().includes(keyword.toLowerCase())
                  )
                );
              }
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
      } catch (err) {
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

  const handleMaterialSelect = useCallback(
    (material: { id: string; name: string; price: number }) => {
      onSelect(material);
      onClose();
    },
    [onSelect, onClose]
  );

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
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
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
