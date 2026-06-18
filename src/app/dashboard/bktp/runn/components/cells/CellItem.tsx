import { RunnCell } from '@/store/useRunnStore';
import { Material } from '@/api/material';
import MaterialSummaryTable from '../common/MaterialSummaryTable';
import SwitchingDeviceSelector from '../selectors/SwitchingDeviceSelector';
import CellParameters from './CellParameters';
import SwitchingDeviceLogic from '../switching-devices/SwitchingDeviceLogic';
import { useRunnOutgoingCalculation, useRunnMoldedCaseCalculation, useRunnAirCalculation, useRunnMeterCalculation } from '@/hooks/useRunnInputCalculation';
import { useOutgoingCalculations } from '@/hooks/useOutgoingCalculations';
import OutgoingCalculation from '../calculations/OutgoingCalculation';
import { useState, useEffect, useMemo } from 'react';
import { calculateCost } from '@/utils/calculationUtils';
import { useTransformerStore } from '@/store/useTransformerStore';
import { Select } from '@/components/ui/select';

interface CellItemProps {
  cell: RunnCell;
  idx: number;
  updateCell: (id: string, field: keyof RunnCell, value: string | number | string[]) => void;
  removeCell: (id: string) => void;
  categoryMaterials: Material[];
  meterMaterials: Material[];
  meterMaterialsLoading: boolean;
  breakerOptions: string[];
  meterOptions: string[];
  switchingDeviceOptions: string[];
  rpsLeftMaterials?: Material[];
  fusesPnMaterials?: Material[];
  avtomatLityMaterials?: Material[];
  currentTransformerMaterials?: Material[];
  cellPrefix?: string; // Префикс для заголовка ячейки
  inputCell?: RunnCell; // Ячейка "Ввод" для получения информации о корпусе
  onCalculationResult?: (cellId: string, type: 'main' | 'meter', price: number) => void;
}

export default function CellItem({ 
  cell, 
  idx, 
  updateCell, 
  removeCell, 
  categoryMaterials, 
  meterMaterials, 
  meterMaterialsLoading, 
  breakerOptions, 
  meterOptions, 
  switchingDeviceOptions,
  rpsLeftMaterials = [],
  fusesPnMaterials = [],
  avtomatLityMaterials = [],
  currentTransformerMaterials = [],
  cellPrefix = "Отходящая",
  inputCell,
  onCalculationResult
}: CellItemProps) {
  const { selectedTransformer } = useTransformerStore();
  
  // Получаем материал трансформатора
  const transformerMaterial = selectedTransformer?.busbars || 'Не выбран';
  
  const cellWithMethods = {
    ...cell,
    update: (field: keyof RunnCell, val: string | number | string[]) => updateCell(cell.id, field, val),
    remove: () => removeCell(cell.id),
  };

  // Загружаем список калькуляций отходящих ячеек
  const { calculations: outgoingCalculations, loading: outgoingCalculationsLoading } = useOutgoingCalculations();
  
  // Состояние для выбранной калькуляции отходящей ячейки
  const [selectedOutgoingCalculation, setSelectedOutgoingCalculation] = useState<any>(null);
  const [previousCalculationId, setPreviousCalculationId] = useState<string | null>(null);
  
  // Материалы из дополнительной калькуляции для литого корпуса (вычисляем на лету)
  const additionalMoldedCaseMaterials = useMemo(() => {
    if (!selectedOutgoingCalculation?.data?.cellConfig?.materials?.molded_case_breaker) {
      return [];
    }
    return selectedOutgoingCalculation.data.cellConfig.materials.molded_case_breaker.map((breaker: any) => ({
      id: breaker.id || Math.random().toString(),
      name: breaker.name,
      code: breaker.code || '',
      unit: breaker.unit || 'шт',
      price: breaker.price || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
  }, [selectedOutgoingCalculation]);

  const additionalRpsMaterials = useMemo(() => {
    if (!selectedOutgoingCalculation?.data?.cellConfig?.materials?.rps) {
      return [];
    }
    return selectedOutgoingCalculation.data.cellConfig.materials.rps.map((rps: any) => ({
      id: rps.id || Math.random().toString(),
      name: rps.name,
      code: rps.code || '',
      unit: rps.unit || 'шт',
      price: rps.price || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
  }, [selectedOutgoingCalculation]);

  // Эффект для автоматического выбора коммутационного аппарата при выборе дополнительной калькуляции
  useEffect(() => {
    if (!selectedOutgoingCalculation?.data?.cellConfig?.materials) {
      return;
    }
    
    const materials = selectedOutgoingCalculation.data.cellConfig.materials;
    
    // Проверяем наличие РПС
    if (materials.rps && Array.isArray(materials.rps) && materials.rps.length > 0) {
      // Если есть РПС, автоматически выбираем "РПС" как коммутационный аппарат
      if (cell.switchingDevice !== 'РПС') {
        updateCell(cell.id, 'switchingDevice', 'РПС');
      }
      
      // Проставляем все РПС в ячейку
      const rpsNames = materials.rps.map((rps: any) => rps.name);
      
      // Проверяем, нужно ли обновлять rubilniki
      const currentRubilniki = cell.rubilniki || [];
      
      // Проверяем, изменилась ли калькуляция
      const currentCalculationId = selectedOutgoingCalculation?.id;
      const calculationChanged = currentCalculationId !== previousCalculationId;
      
      // Обновляем рубильники если:
      // 1. Массив пустой
      // 2. Все значения пустые (пользователь выбрал "—" для всех)
      // 3. Значения точно совпадают с исходными из калькуляции
      // 4. Текущие рубильники не являются РПС (при смене типа коммутационного аппарата)
      // 5. Калькуляция изменилась (при смене калькуляции)
      const isEmpty = currentRubilniki.length === 0;
      const allEmpty = currentRubilniki.every(rubilnik => !rubilnik || rubilnik.trim() === '');
      const isUnchanged = JSON.stringify([...currentRubilniki].sort()) === JSON.stringify([...rpsNames].sort());
      const isNotRpsRubilniki = currentRubilniki.some(rubilnik => 
        rubilnik && rubilnik.trim() !== '' && !rubilnik.includes('РПС')
      );
      
      
      if (isEmpty || allEmpty || isUnchanged || isNotRpsRubilniki || calculationChanged) {
        // Проверяем, что новые значения действительно отличаются от текущих
        const currentNames = currentRubilniki.map(r => r?.trim()).filter(r => r);
        const newNames = rpsNames.map(r => r?.trim()).filter(r => r);
        
        
        // Обновляем только если калькуляция изменилась или это первичная настройка
        if ((calculationChanged || isEmpty || allEmpty || isNotRpsRubilniki) && 
            JSON.stringify([...currentNames].sort()) !== JSON.stringify([...newNames].sort())) {
          updateCell(cell.id, 'rubilniki', rpsNames);
        }
      }
      
      // Обновляем previousCalculationId после обработки
      if (calculationChanged) {
        setPreviousCalculationId(currentCalculationId);
      }
    }
    // Проверяем наличие литого корпуса и рубильника
    else if (materials.molded_case_breaker && materials.rubilnik) {
        // Если есть и molded_case_breaker, и rubilnik, выбираем "Литой корпус + Рубильник"
        if (cell.switchingDevice !== 'Литой корпус + Рубильник') {
          updateCell(cell.id, 'switchingDevice', 'Литой корпус + Рубильник');
        }
        
        // Проставляем автоматы в ячейку
        const moldedCaseBreakers = materials.molded_case_breaker;
        if (Array.isArray(moldedCaseBreakers) && moldedCaseBreakers.length > 0) {
          const breakerNames = moldedCaseBreakers.map((breaker: any) => breaker.name);
          
          // Проверяем, нужно ли обновлять rubilniki
          const currentRubilniki = cell.rubilniki || [];
          
          // Проверяем, изменилась ли калькуляция
          const currentCalculationId = selectedOutgoingCalculation?.id;
          const calculationChanged = currentCalculationId !== previousCalculationId;
          
          // Обновляем рубильники если:
          // 1. Массив пустой
          // 2. Все значения пустые (пользователь выбрал "—" для всех)
          // 3. Значения точно совпадают с исходными из калькуляции
          // 4. Текущие рубильники не являются автоматами (при смене типа коммутационного аппарата)
          // 5. Калькуляция изменилась (при смене калькуляции)
          const isEmpty = currentRubilniki.length === 0;
          const allEmpty = currentRubilniki.every(rubilnik => !rubilnik || rubilnik.trim() === '');
          const isUnchanged = JSON.stringify([...currentRubilniki].sort()) === JSON.stringify([...breakerNames].sort());
          const isNotMoldedCaseBreakers = currentRubilniki.some(rubilnik => 
            rubilnik && rubilnik.trim() !== '' && !rubilnik.includes('Автомат')
          );
          
          if (isEmpty || allEmpty || isUnchanged || isNotMoldedCaseBreakers || calculationChanged) {
            // Проверяем, что новые значения действительно отличаются от текущих
            const currentNames = currentRubilniki.map(r => r?.trim()).filter(r => r);
            const newNames = breakerNames.map(r => r?.trim()).filter(r => r);
            
            // Обновляем только если калькуляция изменилась или это первичная настройка
            if ((calculationChanged || isEmpty || allEmpty || isNotMoldedCaseBreakers) && 
                JSON.stringify([...currentNames].sort()) !== JSON.stringify([...newNames].sort())) {
              updateCell(cell.id, 'rubilniki', breakerNames);
            }
          }
          
          // Обновляем previousCalculationId после обработки
          if (calculationChanged) {
            setPreviousCalculationId(currentCalculationId);
          }
        }
    }
    // Проверяем наличие только литого корпуса (без рубильника)
    else if (materials.molded_case_breaker && !materials.rubilnik) {
        // Если есть только molded_case_breaker, выбираем "Литой корпус"
        if (cell.switchingDevice !== 'Литой корпус') {
          updateCell(cell.id, 'switchingDevice', 'Литой корпус');
        }
        
        // Проставляем автоматы в ячейку
        const moldedCaseBreakers = materials.molded_case_breaker;
        if (Array.isArray(moldedCaseBreakers)) {
          const breakerNames = moldedCaseBreakers.map((breaker: any) => breaker.name);
          
          // Проверяем, нужно ли обновлять rubilniki
          const currentRubilniki = cell.rubilniki || [];
          
          // Проверяем, изменилась ли калькуляция
          const currentCalculationId = selectedOutgoingCalculation?.id;
          const calculationChanged = currentCalculationId !== previousCalculationId;
          
          // Обновляем автоматы если:
          // 1. Массив пустой
          // 2. Все значения пустые (пользователь выбрал "—" для всех)
          // 3. Значения точно совпадают с исходными из калькуляции
          // 4. Текущие автоматы не являются автоматами литого корпуса (при смене типа коммутационного аппарата)
          // 5. Калькуляция изменилась (при смене калькуляции)
          const isEmpty = currentRubilniki.length === 0;
          const allEmpty = currentRubilniki.every(automaton => !automaton || automaton.trim() === '');
          const isUnchanged = JSON.stringify([...currentRubilniki].sort()) === JSON.stringify([...breakerNames].sort());
          const isNotMoldedCaseBreakers = currentRubilniki.some(automaton => 
            automaton && automaton.trim() !== '' && !automaton.includes('ВА-57')
          );
          
          if (isEmpty || allEmpty || isUnchanged || isNotMoldedCaseBreakers || calculationChanged) {
            // Проверяем, что новые значения действительно отличаются от текущих
            const currentNames = currentRubilniki.map(r => r?.trim()).filter(r => r);
            const newNames = breakerNames.map(r => r?.trim()).filter(r => r);
            
            // Обновляем только если калькуляция изменилась или это первичная настройка
            if ((calculationChanged || isEmpty || allEmpty || isNotMoldedCaseBreakers) && 
                JSON.stringify([...currentNames].sort()) !== JSON.stringify([...newNames].sort())) {
              updateCell(cell.id, 'rubilniki', breakerNames);
            }
          }
          
          // Обновляем previousCalculationId после обработки
          if (calculationChanged) {
            setPreviousCalculationId(currentCalculationId);
          }
        }
    }
    // Проверяем наличие только воздушного выключателя
    else if (materials.withdrawable_breaker && !materials.molded_case_breaker && !materials.rubilnik && !materials.rps) {
        // Если есть только withdrawable_breaker, выбираем "Воздушный"
        if (cell.switchingDevice !== 'Воздушный') {
          updateCell(cell.id, 'switchingDevice', 'Воздушный');
        }
        
        // Проставляем воздушный выключатель в ячейку
        const withdrawableBreaker = materials.withdrawable_breaker;
        if (Array.isArray(withdrawableBreaker) && withdrawableBreaker.length > 0) {
          // Ищем первый выключатель, который есть в доступных опциях
          const availableBreaker = withdrawableBreaker.find(breaker => 
            breakerOptions.includes(breaker.name)
          );
          
          if (availableBreaker) {
            const breakerName = availableBreaker.name;
            
            // Проверяем, изменилась ли калькуляция
            const currentCalculationId = selectedOutgoingCalculation?.id;
            const calculationChanged = currentCalculationId !== previousCalculationId;
            
            // Обновляем выключатель только если:
            // 1. Текущий выключатель не установлен
            // 2. Текущий выключатель не является воздушным (при смене типа коммутационного аппарата)
            // 3. Калькуляция изменилась (при смене калькуляции)
            const isNotAirBreaker = !cell.breaker || !breakerOptions.includes(cell.breaker);
            
            if ((!cell.breaker || isNotAirBreaker || calculationChanged) && cell.breaker !== breakerName) {
              updateCell(cell.id, 'breaker', breakerName);
            }
            
            // Обновляем previousCalculationId после обработки
            if (calculationChanged) {
              setPreviousCalculationId(currentCalculationId);
            }
          }
        }
      }
  }, [selectedOutgoingCalculation, cell.id, updateCell, breakerOptions, previousCalculationId]);


  // Используем выбранную калькуляцию из выпадающего списка вместо автоматического поиска
  const calculation = selectedOutgoingCalculation;
  const loading = false; // Не загружаем автоматически
  const error = null; // Ошибки обрабатываем в выпадающем списке
  
  // Загружаем калькуляцию для литого корпуса
  const { calculation: moldedCaseCalculation, loading: moldedCaseLoading, error: moldedCaseError } = useRunnMoldedCaseCalculation(cell, inputCell);
  
  // Загружаем калькуляцию для воздушного выключателя
  const { calculation: airCalculation, loading: airLoading, error: airError } = useRunnAirCalculation(cell, inputCell);
  
  // Загружаем калькуляцию для ПУ
  const { calculation: meterCalculation, loading: meterLoading, error: meterError } = useRunnMeterCalculation(cell);
  
  
  // Состояние для калькуляции РПС
  const [rpsCalculation, setRpsCalculation] = useState<any>(null);
  const [rpsLoading, setRpsLoading] = useState(false);

  // Состояние для управления отображением калькуляции
  const [showCalculation, setShowCalculation] = useState(false);
  
  // Состояние для управления отображением калькуляции ПУ
  const [showMeterCalculation, setShowMeterCalculation] = useState(false);

  // Функция для поиска калькуляции РПС на основе глубины корпуса
  const findRpsCalculation = async () => {
    if (!inputCell?.breaker || cell.switchingDevice !== 'РПС') return null;
    
    // Проверяем, есть ли хотя бы один выбранный рубильник
    const hasAnyRubilnik = cell.rubilniki && cell.rubilniki.some(rubilnik => rubilnik && rubilnik.trim() !== '');
    
    if (!hasAnyRubilnik) return null;
    
    try {
      const { getCaseInfo } = await import('@/utils/caseSizeUtils');
      const caseInfo = getCaseInfo(inputCell.breaker);
      
      if (!caseInfo.isValid) return null;
      
      const token = localStorage.getItem('token') || '';
      const { loadRunnPanelCalculations } = await import('@/domain/runn/calculationLoader');
      const allCalculations = await loadRunnPanelCalculations(token);
      
      // Получаем выбранные рубильники
      const selectedRubilniki = cell.rubilniki?.filter(r => r && r.trim() !== '') || [];
      
      
      // Ищем калькуляцию типа "outgoing" с названием, содержащим глубину корпуса и "рпс"
      const rpsCalculation = allCalculations.find(calc => {
        if (calc.data?.cellConfig?.type !== 'outgoing') return false;
        
        // Проверяем, содержит ли название калькуляции глубину корпуса и "рпс"
        const caseSize = caseInfo.caseSize;
        const calcName = calc.name.toLowerCase();
        
        return calcName.includes(caseSize.toString()) && calcName.includes('рпс');
      });
      
      return rpsCalculation;
    } catch (error) {
      console.error('Ошибка поиска калькуляции РПС:', error);
      return null;
    }
  };

  // Эффект для поиска калькуляции РПС при изменении рубильников
  useEffect(() => {
    const loadRpsCalculation = async () => {
    if (cell.switchingDevice === 'РПС' && inputCell?.breaker) {
        setRpsLoading(true);
        const calc = await findRpsCalculation();
          setRpsCalculation(calc);
          setRpsLoading(false);
      } else {
        setRpsCalculation(null);
      }
    };

    loadRpsCalculation();
  }, [cell.switchingDevice, inputCell?.breaker, cell.rubilniki]);

  // Эффект для сброса состояния калькуляции при изменении типа коммутационного аппарата
  useEffect(() => {
      setShowCalculation(false);
      setShowMeterCalculation(false);
  }, [cell.switchingDevice]);

  // Эффект для сброса состояния калькуляции ПУ при изменении ПУ
  useEffect(() => {
    setShowMeterCalculation(false);
  }, [cell.meterType]);

  return (
    <div className="mb-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3 border-b border-gray-100 pb-3">
        <div>
          <span className="block text-sm font-semibold text-gray-900">{cellPrefix} {idx + 1}</span>
          <span className="text-xs text-gray-500">Настройка отходящей ячейки</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-500">ID: {cell.id.slice(0, 8)}...</span>
        </div>
      </div>


      {/* Выпадающий список калькуляций для отходящих ячеек */}
      {cell.purpose.includes('Отходящая') && (
        <div className="mb-4 rounded-xl border border-gray-200 bg-gray-50/70 p-4">
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
            Дополнительная калькуляция
          </label>
          <Select
            value={selectedOutgoingCalculation?.id || ''}
            onChange={(e) => {
              const calcId = e.target.value;
              const calc = outgoingCalculations.find(c => c.id.toString() === calcId);
              setSelectedOutgoingCalculation(calc || null);
              
              // Сохраняем название выбранной калькуляции
              if (calc) {
                updateCell(cell.id, 'calculationName', calc.name);
                // Также сохраняем в selectedCalculationName для совместимости
                updateCell(cell.id, 'selectedCalculationName', calc.name);
              } else {
                updateCell(cell.id, 'calculationName', '');
                updateCell(cell.id, 'selectedCalculationName', '');
              }
            }}
            className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#8eba1e]/25"
            disabled={outgoingCalculationsLoading}
          >
            <option value="">
              {outgoingCalculationsLoading ? 'Загрузка...' : 'Выберите дополнительную калькуляцию'}
            </option>
            {outgoingCalculations
              .filter(calc => calc.name !== "Панель ЩО 70 (линейная)" && calc.id !== 76)
              .map((calc) => (
              <option key={calc.id} value={calc.id}>
                {calc.name}
              </option>
            ))}
          </Select>
          <p className="mt-2 text-xs text-gray-500">
            Базовая калькуляция "Панель ЩО 70 (линейная)" применяется автоматически
          </p>
        </div>
      )}

      <div className="space-y-4">
        <SwitchingDeviceSelector cell={cellWithMethods} switchingDeviceOptions={switchingDeviceOptions} />
        <CellParameters 
          cell={cellWithMethods} 
          breakerOptions={breakerOptions} 
          meterOptions={meterOptions} 
          meterMaterialsLoading={meterMaterialsLoading}
          categoryMaterials={categoryMaterials}
          rpsLeftMaterials={rpsLeftMaterials}
          additionalRpsMaterials={additionalRpsMaterials}
          avtomatLityMaterials={avtomatLityMaterials}
          additionalMoldedCaseMaterials={additionalMoldedCaseMaterials}
        />
      </div>

      <SwitchingDeviceLogic cell={cellWithMethods} />
      

      {/* Показываем обычную таблицу материалов для других ячеек */}
      {!cell.purpose.includes('Отходящая') && (
        <MaterialSummaryTable cell={cell} categoryMaterials={categoryMaterials} meterMaterials={meterMaterials} rpsLeftMaterials={rpsLeftMaterials} />
      )}

      {/* Отображение калькуляции для отходящих ячеек */}
      {cell.purpose.includes('Отходящая') && (
        <div className="mt-4">
          {/* Показываем базовую калькуляцию и калькуляцию ПУ */}
          {(() => {
            // Ищем базовую калькуляцию "Панель ЩО 70 (линейная)" из списка
            const baseCalculation = outgoingCalculations.find(calc => 
              calc.name === "Панель ЩО 70 (линейная)" || calc.id === 76
            ) || calculation; // Если не найдена, используем из хука
            
            
            // Определяем какую калькуляцию использовать для отображения
            let displayCalculation = baseCalculation;
            let calculationTitle = baseCalculation?.name || "Базовая калькуляция";
            
            // Если есть дополнительная калькуляция, используем её
            if (selectedOutgoingCalculation) {
              displayCalculation = selectedOutgoingCalculation;
              calculationTitle = selectedOutgoingCalculation.name;
            }
            
            return displayCalculation ? (
              <div className="mb-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <h4 className="text-xs font-medium text-green-900 mb-2">
                    {calculationTitle}
                  </h4>
                  <OutgoingCalculation
                    cell={cell}
                    calculation={baseCalculation}
                    fusesPnMaterials={fusesPnMaterials}
                    avtomatLityMaterials={avtomatLityMaterials}
                    additionalRpsMaterials={selectedOutgoingCalculation?.data?.cellConfig?.materials?.rps || []}
                    additionalMoldedCaseMaterials={selectedOutgoingCalculation?.data?.cellConfig?.materials?.molded_case_breaker || []}
                    additionalRubilnikMaterials={selectedOutgoingCalculation?.data?.cellConfig?.materials?.rubilnik || []}
                    rpsLeftMaterials={rpsLeftMaterials}
                    categoryMaterials={categoryMaterials}
                    currentTransformerMaterials={currentTransformerMaterials}
                    onCalculationResult={onCalculationResult}
                  />
                </div>
              </div>
            ) : null;
          })()}
          
          {/* Показываем калькуляцию ПУ отдельно, если она есть */}
          {meterCalculation ? (
            <div className="mb-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <h4 className="text-xs font-medium text-blue-900 mb-2">
                  Калькуляция ПУ: {meterCalculation.name}
                </h4>
                <div className="text-xs text-blue-600 mb-2">
                  Детали калькуляции можно скрыть, нажав на заголовок блока ниже
                </div>
                <OutgoingCalculation
                  cell={cell}
                  calculation={meterCalculation}
                  fusesPnMaterials={fusesPnMaterials}
                  avtomatLityMaterials={avtomatLityMaterials}
                  additionalRpsMaterials={[]}
                  additionalMoldedCaseMaterials={[]}
                  additionalRubilnikMaterials={[]}
                  rpsLeftMaterials={rpsLeftMaterials}
                  categoryMaterials={categoryMaterials}
                  currentTransformerMaterials={currentTransformerMaterials}
                  onCalculationResult={onCalculationResult}
                />
              </div>
            </div>
          ) : cell.meterType ? (
            <div className="mb-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <h4 className="text-xs font-medium text-yellow-900 mb-2">
                  Отладка калькуляции ПУ
                </h4>
                <div className="text-xs text-yellow-800">
                  <p>Счетчик выбран: {cell.meterType}</p>
                  <p>Загрузка: {meterLoading ? 'Да' : 'Нет'}</p>
                  <p>Ошибка: {meterError || 'Нет'}</p>
                  <p>Калькуляция найдена: {meterCalculation ? 'Да' : 'Нет'}</p>
                </div>
              </div>
            </div>
          ) : null}
          
          {/* Показываем дополнительную калькуляцию из выпадающего списка */}
          {selectedOutgoingCalculation && (
            <div className="mb-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-xs font-medium text-blue-900">
                    Дополнительная калькуляция: {selectedOutgoingCalculation.name}
                  </h4>
                  <button 
                    onClick={() => {
                      setSelectedOutgoingCalculation(null);
                      updateCell(cell.id, 'selectedCalculationName', '');
                    }}
                    className="px-2 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700"
                  >
                    Скрыть
                  </button>
                </div>
                
                {/* Показываем только cellConfig из дополнительной калькуляции */}
                {selectedOutgoingCalculation.data?.cellConfig && (
                  <div className="mt-3">
                    <h5 className="text-xs font-medium text-blue-800 mb-2">Конфигурация ячейки:</h5>
                    <div className="bg-white border border-blue-200 rounded p-2">
                      <div className="text-xs text-gray-700">
                        <div className="flex justify-between mb-2 pb-2 border-b border-gray-200">
                          <span><strong>Материал трансформатора:</strong></span>
                          <span className="font-medium">{transformerMaterial}</span>
                        </div>
                        <p><strong>Тип:</strong> {selectedOutgoingCalculation.data.cellConfig.type}</p>
                        
                        {/* Показываем РПС из materials.rps */}
                        {selectedOutgoingCalculation.data.cellConfig.materials?.rps && Array.isArray(selectedOutgoingCalculation.data.cellConfig.materials.rps) && (
                          <div className="mt-2">
                            <p className="font-medium">РПС (автоматически выбраны):</p>
                            <ul className="list-disc list-inside ml-2">
                              {selectedOutgoingCalculation.data.cellConfig.materials.rps.map((rps: any, index: number) => (
                                <li key={index} className="text-xs">
                                  {rps.name} - {rps.price.toLocaleString()} ₸
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {/* Показываем другие материалы если есть */}
                        {selectedOutgoingCalculation.data.cellConfig.materials && 
                         Object.keys(selectedOutgoingCalculation.data.cellConfig.materials).filter(key => key !== 'rps').length > 0 && (
                          <div className="mt-2">
                            <p className="font-medium">Другие материалы:</p>
                            {Object.entries(selectedOutgoingCalculation.data.cellConfig.materials)
                              .filter(([key]) => key !== 'rps')
                              .map(([key, value]: [string, any]) => (
                                <div key={key} className="mt-1">
                                  <p className="font-medium text-xs">{key}:</p>
                                  {Array.isArray(value) ? (
                                    <ul className="list-disc list-inside ml-2">
                                      {value.map((item: any, index: number) => (
                                        <li key={index} className="text-xs">
                                          {item.name || item} - {item.price ? item.price.toLocaleString() + ' ₸' : ''}
                                        </li>
                                      ))}
                                    </ul>
                                  ) : (
                                    <p className="text-xs ml-2">{JSON.stringify(value)}</p>
                                  )}
                                </div>
                              ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Показываем сообщение если нет дополнительной калькуляции */}
          {!selectedOutgoingCalculation && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <p className="text-xs text-gray-700">
                Выберите дополнительную калькуляцию из списка выше (опционально)
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 