'use client';

import React from 'react';

interface SwitchgearFiltersProps {
  filters: {
    type: string;
    amperage: string;
    group: string;
  };
  onFilterChange: (filters: { type: string; amperage: string; group: string }) => void;
  configurations: any[];
}

export function SwitchgearFilters({
  filters,
  onFilterChange,
  configurations,
}: SwitchgearFiltersProps) {
  // Получаем уникальные значения для фильтров
  const types = Array.from(new Set(configurations.map((config) => config.type)));
  const groups = Array.from(new Set(configurations.map((config) => config.group)));
  const amperages = Array.from(new Set(configurations.map((config) => config.amperage)));

  return (
    <div className="mb-6 grid grid-cols-3 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Тип</label>
        <select
          value={filters.type}
          onChange={(e) => onFilterChange({ ...filters, type: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Все типы</option>
          {types.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Ток</label>
        <select
          value={filters.amperage}
          onChange={(e) => onFilterChange({ ...filters, amperage: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Все токи</option>
          {amperages.map((amperage) => (
            <option key={amperage} value={amperage}>
              {amperage}А
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Группа</label>
        <select
          value={filters.group}
          onChange={(e) => onFilterChange({ ...filters, group: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Все группы</option>
          {groups.map((group) => (
            <option key={group} value={group}>
              {group}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
