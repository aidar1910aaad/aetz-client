import { RusnCell } from '@/store/useRusnStore';
import { useTransformerStore } from '@/store/useTransformerStore';
import { RusnMaterials, formatCellDescription } from '@/utils/rusnMaterials';
import CellPriceSummary from '@/components/bktp/shared/CellPriceSummary';
import { formatKzt } from '@/utils/formatCurrency';

interface CellSummaryTableProps {
  cell: RusnCell;
  materials: RusnMaterials;
  selectedGroupName: string;
  currentCalculation: string;
  total: number;
  isCalculating?: boolean;
  cellType?: string;
  dj8hLBreakdown?: {
    baseL: number;
    rzaL: number;
    totalL: number;
    baseLName?: string;
    rzaLName?: string;
  } | null;
  onClearCell?: () => void;
}

export default function CellSummaryTable({
  cell,
  materials,
  selectedGroupName,
  currentCalculation,
  total,
  isCalculating = false,
  cellType,
  dj8hLBreakdown,
  onClearCell,
}: CellSummaryTableProps) {
  // Не показываем ячейки без выбранных материалов
  const hasSelectedMaterials = cell.breaker || cell.sr || cell.rza || cell.meterType || 
                              cell.transformerCurrent || cell.transformerVoltage || 
                              cell.transformerPower || cell.transformer;
  
  // Для секционных разъединителей КСО 366 показываем таблицу только если cellType определен
  if (cell.purpose === 'Секционный разьединитель' && selectedGroupName === 'Камера КСО 366') {
    if (!cell.cellType || cell.cellType === '') {
      return null;
    }
  }
  
  // ВРЕМЕННО: показываем все ячейки для отладки
  // if (!hasSelectedMaterials) {
  //   return null;
  // }

  const description = formatCellDescription(cell, materials, selectedGroupName);


  // Для КСО 366 ШМР показываем отдельные строки
  if (cell.cellType === 'Камера КСО 366 ШМР 14, 15' && cell.calculationBreakdown && Array.isArray(description)) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden animate-fade-in">
        {/* Заголовок с кнопкой Нет */}
        <div className="px-6 py-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
          <span className="text-sm font-medium text-gray-900">Ячейка: Секционный разьединитель</span>
          <button
            onClick={onClearCell}
            className="px-3 py-1 text-sm font-medium text-red-600 border border-red-300 rounded hover:bg-red-50 hover:border-red-400 transition-all duration-200"
          >
            Нет
          </button>
        </div>
        <table className="min-w-full divide-y divide-gray-200">
          <tbody className="bg-white divide-y divide-gray-200">
            {/* Основная строка */}
            <tr>
              <td className="px-6 py-4 text-sm text-gray-900">{description[0]}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                2 шт.
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                <div className="flex flex-col items-end">
                  <span>{formatKzt(cell.calculationBreakdown.main.price)} ₸</span>
                  <span className="text-xs text-gray-500">
                    Итого: {formatKzt(cell.calculationBreakdown.main.price * 2)} ₸
                  </span>
                </div>
              </td>
            </tr>
            {/* Дополнительная строка */}
            <tr>
              <td className="px-6 py-4 text-sm text-gray-900">{description[1]}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                {cell.count || 1} шт.
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                <div className="flex flex-col items-end">
                  <span>{formatKzt(cell.calculationBreakdown.additional.price)} ₸</span>
                  <span className="text-xs text-gray-500">
                    Итого: {formatKzt(cell.calculationBreakdown.additional.price * (cell.count || 1))} ₸
                  </span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  // Специальная логика для Кабельная перемычка
  if (cell.purpose === 'Кабельная перемычка') {
    // Получаем трансформатор из store
    const selectedTransformer = useTransformerStore.getState().selectedTransformer;
    
    let jumperTypeName = 'Кабельная перемычка';
    if (selectedTransformer?.voltage === '10') {
      jumperTypeName = 'Кабельная перемычка 10кВ';
    } else if (selectedTransformer?.voltage === '20') {
      jumperTypeName = 'Кабельная перемычка 20кВ';
    }
    
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden animate-fade-in">
        <table className="min-w-full divide-y divide-gray-200">
          <tbody className="bg-white divide-y divide-gray-200">
            <tr>
              <td className="px-6 py-4 text-sm text-gray-900">
                {jumperTypeName}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                {cell.count || 1} шт.
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                <div className="flex flex-col items-end">
                  <span>{((total || 0) / (cell.count || 1)).toLocaleString('ru-RU')} ₸</span>
                  {isCalculating ? (
                    <div className="flex flex-col items-end mt-1">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-1">
                          <div className="bg-[#8eba1e] h-1 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                        </div>
                        <span className="text-xs text-[#8eba1e]">Загрузка...</span>
                      </div>
                      <span className="text-xs text-gray-500 mt-1">Итого: Загрузка...</span>
                    </div>
                  ) : (
                    <span className="text-xs text-gray-500">
                      Итого: {(total || 0).toLocaleString('ru-RU')} ₸
                    </span>
                  )}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  // Специальная логика для Изоляционный адаптер
  if (cell.purpose === 'Изоляционный адаптер') {
    // Получаем трансформатор для определения напряжения
    const selectedTransformer = useTransformerStore.getState().selectedTransformer;
    const adapterType = selectedTransformer?.voltage === '20' ? 'Изоляционный адаптер 20кВ' : 'Изоляционный адаптер 10кВ';
    
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden animate-fade-in">
        <table className="min-w-full divide-y divide-gray-200">
          <tbody className="bg-white divide-y divide-gray-200">
            <tr>
              <td className="px-6 py-4 text-sm text-gray-900">
                {adapterType}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                {cell.count || 1} шт.
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                <div className="flex flex-col items-end">
                  <span>{((total || 0) / (cell.count || 1)).toLocaleString('ru-RU')} ₸</span>
                  {isCalculating ? (
                    <div className="flex flex-col items-end mt-1">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-1">
                          <div className="bg-[#8eba1e] h-1 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                        </div>
                        <span className="text-xs text-[#8eba1e]">Загрузка...</span>
                      </div>
                      <span className="text-xs text-gray-500 mt-1">Итого: Загрузка...</span>
                    </div>
                  ) : (
                    <span className="text-xs text-gray-500">
                      Итого: {(total || 0).toLocaleString('ru-RU')} ₸
                    </span>
                  )}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  // Специальная логика для Камера Siemens 8DJH
  if (cell.purpose === 'Камера Siemens 8DJH') {
    // Получаем количества для L и R
    const siemens8DJH_L = (cell as any).siemens8DJH_L || 0;
    const siemens8DJH_R = (cell as any).siemens8DJH_R || 0;
    
    // Генерируем строки L и R на основе количества
    // Общее количество символов = L + R
    const totalSymbols = Math.max(1, siemens8DJH_L + siemens8DJH_R);
    
    // Если сумма не делится на 2, не показываем название
    if (totalSymbols % 2 !== 0) {
      return null;
    }
    
    const leftHalf = Math.floor(totalSymbols / 2);
    const rightHalf = Math.ceil(totalSymbols / 2);
    
    // Специальная логика для R=2
    if (siemens8DJH_R === 2) {
      const leftL = leftHalf - 1; // Оставляем место для 1R в левой части
      const leftR = 1; // 1R в левой части
      const rightR = 1; // 1R в правой части
      const rightL = rightHalf - 1; // Остальные L в правой части
      
      const lString = 'L'.repeat(leftL) + 'R'.repeat(leftR);
      const rString = 'R'.repeat(rightR) + 'L'.repeat(rightL);
      
      const fullName = `Камера Siemens 8DJH ${lString}-${rString} (Микропроцессорная защита РЗА Системз РС83-А2.0)`;
      
      return (
        <div className="bg-white rounded-lg shadow overflow-hidden animate-fade-in">
          <table className="min-w-full divide-y divide-gray-200">
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {fullName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                  {cell.count || 1} шт.
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                  <div className="flex flex-col items-end">
                    <span>{((total || 0) / (cell.count || 1)).toLocaleString('ru-RU')} ₸</span>
                    {isCalculating ? (
                      <div className="flex flex-col items-end mt-1">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-gray-200 rounded-full h-1">
                            <div className="bg-[#8eba1e] h-1 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                          </div>
                          <span className="text-xs text-[#8eba1e]">Загрузка...</span>
                        </div>
                        <span className="text-xs text-gray-500 mt-1">Итого: Загрузка...</span>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-500">
                        Итого: {(total || 0).toLocaleString('ru-RU')} ₸
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      );
    }
    
    // Обычная логика для остальных случаев
    // Распределяем R символы равномерно между левой и правой частями
    const leftR = Math.floor(siemens8DJH_R / 2);
    const rightR = siemens8DJH_R - leftR;
    
    // Остальные места заполняем L
    const leftL = leftHalf - leftR;
    const rightL = rightHalf - rightR;
    
    const lString = 'L'.repeat(leftL) + 'R'.repeat(leftR);
    const rString = 'R'.repeat(rightR) + 'L'.repeat(rightL);
    
    // Формируем полное название
    const fullName = `Камера Siemens 8DJH ${lString}-${rString} (Микропроцессорная защита РЗА Системз РС83-А2.0)`;
    
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden animate-fade-in">
        <table className="min-w-full divide-y divide-gray-200">
          <tbody className="bg-white divide-y divide-gray-200">
            <tr>
              <td className="px-6 py-4 text-sm text-gray-900">
                {fullName}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                {cell.count || 1} шт.
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                <div className="flex flex-col items-end">
                  <span>{((total || 0) / (cell.count || 1)).toLocaleString('ru-RU')} ₸</span>
                  {isCalculating ? (
                    <div className="flex flex-col items-end mt-1">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-1">
                          <div className="bg-[#8eba1e] h-1 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                        </div>
                        <span className="text-xs text-[#8eba1e]">Загрузка...</span>
                      </div>
                      <span className="text-xs text-gray-500 mt-1">Итого: Загрузка...</span>
                    </div>
                  ) : (
                    <span className="text-xs text-gray-500">
                      Итого: {(total || 0).toLocaleString('ru-RU')} ₸
                    </span>
                  )}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  // Специальная логика для Заземление сборных шин (КСО А17-20)
  if (cell.purpose === 'Заземление сборных шин') {
    return (
      <div className="space-y-2 animate-fade-in">
        <CellPriceSummary
          name="Заземление сборных шин"
          quantity={cell.count || 1}
          pricePerUnit={(total || 0) / (cell.count || 1)}
          total={total || 0}
          isCalculating={isCalculating}
        />
      </div>
    );
  }

  const pricePerUnit = (total || 0) / (cell.count || 1);
  const summaryName = Array.isArray(description) ? description.join(' · ') : String(description);

  return (
    <div className="space-y-2 animate-fade-in">
      {cell.purpose === 'Секционный разьединитель' &&
        selectedGroupName === 'Камера КСО 366' &&
        cell.cellType &&
        cell.cellType !== '' &&
        cell.cellType !== 'Камера КСО 366 ШМР 14, 15' && (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClearCell}
              className="text-xs font-medium text-red-600 px-3 py-1.5 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 transition-colors"
            >
              Сбросить тип
            </button>
          </div>
        )}
      <CellPriceSummary
        name={summaryName}
        quantity={cell.count || 1}
        pricePerUnit={pricePerUnit}
        total={total || 0}
        isCalculating={isCalculating}
      />
    </div>
  );
}
