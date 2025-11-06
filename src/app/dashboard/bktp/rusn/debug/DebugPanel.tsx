import React, { useState } from 'react';
import { RusnCell } from '@/store/useRusnStore';
import { RusnMaterials } from '@/utils/rusnMaterials';
import { useCellCalculation } from '@/hooks/useCellCalculation';

interface DebugPanelProps {
  cell: RusnCell;
  materials: RusnMaterials;
  groupSlug: string;
  selectedGroupName: string;
  selectedCalculationName: string;
  calculations?: {
    cell: Array<{
      id: number;
      name: string;
      slug: string;
      data: {
        categories: Array<{
          name: string;
          items: Array<{
            id: number | null;
            name: string;
            unit: string;
            price: number;
            quantity: number;
          }>;
        }>;
        calculation?: {
          manufacturingHours?: number;
          hourlyRate?: number;
          overheadPercentage?: number;
          adminPercentage?: number;
          plannedProfitPercentage?: number;
          ndsPercentage?: number;
        };
        cellConfig?: {
          type?: string;
          materials?: Record<string, unknown>;
        };
      };
    }>;
  };
}

export default function DebugPanel({
  cell,
  materials,
  groupSlug,
  selectedGroupName,
  selectedCalculationName,
  calculations,
}: DebugPanelProps) {
  // Проверяем, включены ли отладочные панели (можно управлять через localStorage)
  const [isDebugEnabled] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('debug-panels-enabled') === 'true';
    }
    return false;
  });
  
  const [isExpanded, setIsExpanded] = useState(false);

  // Если отладка отключена, не показываем панель
  if (!isDebugEnabled) {
    return null;
  }
  
  const { total, currentCalculation, calculations: cellCalculations, foundCalculations } = useCellCalculation({
    cell,
    materials,
    groupSlug,
    selectedGroupName,
    selectedCalculationName,
  });

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-bold text-yellow-800">🐛 Отладочная панель</h3>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 px-3 py-1 text-sm font-medium text-yellow-700 bg-yellow-100 hover:bg-yellow-200 rounded-lg transition-colors duration-200"
        >
          {isExpanded ? (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
              Скрыть
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              Показать
            </>
          )}
        </button>
      </div>
      
      {isExpanded && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-semibold text-yellow-700 mb-2">Данные ячейки:</h4>
              <div className="space-y-1">
                <div><strong>ID:</strong> {cell.id}</div>
                <div><strong>Назначение:</strong> {cell.purpose}</div>
                <div><strong>Тип камеры:</strong> {cell.cellType}</div>
                <div><strong>Количество:</strong> {cell.count || 1}</div>
                <div><strong>Выключатель:</strong> {cell.breaker ? `${cell.breaker.name} (${cell.breaker.id})` : 'Не выбран'}</div>
                <div><strong>РЗА:</strong> {cell.rza ? `${cell.rza.name} (${cell.rza.id})` : 'Не выбрана'}</div>
                <div><strong>ПУ:</strong> {cell.meterType ? `${cell.meterType.name} (${cell.meterType.id})` : 'Не выбран'}</div>
                <div><strong>ТТ:</strong> {cell.transformerCurrent ? `${cell.transformerCurrent.name} (${cell.transformerCurrent.id})` : 'Не выбран'}</div>
                <div><strong>Разбивка расчета:</strong> {cell.calculationBreakdown ? 'Есть' : 'Нет'}</div>
                {cell.calculationBreakdown && (
                  <div className="ml-4 text-xs">
                    <div>Основная: {cell.calculationBreakdown.main?.name} - {cell.calculationBreakdown.main?.price?.toLocaleString('ru-RU')} ₸</div>
                    <div>Дополнительная: {cell.calculationBreakdown.additional?.name} - {cell.calculationBreakdown.additional?.price?.toLocaleString('ru-RU')} ₸</div>
                    <div>Итого: {cell.calculationBreakdown.total?.toLocaleString('ru-RU')} ₸</div>
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-yellow-700 mb-2">Расчеты:</h4>
              <div className="space-y-1">
                <div><strong>Итоговая стоимость:</strong> {total.toLocaleString('ru-RU')} ₸</div>
                <div><strong>Загружается:</strong> Нет</div>
                <div><strong>Текущая калькуляция:</strong> {currentCalculation}</div>
                <div><strong>Всего калькуляций:</strong> {cellCalculations.cell?.length || 0}</div>
                <div><strong>Тип ячейки:</strong> {foundCalculations.cellType}</div>
                <div><strong>totalPrice ячейки:</strong> {cell.totalPrice?.toLocaleString('ru-RU') || 'Не установлен'} ₸</div>
                <div><strong>Разница:</strong> {Math.abs(total - (cell.totalPrice || 0)).toLocaleString('ru-RU')} ₸</div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-yellow-700 mb-2">Найденные калькуляции:</h4>
              <div className="space-y-1">
                <div><strong>Выключатель:</strong> {foundCalculations.breakerCalculation ? 'Найдена' : 'Не найдена'}</div>
                <div><strong>РЗА:</strong> {foundCalculations.rzaCalculation ? 'Найдена' : 'Не найдена'}</div>
                <div><strong>ПУ:</strong> {foundCalculations.puCalculation ? 'Найдена' : 'Не найдена'}</div>
                <div><strong>Разъединитель:</strong> {foundCalculations.disconnectorCalculation ? 'Найден' : 'Не найден'}</div>
                <div><strong>ТСН:</strong> {foundCalculations.tsnCalculation ? 'Найден' : 'Не найден'}</div>
                <div><strong>ТН:</strong> {foundCalculations.tnCalculation ? 'Найден' : 'Не найден'}</div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-yellow-700 mb-2">Материалы:</h4>
              <div className="space-y-1">
                <div><strong>Выключатели:</strong> {materials.breaker?.length || 0}</div>
                <div><strong>РЗА:</strong> {materials.rza?.length || 0}</div>
                <div><strong>ПУ:</strong> {materials.meter?.length || 0}</div>
                <div><strong>ТТ:</strong> {materials.tt?.length || 0}</div>
              </div>
            </div>
          </div>
          
          <div className="mt-4">
            <h4 className="font-semibold text-yellow-700 mb-2">Детали калькуляций:</h4>
            <div className="bg-white p-3 rounded border text-xs overflow-auto max-h-40">
              <pre>{JSON.stringify(cellCalculations.cell?.map(c => ({
                id: c.id,
                name: c.name,
                hasCellConfig: !!c.data?.cellConfig,
                materials: c.data?.cellConfig?.materials ? Object.keys(c.data.cellConfig.materials) : []
              })), null, 2)}</pre>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
