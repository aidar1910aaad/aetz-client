'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Plus, X, ChevronDown } from 'lucide-react';
import {
  bmzTableConfig,
  transformerTableConfig,
  rusnTableConfig,
  runnTableConfig,
  additionalEquipmentTableConfig,
  worksTableConfig,
  dguTableConfig,
} from '@/components/FinalReview/tableConfigs';

interface TableManagerProps {
  visibleTables: Set<string>;
  onToggleTable: (tableId: string) => void;
  isEditing: boolean;
  // Данные для проверки наличия строк в таблицах
  hasBmzData: boolean;
  hasTransformerData: boolean;
  hasRusnData: boolean;
  hasRunnData: boolean;
  hasAdditionalEquipmentData: boolean;
  hasWorksData: boolean;
  // Проверяем, есть ли хотя бы одна строка в БМЗ (это условие для добавления других таблиц)
  hasBmzRows: boolean;
}

// Маппинг ID таблиц на их названия
const tableNames: Record<string, string> = {
  [bmzTableConfig.id]: 'Блочно модульное здание',
  [transformerTableConfig.id]: 'Трансформатор',
  [rusnTableConfig.id]: 'РУ-10кВ либо РУ-20кВ',
  [runnTableConfig.id]: 'РУ-0.4кВ',
  [additionalEquipmentTableConfig.id]: 'Доп. оборудование',
  [worksTableConfig.id]: 'Работы и транспортные расходы',
  [dguTableConfig.id]: 'ДГУ',
};

// Все доступные таблицы
const allTables = [
  bmzTableConfig.id,
  transformerTableConfig.id,
  rusnTableConfig.id,
  runnTableConfig.id,
  additionalEquipmentTableConfig.id,
  worksTableConfig.id,
  dguTableConfig.id,
];

export default function TableManager({
  visibleTables,
  onToggleTable,
  isEditing,
  hasBmzData,
  hasTransformerData,
  hasRusnData,
  hasRunnData,
  hasAdditionalEquipmentData,
  hasWorksData,
  hasBmzRows,
}: TableManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Закрытие dropdown при клике вне его
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Получаем доступные таблицы для добавления
  const getAvailableTables = () => {
    // Если нет данных в БМЗ, можно добавить только БМЗ
    if (!hasBmzRows) {
      return allTables.filter(tableId => tableId === bmzTableConfig.id && !visibleTables.has(tableId));
    }

    // Если есть данные в БМЗ, можно добавлять все остальные таблицы
    return allTables.filter(tableId => {
      // Не показываем таблицы, которые уже видимы
      if (visibleTables.has(tableId)) {
        return false;
      }
      // БМЗ нельзя добавить, если уже есть данные и она видима (но это уже проверено выше)
      // Все остальные таблицы можно добавлять
      return true;
    });
  };

  // Получаем таблицы, которые можно добавить (еще не видимые)
  const getAddableTables = () => {
    return getAvailableTables();
  };

  // Получаем видимые таблицы, которые можно удалить (скрыть)
  // Таблицы с данными нельзя удалить (скрыть)
  const getRemovableTables = () => {
    return Array.from(visibleTables).filter(tableId => {
      // Если есть данные в таблице, её нельзя скрыть
      if (tableId === bmzTableConfig.id && hasBmzData) return false;
      if (tableId === transformerTableConfig.id && hasTransformerData) return false;
      if (tableId === rusnTableConfig.id && hasRusnData) return false;
      if (tableId === runnTableConfig.id && hasRunnData) return false;
      if (tableId === additionalEquipmentTableConfig.id && hasAdditionalEquipmentData) return false;
      if (tableId === worksTableConfig.id && hasWorksData) return false;
      // ДГУ и другие таблицы без данных можно скрыть
      return true;
    });
  };

  const addableTables = getAddableTables();
  const removableTables = getRemovableTables();

  if (!isEditing) {
    return null;
  }

  return (
    <div className="mb-4 flex items-center gap-4">
      {/* Кнопка добавления таблицы */}
      {addableTables.length > 0 && (
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 px-4 py-2 bg-[#90bd20] hover:bg-[#7ba01c] text-white rounded-lg font-semibold transition-colors"
          >
            <Plus className="w-4 h-4" />
            Добавить таблицу
            <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>

          {isOpen && (
            <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[250px]">
              <div className="py-2">
                {addableTables.length === 0 ? (
                  <div className="px-4 py-2 text-sm text-gray-500">
                    Нет доступных таблиц для добавления
                  </div>
                ) : (
                  addableTables.map(tableId => (
                    <button
                      key={tableId}
                      onClick={() => {
                        onToggleTable(tableId);
                        setIsOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors"
                    >
                      {tableNames[tableId] || tableId}
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Список видимых таблиц */}
      {visibleTables.size > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-gray-600">Видимые таблицы:</span>
          {Array.from(visibleTables).map(tableId => {
            const canRemove = removableTables.includes(tableId);
            const hasData = 
              (tableId === bmzTableConfig.id && hasBmzData) ||
              (tableId === transformerTableConfig.id && hasTransformerData) ||
              (tableId === rusnTableConfig.id && hasRusnData) ||
              (tableId === runnTableConfig.id && hasRunnData) ||
              (tableId === additionalEquipmentTableConfig.id && hasAdditionalEquipmentData) ||
              (tableId === worksTableConfig.id && hasWorksData);

            return (
              <div
                key={tableId}
                className={`flex items-center gap-2 px-3 py-1 rounded-lg text-sm ${
                  hasData 
                    ? 'bg-green-100 text-green-800 border border-green-300' 
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                <span>{tableNames[tableId] || tableId}</span>
                {canRemove && (
                  <button
                    onClick={() => onToggleTable(tableId)}
                    className="text-red-600 hover:text-red-800 transition-colors"
                    title="Скрыть таблицу"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                {!canRemove && (
                  <span className="text-xs text-gray-500" title="Таблица с данными, нельзя скрыть">
                    (есть данные)
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

