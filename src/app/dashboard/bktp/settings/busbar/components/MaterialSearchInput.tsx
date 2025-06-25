'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { searchMaterials } from '@/api/material';
import { useAuth } from '@/hooks/useAuth';
import { useDebounce } from '@/hooks/useDebounce';
import { ChevronDown, Search } from 'lucide-react';

interface Material {
  id: string;
  name: string;
  price: number;
}

interface MaterialSearchInputProps {
  onSelect: (material: Material | null) => void;
  initialMaterialName?: string;
}

export default function MaterialSearchInput({
  onSelect,
  initialMaterialName = '',
}: MaterialSearchInputProps) {
  const [searchTerm, setSearchTerm] = useState(initialMaterialName);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  const { token, authLoading } = useAuth();
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const performSearch = useCallback(async () => {
    if (!debouncedSearchTerm.trim()) {
      setMaterials([]);
      setError(null);
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
      const results = await searchMaterials(debouncedSearchTerm, token);
      if (results && Array.isArray(results)) {
        setMaterials(results);
      } else {
        setMaterials([]);
      }
    } catch (err: any) {
      setError(err.message || 'Ошибка при поиске материалов');
      setMaterials([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearchTerm, token, authLoading]);

  useEffect(() => {
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    searchTimeout.current = setTimeout(() => {
      performSearch();
    }, 300);

    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, [searchTerm, performSearch]);

  useEffect(() => {
    if (initialMaterialName) {
      setSearchTerm(initialMaterialName);
    }
  }, [initialMaterialName]);

  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
      setIsDropdownOpen(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [handleClickOutside]);

  const handleMaterialSelect = useCallback(
    (material: Material | null) => {
      if (material) {
        setSearchTerm(material.name);
        onSelect(material);
      } else {
        setSearchTerm('');
        onSelect(null);
      }
      setIsDropdownOpen(false);
    },
    [onSelect]
  );

  const handleFocus = () => {
    setIsDropdownOpen(true);
    if (searchTerm) {
      performSearch();
    }
  };

  return (
    <div ref={searchRef} className="relative">
      {searchTerm && (
        <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
          <span className="break-words">Выбрано: {searchTerm}</span>
          <button
            onClick={() => handleMaterialSelect(null)}
            className="ml-1 text-gray-400 hover:text-gray-600 focus:outline-none"
          >
            X
          </button>
        </div>
      )}
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setIsDropdownOpen(true);
        }}
        onFocus={handleFocus}
        placeholder="Поиск материала..."
        className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
      />

      {isDropdownOpen && (loading || materials.length > 0 || error || searchTerm === '') && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {loading ? (
            <div className="p-2 text-center text-gray-500 text-xs">Поиск...</div>
          ) : error ? (
            <div className="p-2 text-center text-red-500 text-xs">{error}</div>
          ) : searchTerm === '' ? (
            <ul className="divide-y divide-gray-200">
              <li
                className="px-2 py-2 hover:bg-gray-50 cursor-pointer text-xs break-words"
                onClick={() =>
                  handleMaterialSelect({
                    id: 'vacuum-breaker',
                    name: 'Вакуумный выключатель',
                    price: 0,
                  })
                }
              >
                Вакуумный выключатель
              </li>
            </ul>
          ) : materials.length === 0 ? (
            <div className="p-2 text-center text-gray-500 text-xs">Ничего не найдено</div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {materials.map((material) => (
                <li
                  key={material.id}
                  className="px-2 py-2 hover:bg-gray-50 cursor-pointer text-xs"
                  onClick={() => handleMaterialSelect(material)}
                >
                  <div className="text-xs font-medium text-gray-900">{material.name}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
