'use client';

import { useRouter } from 'next/navigation';
import { FileDiff, Package } from 'lucide-react';
import { MaterialHistoryWithMaterial } from '@/api/material/exports';

interface HistoryTableProps {
  history: MaterialHistoryWithMaterial[];
  loading: boolean;
  error: string | null;
}

export default function HistoryTable({ history, loading, error }: HistoryTableProps) {
  const router = useRouter();

  // Форматирование даты
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ru-RU', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Форматирование значения поля
  const formatFieldValue = (value: string) => {
    if (!value || value === 'null') return '-';
    if (value.length > 50) return value.substring(0, 50) + '...';
    return value;
  };

  // Получение названия поля на русском
  const getFieldLabel = (field: string) => {
    const fieldLabels: Record<string, string> = {
      price: 'Цена',
      name: 'Название',
      code: 'Код',
      unit: 'Единица измерения',
      categoryId: 'Категория',
      description: 'Описание',
      manufacturer: 'Производитель',
      supplier: 'Поставщик',
    };
    return fieldLabels[field] || field;
  };

  // Обработка клика по материалу
  const handleMaterialClick = (item: MaterialHistoryWithMaterial) => {
    // Используем materialId или id из material объекта
    const materialId = item.materialId || item.material?.id;
    
    if (!materialId) {
      console.error('Material ID не найден для элемента истории:', item);
      return;
    }
    
    router.push(`/dashboard/materials/${materialId}/history`);
  };

  // Показываем overlay с лоадером поверх таблицы, если есть данные
  // Это предотвращает изменение высоты контента
  if (loading && history.length === 0) {
    return (
      <div className="relative min-h-[400px]">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8eba1e] mx-auto mb-4"></div>
            <p className="text-gray-600">Загрузка истории изменений...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <p className="text-red-600 text-lg mb-2">Ошибка загрузки</p>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 shadow-sm">
        <div className="px-6 py-12 text-center text-gray-500">
          <div className="flex flex-col items-center">
            <FileDiff className="w-12 h-12 text-gray-400 mb-4" />
            <p className="text-lg font-medium">Изменения не найдены</p>
            <p className="text-sm">Попробуйте изменить фильтры поиска</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative rounded-xl border border-gray-200 shadow-sm">
      {loading && history.length > 0 && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center rounded-xl">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8eba1e] mx-auto mb-4"></div>
            <p className="text-gray-600">Обновление данных...</p>
          </div>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto text-sm">
          <thead className="bg-gray-50 text-gray-600 text-left border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 font-semibold">Дата изменения</th>
              <th className="px-6 py-4 font-semibold">Материал</th>
              <th className="px-6 py-4 font-semibold">Поле</th>
              <th className="px-6 py-4 font-semibold">Старое значение</th>
              <th className="px-6 py-4 font-semibold">Новое значение</th>
              <th className="px-6 py-4 font-semibold">Изменил</th>
            </tr>
          </thead>
          <tbody>
            {history.map((item, idx) => (
              <tr
                key={`${item.id}-${idx}`}
                className="border-b border-gray-100 hover:bg-gray-50 transition-all duration-200 hover:shadow-sm"
              >
                <td className="px-6 py-4 text-gray-700">{formatDate(item.changedAt)}</td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => handleMaterialClick(item)}
                    disabled={!item.materialId && !item.material?.id}
                    className="flex items-center gap-2 text-[#8eba1e] hover:text-[#7aa31a] font-medium hover:underline disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:no-underline"
                  >
                    <Package className="w-4 h-4" />
                    {item.material?.name || `Материал #${item.materialId || item.material?.id || 'N/A'}`}
                  </button>
                </td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-700 font-medium">
                    {getFieldLabel(item.fieldChanged)}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-700 font-mono text-xs">
                  {formatFieldValue(item.oldValue)}
                </td>
                <td className="px-6 py-4 text-gray-900 font-mono text-xs font-medium">
                  {formatFieldValue(item.newValue)}
                </td>
                <td className="px-6 py-4 text-gray-700">{item.changedBy}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

