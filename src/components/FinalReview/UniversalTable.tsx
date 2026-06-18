'use client';

import React from 'react';
import { formatAmount } from '@/utils/formatAmount';

// Типы для конфигурации таблицы
export interface TableColumn {
  key: string;
  title: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
  formatter?: (value: any, row: TableRow) => string;
}

export interface TableRow {
  id: string | number;
  [key: string]: any;
}

export interface TableConfig {
  id: string;
  title: string;
  columns: TableColumn[];
  dataMapper: (data: any, additionalData?: any) => TableRow[];
  emptyMessage: string;
  showTotal?: boolean;
  totalFormatter?: (rows: TableRow[]) => number;
}

interface UniversalTableProps {
  config: TableConfig;
  data: any;
  additionalData?: any;
  className?: string;
  managerMarkupPercent?: number;
  tableId?: string;
  tableMarkupPercent?: number;
  setTableMarkupPercent?: (value: number) => void;
  tableMarkupTotal?: number | null;
  setTableMarkupTotal?: (value: number | null) => void;
  isReadOnly?: boolean;
  isEditing?: boolean;
  customRows?: TableRow[];
  onCustomRowsChange?: (rows: TableRow[]) => void;
}

const formattedPrice = (num?: number) =>
  typeof num === 'number' ? formatAmount(num) + ' ₸' : '—';

const defaultPriceFormatter = (value: any) => formattedPrice(value);

const defaultTotalFormatter = (rows: TableRow[]) => {
  return rows.reduce((sum, row) => {
    if ((row as TableRow).isSectionHeader) return sum;
    // Используем total если есть, иначе вычисляем из price * quantity
    if (typeof row.total === 'number') {
      return sum + row.total;
    }
    const price = typeof row.price === 'number' ? row.price : 0;
    const quantity = typeof row.quantity === 'number' ? row.quantity : 1;
    return sum + (price * quantity);
  }, 0);
};

const getColumnAlignClass = (column: TableColumn) => {
  if (column.align === 'left') return 'text-left';
  if (column.align === 'right') return 'text-right';
  return 'text-center';
};

export default function UniversalTable({ 
  config, 
  data, 
  additionalData, 
  className = '',
  managerMarkupPercent = 0,
  tableId,
  tableMarkupPercent: propTableMarkupPercent,
  setTableMarkupPercent,
  tableMarkupTotal,
  setTableMarkupTotal,
  isReadOnly = false,
  isEditing = false,
  customRows = [],
  onCustomRowsChange,
}: UniversalTableProps) {
  // Получаем данные через маппер
  const baseRows = config.dataMapper(data, additionalData);
  
  // Объединяем исходные строки с пользовательскими
  const rows = React.useMemo(() => {
    return [...baseRows, ...customRows];
  }, [baseRows, customRows]);
  
  // Вычисляем итог если нужно (даже для пустых таблиц)
  const total = config.showTotal && rows.length > 0
    ? (config.totalFormatter || defaultTotalFormatter)(rows)
    : 0;

  // Используем процент наценки для этой таблицы (если задан), иначе общий процент
  const currentMarkupPercent = propTableMarkupPercent ?? managerMarkupPercent;
  
  // Вычисляем итоговую сумму с наценкой (для пустых таблиц используем 0)
  const calculatedMarkupTotal = rows.length > 0 
    ? total + (total * currentMarkupPercent / 100)
    : 0;
  const finalMarkupTotal = tableMarkupTotal !== null && tableMarkupTotal !== undefined ? tableMarkupTotal : calculatedMarkupTotal;
  
  // Вычисляем процент наценки на основе итоговой суммы (если была изменена вручную)
  // Для пустых таблиц используем текущий процент наценки
  const actualMarkupPercent = total > 0 
    ? ((finalMarkupTotal - total) / total) * 100 
    : (tableMarkupTotal !== null && tableMarkupTotal !== undefined && tableMarkupTotal > 0 
        ? currentMarkupPercent 
        : currentMarkupPercent);

  // Состояние для отформатированного значения в поле ввода суммы
  const [formattedValue, setFormattedValue] = React.useState<string>('');
  // Состояние для редактирования процента (чистое значение без форматирования)
  const [editingPercent, setEditingPercent] = React.useState<boolean>(false);
  const [percentInputValue, setPercentInputValue] = React.useState<string>('');
  // Ref для поля ввода процента для управления курсором
  const percentInputRef = React.useRef<HTMLInputElement>(null);

  // Функция для форматирования числа с пробелами
  const formatNumberWithSpaces = (num: number): string => {
    return Math.round(num).toLocaleString('ru-RU', { useGrouping: true, maximumFractionDigits: 0 }).replace(/,/g, ' ');
  };

  // Инициализация отформатированного значения
  React.useEffect(() => {
    if (finalMarkupTotal) {
      setFormattedValue(formatNumberWithSpaces(finalMarkupTotal));
    } else {
      setFormattedValue('');
    }
  }, [finalMarkupTotal]);

  // Инициализация значения процента
  React.useEffect(() => {
    if (!editingPercent) {
      setPercentInputValue(actualMarkupPercent.toFixed(1));
    }
  }, [actualMarkupPercent, editingPercent]);

  // Состояние для редактируемых строк
  const [editingRowId, setEditingRowId] = React.useState<string | number | null>(null);
  const [editingRowData, setEditingRowData] = React.useState<Partial<TableRow>>({});
  
  // Функция для добавления новой строки
  const handleAddRow = () => {
    if (!onCustomRowsChange || !tableId) return;
    
    const newRow: TableRow = {
      id: `custom-${tableId}-${Date.now()}`,
      name: '',
      unit: 'шт.',
      quantity: 1,
      price: 0,
      total: 0,
      indent: 0, // Уровень отступа (0 = нет отступа, 1 = один уровень, и т.д.)
      isCustom: true, // Флаг для идентификации пользовательских строк
    };
    
    onCustomRowsChange([...customRows, newRow]);
    setEditingRowId(newRow.id);
    setEditingRowData(newRow);
  };
  
  // Функция для сохранения редактируемой строки
  const handleSaveRow = (rowId: string | number) => {
    if (!onCustomRowsChange) return;
    
    const updatedRows = customRows.map(row => {
      if (row.id === rowId) {
        const quantity = typeof editingRowData.quantity === 'number' ? editingRowData.quantity : 1;
        const price = typeof editingRowData.price === 'number' ? editingRowData.price : 0;
        // Сохраняем indent только если он был явно установлен, иначе используем существующее значение или 0
        const indent = typeof editingRowData.indent === 'number' 
          ? Math.max(0, Math.min(5, editingRowData.indent))
          : (typeof row.indent === 'number' ? row.indent : 0);
        
        // Удаляем служебные поля перед сохранением, оставляя только данные колонок
        const { isCustom, ...rowData } = editingRowData;
        
        return {
          ...row,
          ...rowData,
          total: quantity * price,
          indent: indent,
          isCustom: true, // Всегда сохраняем флаг isCustom для пользовательских строк
        };
      }
      return row;
    });
    
    onCustomRowsChange(updatedRows);
    setEditingRowId(null);
    setEditingRowData({});
  };
  
  // Функция для удаления строки
  const handleDeleteRow = (rowId: string | number) => {
    if (!onCustomRowsChange) return;
    onCustomRowsChange(customRows.filter(row => row.id !== rowId));
  };
  
  // Функция для начала редактирования строки
  const handleEditRow = (row: TableRow) => {
    if (!isEditing || !(row as any).isCustom) return;
    setEditingRowId(row.id);
    setEditingRowData({ ...row });
  };
  
  // Функция для отмены редактирования
  const handleCancelEdit = () => {
    setEditingRowId(null);
    setEditingRowData({});
  };

  return (
    <section className={`mt-10 ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-semibold text-gray-800">{config.title}</h2>
        {isEditing && !isReadOnly && onCustomRowsChange && (
          <button
            onClick={handleAddRow}
            className="flex items-center gap-1 px-3 py-1.5 bg-[#90bd20] hover:bg-[#7ba01c] text-white rounded-lg text-sm font-semibold transition-colors"
            title="Добавить строку"
          >
            <span className="text-lg leading-none">+</span>
            <span>Добавить строку</span>
          </button>
        )}
      </div>
      <table className="w-full table-fixed text-sm">
        <colgroup>
          <col style={{ width: '5%' }} />
          {config.columns.map((column) => (
            <col key={column.key} style={{ width: column.width || 'auto' }} />
          ))}
          {isEditing && !isReadOnly && onCustomRowsChange && <col style={{ width: '5%' }} />}
        </colgroup>
        <thead className="bg-[#90bd20] text-white">
          <tr>
            <th className="p-2">№</th>
            {config.columns.map((column) => (
              <th 
                key={column.key}
                className={`p-2 ${getColumnAlignClass(column)}`}
              >
                {column.title}
              </th>
            ))}
            {isEditing && !isReadOnly && onCustomRowsChange && (
              <th className="p-2 w-16"></th>
            )}
          </tr>
        </thead>
        <tbody className="text-center">
          {rows.length === 0 ? (
            <tr>
              <td colSpan={config.columns.length + 1 + (isEditing && !isReadOnly && onCustomRowsChange ? 1 : 0)} className="p-4 text-gray-500 text-center">
                {config.emptyMessage || 'Нет данных'}
              </td>
            </tr>
          ) : (
            (() => {
              let dataRowNumber = 0;
              return rows.map((row) => {
              const isSectionHeader = (row as TableRow).isSectionHeader === true;
              if (!isSectionHeader) {
                dataRowNumber += 1;
              }
              const isCustomRow = (row as any).isCustom === true;
              const isEditingThisRow = editingRowId === row.id;
              
              // Если строка редактируется, показываем поля ввода
              if (isEditingThisRow && isCustomRow) {
                return (
                  <tr key={row.id} className="bg-yellow-50">
                    <td className="p-2">{isSectionHeader ? '' : dataRowNumber}</td>
                    {config.columns.map((column) => {
                      // Для колонки "Сумма" показываем только вычисленное значение
                      if (column.key === 'total') {
                        return (
                          <td key={column.key} className="p-2 text-right">
                            {formattedPrice(editingRowData.total || 0)}
                          </td>
                        );
                      }
                      
                      // Для текстовых полей (name, unit)
                      if (column.key === 'name' || column.key === 'unit') {
                        return (
                          <td 
                            key={column.key} 
                            className={`p-2 ${getColumnAlignClass(column)}`}
                          >
                            {column.key === 'name' && isEditing && !isReadOnly ? (
                              <input
                                type="text"
                                value={editingRowData[column.key] || ''}
                                onChange={(e) => {
                                  setEditingRowData({ ...editingRowData, [column.key]: e.target.value });
                                }}
                                placeholder={column.title}
                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                autoFocus
                              />
                            ) : (
                              <input
                                type="text"
                                value={editingRowData[column.key] || ''}
                                onChange={(e) => {
                                  setEditingRowData({ ...editingRowData, [column.key]: e.target.value });
                                }}
                                placeholder={column.title}
                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                autoFocus={column.key === 'name'}
                              />
                            )}
                          </td>
                        );
                      }
                      
                      // Для числовых полей (quantity, price)
                      if (column.key === 'quantity' || column.key === 'price') {
                        return (
                          <td 
                            key={column.key} 
                            className={`p-2 ${getColumnAlignClass(column)}`}
                          >
                            <input
                              type="number"
                              value={editingRowData[column.key] || (column.key === 'quantity' ? 1 : 0)}
                              onChange={(e) => {
                                const value = parseFloat(e.target.value) || (column.key === 'quantity' ? 1 : 0);
                                const quantity = column.key === 'quantity' 
                                  ? value 
                                  : (typeof editingRowData.quantity === 'number' ? editingRowData.quantity : 1);
                                const price = column.key === 'price'
                                  ? value
                                  : (typeof editingRowData.price === 'number' ? editingRowData.price : 0);
                                
                                setEditingRowData({ 
                                  ...editingRowData, 
                                  [column.key]: value,
                                  total: quantity * price,
                                });
                              }}
                              placeholder={column.title}
                              className={`w-full px-2 py-1 border border-gray-300 rounded text-sm ${
                                column.align === 'right' ? 'text-right' : ''
                              }`}
                              min="0"
                              step="1"
                            />
                          </td>
                        );
                      }
                      
                      // Для остальных колонок показываем только если значение существует
                      const cellValue = editingRowData[column.key];
                      return (
                        <td 
                          key={column.key} 
                          className={`p-2 ${getColumnAlignClass(column)}`}
                        >
                          {cellValue !== undefined && cellValue !== null ? String(cellValue) : ''}
                        </td>
                      );
                    })}
                    <td className="p-2">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleSaveRow(row.id)}
                          className="p-1 text-green-600 hover:text-green-800"
                          title="Сохранить"
                        >
                          ✓
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="p-1 text-red-600 hover:text-red-800"
                          title="Отменить"
                        >
                          ✕
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              }
              
              // Обычное отображение строки
              const indentLevel = (row as any).indent || 0;
              const indentPadding = indentLevel * 24; // 24px на уровень отступа
              
              // Создаем копию строки без служебных полей для отображения
              const displayRow = { ...row };
              delete (displayRow as any).indent;
              delete (displayRow as any).isCustom;
              delete (displayRow as any).isSectionHeader;
              
              return (
                <tr 
                  key={row.id}
                  className={isCustomRow ? 'bg-blue-50 hover:bg-blue-100' : isSectionHeader ? 'bg-gray-50/50' : ''}
                  onClick={() => isEditing && isCustomRow && handleEditRow(row)}
                  style={isEditing && isCustomRow ? { cursor: 'pointer' } : {}}
                >
                  <td className="p-2">{isSectionHeader ? '' : dataRowNumber}</td>
                  {config.columns.map((column) => {
                    // Берем значение только из ключей колонок, игнорируя служебные поля
                    const value = displayRow[column.key];
                    const formattedValue = column.formatter 
                      ? column.formatter(value, row)
                      : (value !== undefined && value !== null && value !== '' ? value : '');
                    
                    return (
                      <td 
                        key={column.key}
                        className={`p-2 ${getColumnAlignClass(column)} ${
                          column.key === 'name' ? 'break-words' : ''
                        }`}
                        style={column.key === 'name' && indentLevel > 0 ? { paddingLeft: `${8 + indentPadding}px` } : {}}
                      >
                        {column.key === 'name' && indentLevel > 0 && (
                          <span className="text-gray-400 mr-1">
                            {'└'.repeat(Math.min(indentLevel, 3))}
                          </span>
                        )}
                        {formattedValue}
                      </td>
                    );
                  })}
                  {isEditing && !isReadOnly && onCustomRowsChange && (
                    <td className="p-2">
                      {isCustomRow && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteRow(row.id);
                          }}
                          className="p-1 text-red-600 hover:text-red-800"
                          title="Удалить"
                        >
                          ✕
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              );
            });
            })()
          )}
          {/* Показываем строки "ВСЕГО" и "ВСЕГО + %:" если showTotal=true, даже для пустых таблиц */}
          {config.showTotal && (
            <>
              <tr className="bg-[#f3f4f6] font-semibold">
                <td className="p-2"></td>
                <td colSpan={config.columns.length - 1} className="text-right pr-2">
                  ВСЕГО:
                </td>
                <td className="text-right pl-2">{formattedPrice(total)}</td>
                {isEditing && !isReadOnly && onCustomRowsChange && (
                  <td className="p-2"></td>
                )}
              </tr>
              <tr className="bg-[#f3f4f6] font-semibold">
                <td className="p-2"></td>
                <td colSpan={config.columns.length - 1} className="text-right pr-2">
                  <div className="flex items-center justify-end gap-2">
                    <span>ВСЕГО +</span>
                    {setTableMarkupPercent && !isReadOnly ? (
                      <input
                        ref={percentInputRef}
                        type="text"
                        value={editingPercent ? percentInputValue : actualMarkupPercent.toFixed(1)}
                        onChange={(e) => {
                          const input = e.target;
                          const inputValue = input.value;
                          const cursorPosition = input.selectionStart || 0;
                          
                          // Разрешаем цифры, точку/запятую и знак минус для десятичных (включая отрицательные)
                          if (/^[\d.,-]*$/.test(inputValue) || inputValue === '') {
                            // Заменяем запятую на точку для парсинга
                            const normalizedValue = inputValue.replace(',', '.');
                            setPercentInputValue(normalizedValue);
                            
                            // Восстанавливаем позицию курсора после обновления
                            setTimeout(() => {
                              if (percentInputRef.current) {
                                const newPosition = Math.min(cursorPosition, normalizedValue.length);
                                percentInputRef.current.setSelectionRange(newPosition, newPosition);
                              }
                            }, 0);
                          }
                        }}
                        onFocus={(e) => {
                          setEditingPercent(true);
                          const cleanValue = actualMarkupPercent.toString();
                          setPercentInputValue(cleanValue);
                          // Выделяем все содержимое при фокусе для удобства замены
                          setTimeout(() => {
                            e.target.select();
                          }, 0);
                        }}
                        onBlur={(e) => {
                          setEditingPercent(false);
                          const normalizedValue = e.target.value.replace(',', '.');
                          const value = parseFloat(normalizedValue);
                          // Разрешаем отрицательные значения (для случаев, когда итоговая сумма меньше базовой)
                          if (!isNaN(value)) {
                            setTableMarkupPercent(value);
                            // Пересчитываем итоговую сумму с наценкой
                            if (total > 0 && setTableMarkupTotal) {
                              const newTotal = total + (total * value / 100);
                              setTableMarkupTotal(Math.round(newTotal));
                            }
                            setPercentInputValue(value.toFixed(1));
                          } else {
                            // Восстанавливаем текущий процент
                            setPercentInputValue(actualMarkupPercent.toFixed(1));
                          }
                        }}
                        onKeyDown={(e) => {
                          // Разрешаем Enter для применения изменений
                          if (e.key === 'Enter') {
                            e.currentTarget.blur();
                          }
                        }}
                        className="px-2 py-1 text-right border border-gray-300 rounded focus:border-[#8eba1e] focus:ring-1 focus:ring-[#8eba1e] bg-white font-semibold"
                        style={{ textAlign: 'right', width: '75px' }}
                      />
                    ) : (
                      <span className={isReadOnly ? 'text-gray-600' : ''} style={{ display: 'inline-block', width: '75px', textAlign: 'right' }}>{actualMarkupPercent.toFixed(1)}</span>
                    )}
                    <span>%:</span>
                  </div>
                </td>
                <td className="text-right pl-2">
                  {setTableMarkupTotal && !isReadOnly ? (
                    <div className="flex items-center justify-end gap-1">
                      <input
                        type="text"
                        value={formattedValue}
                        onChange={(e) => {
                          const inputValue = e.target.value;
                          // Убираем все пробелы для парсинга
                          const cleaned = inputValue.replace(/\s/g, '');
                          // Разрешаем только цифры
                          if (/^\d*$/.test(cleaned) || cleaned === '') {
                            if (cleaned === '') {
                              setFormattedValue('');
                            } else {
                              const numValue = parseInt(cleaned, 10);
                              if (!isNaN(numValue)) {
                                // Форматируем с пробелами при вводе
                                setFormattedValue(formatNumberWithSpaces(numValue));
                              }
                            }
                          }
                        }}
                        onBlur={(e) => {
                          const cleanedValue = e.target.value.replace(/\s/g, '');
                          if (cleanedValue === '') {
                            setTableMarkupTotal(null);
                            setFormattedValue('');
                          } else {
                            const numValue = parseInt(cleanedValue, 10);
                            if (!isNaN(numValue) && numValue >= 0) {
                              setTableMarkupTotal(numValue);
                              setFormattedValue(formatNumberWithSpaces(numValue));
                              // Пересчитываем процент наценки для этой таблицы
                              if (total > 0 && setTableMarkupPercent) {
                                const newPercent = ((numValue - total) / total) * 100;
                                setTableMarkupPercent(newPercent);
                              }
                            } else {
                              // Восстанавливаем предыдущее значение
                              if (finalMarkupTotal) {
                                setFormattedValue(formatNumberWithSpaces(finalMarkupTotal));
                              }
                            }
                          }
                        }}
                        onKeyDown={(e) => {
                          // Разрешаем Enter для применения изменений
                          if (e.key === 'Enter') {
                            e.currentTarget.blur();
                          }
                        }}
                        className="px-2 py-1 text-right border border-gray-300 rounded focus:border-[#8eba1e] focus:ring-1 focus:ring-[#8eba1e] bg-white font-semibold text-sm"
                        style={{ textAlign: 'right', width: '130px' }}
                        placeholder="0"
                      />
                      <span className="text-sm font-semibold whitespace-nowrap">₸</span>
                    </div>
                  ) : (
                    <span className={isReadOnly ? 'text-gray-600' : ''}>{formattedPrice(finalMarkupTotal)}</span>
                  )}
                </td>
                {isEditing && !isReadOnly && onCustomRowsChange && (
                  <td className="p-2"></td>
                )}
              </tr>
            </>
          )}
        </tbody>
      </table>
    </section>
  );
}