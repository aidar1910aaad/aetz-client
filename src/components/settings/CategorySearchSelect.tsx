'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, Search } from 'lucide-react';

export interface CategorySearchOption {
  id: number | string;
  name: string;
  value: number | string;
}

interface CategorySearchSelectProps {
  options: CategorySearchOption[];
  onSelect: (value: number | string) => void;
  placeholder?: string;
}

export function CategorySearchSelect({
  options,
  onSelect,
  placeholder = 'Поиск и добавление категории...',
}: CategorySearchSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const filteredOptions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return options;
    return options.filter((option) => option.name.toLowerCase().includes(query));
  }, [options, searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (option: CategorySearchOption) => {
    onSelect(option.value);
    setSearchQuery('');
    setIsOpen(false);
  };

  if (options.length === 0) {
    return null;
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-9 pr-10 text-sm text-gray-700 focus:border-[#3A55DF] focus:outline-none focus:ring-2 focus:ring-[#3A55DF]/20"
        />
        <ChevronDown
          className={`pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </div>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">
          {filteredOptions.length > 0 ? (
            <ul className="max-h-60 overflow-auto">
              {filteredOptions.map((option) => (
                <li key={String(option.id)}>
                  <button
                    type="button"
                    onClick={() => handleSelect(option)}
                    className="w-full px-4 py-2.5 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50"
                  >
                    {option.name}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-4 py-3 text-sm text-gray-500">Категории не найдены</div>
          )}
        </div>
      )}
    </div>
  );
}
