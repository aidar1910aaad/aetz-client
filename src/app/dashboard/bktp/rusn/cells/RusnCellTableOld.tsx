'use client';

import { useRusnStore } from '@/store/useRusnStore';
import { useRusnMaterials } from '@/hooks/useRusnMaterials';
import { useRusnCalculation } from '@/hooks/useRusnCalculation';
import RusnCell from './RusnCell';
import RusnSummaryTable from '../calculations/RusnSummaryTable';
// TogglerWithInput теперь импортируется из RusnGlobalConfig
import { useState, useEffect, useRef, useCallback, ReactNode } from 'react';

// Компонент TogglerWithInput
type TogglerWithInputProps = {
  label: string;
  children: ReactNode;
  defaultEnabled?: boolean;
  toggled?: boolean;
  onToggle?: () => void;
};

function TogglerWithInput({
  label,
  children,
  defaultEnabled = false,
  toggled,
  onToggle,
}: TogglerWithInputProps) {
  const [internalEnabled, setInternalEnabled] = useState(defaultEnabled);
  const isControlled = toggled !== undefined;
  const isEnabled = isControlled ? toggled : internalEnabled;

  const handleClick = () => {
    if (isControlled && onToggle) {
      onToggle();
    } else {
      setInternalEnabled((prev) => !prev);
    }
  };

  return (
    <div className="mb-3 rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-gray-100 bg-gray-50">
        <h4 className="text-sm font-medium text-gray-800 truncate" title={label}>
          {label}
        </h4>
        <button
          onClick={handleClick}
          className={`text-xs font-medium px-2.5 py-1 rounded transition duration-150 ml-2 ${
            isEnabled
              ? 'bg-red-100 text-red-700 hover:bg-red-200'
              : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
          }`}
        >
          {isEnabled ? 'Нет' : 'Добавить'}
        </button>
      </div>
      {isEnabled && <div className="px-4 py-3 space-y-2">{children}</div>}
    </div>
  );
}
import { useCalculationGroups } from '@/hooks/useCalculationGroups';
import { switchgearApi } from '@/api/switchgear';
import { getCellTypesForGroup } from '@/config/cellTypeConfigs';
import { useCellManager } from '@/hooks/useCellManager';
import { useMaterialUpdater } from '@/hooks/useMaterialUpdater';

export default function RusnCellTable() {
  const { removeCellSummary, global } = useRusnStore();
  const { cellConfigs, addCell, updateCell, materials, global: globalSettings } = useCellManager();
  useMaterialUpdater(); // Автоматически обновляет материалы
  
  const [openCellMap, setOpenCellMap] = useState<Record<string, string>>({});
  const [deletedCells, setDeletedCells] = useState<Set<string>>(new Set());
  const [createdCells, setCreatedCells] = useState<Set<string>>(new Set());
  const { loading: groupsLoading, error: groupsError } = useCalculationGroups();
  const [selectedGroupSlug, setSelectedGroupSlug] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('selectedGroupSlug') || '';
    }
    return '';
  });
  const [selectedGroupName, setSelectedGroupName] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('selectedGroupName') || '';
    }
    return '';
  });
  const { calculations } = useRusnCalculation(selectedGroupSlug);

  // Получаем типы ячеек для выбранной группы из API
  const cellTypes = getCellTypesForGroup(global.bodyType || 'Камера КСО А12-10');
  
  // Логируем типы ячеек
  
  
  // Проверяем, выбраны ли основные материалы в разделе "Оборудование" (счетчик опциональный)
  const isEquipmentSelected = global.breaker && global.rza;

  // Сбрасываем флаг созданных ячеек при изменении типа камеры
  useEffect(() => {
    if (prevBodyTypeRef.current !== global.bodyType) {
      setCreatedCells(new Set());
      setDeletedCells(new Set());
      prevBodyTypeRef.current = global.bodyType;
    }
  }, [global.bodyType]);

  // Отслеживаем изменения в localStorage для обновления slug и name
  useEffect(() => {
    const handleStorageChange = () => {
      const newSlug = localStorage.getItem('selectedGroupSlug') || '';
      const newName = localStorage.getItem('selectedGroupName') || '';
      
      if (newSlug !== selectedGroupSlug) {
        setSelectedGroupSlug(newSlug);
      }
      if (newName !== selectedGroupName) {
        setSelectedGroupName(newName);
      }
    };

    // Слушаем изменения в localStorage
    window.addEventListener('storage', handleStorageChange);
    
    // Также проверяем при изменении global.bodyType
    if (global.bodyType) {
      const newSlug = localStorage.getItem('selectedGroupSlug') || '';
      const newName = localStorage.getItem('selectedGroupName') || '';
      
      if (newSlug !== selectedGroupSlug) {
        setSelectedGroupSlug(newSlug);
      }
      if (newName !== selectedGroupName) {
        setSelectedGroupName(newName);
      }
    }

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [global.bodyType, selectedGroupSlug, selectedGroupName]);
  
  // Функция для проверки, есть ли в ячейке выбранные материалы
  const hasSelectedMaterials = useCallback((cell: any) => {
    return !!(cell.breaker || cell.rza || cell.meterType || cell.transformerCurrent || 
              cell.transformerVoltage || cell.transformerPower || cell.transformer);
  }, []);

  // Универсальный useEffect для автоматического создания ячеек
  useEffect(() => {
    if (isEquipmentSelected && global.bodyType && !loading && !materialsError && materials.breaker.length > 0) {
      // Защита от бесконечного цикла - ограничиваем количество ячеек
      if (cellConfigs.length > 10) {
        console.warn('Слишком много ячеек в store, пропускаем автоматическое создание');
        return;
      }
      
      Object.entries(autoCellConfigs).forEach(([cellType, config]) => {
        // Проверяем, доступна ли ячейка для выбранного типа камеры
        if (!cellTypes.includes(cellType)) {
          return;
        }
        
        const existingCell = cellConfigs.find(cell => cell.purpose === cellType);
        
        // Специальная логика для "Секционный выключатель" - создаем только при первом запуске
        // Специальная логика для "Трансформатор напряжения" - создаем только если выбран счетчик
        const shouldCreate = cellType === 'Секционный выключатель' 
          ? (!existingCell && !deletedCells.has(cellType) && cellConfigs.length === 0 && !createdCells.has(cellType))
          : cellType === 'Трансформатор напряжения'
          ? (!existingCell && !deletedCells.has(cellType) && global.meterType && !createdCells.has(cellType))
          : (!existingCell && !deletedCells.has(cellType) && !createdCells.has(cellType));
        
        if (shouldCreate) {
          createCellByConfig(cellType, config, materials, global, addCell);
          setCreatedCells(prev => new Set([...prev, cellType]));
        }
        // Убираем логику заполнения пустых ячеек, чтобы избежать создания дубликатов
      });
    }
  }, [isEquipmentSelected, global.bodyType, global.meterType, loading, materialsError, materials.breaker.length, materials.rza.length, materials.meter.length, materials.tt.length, materials.sr.length, deletedCells, createdCells, hasSelectedMaterials]);

  // Автоматически открываем созданные ячейки и очищаем материалы для КСО 366
  useEffect(() => {
    // Очищаем материалы у ячеек "Ввод" для камеры КСО 366
    if (global.bodyType === 'Камера КСО 366') {
      const inputCell = cellConfigs.find(cell => cell.purpose === 'Ввод');
      if (inputCell && (inputCell.breaker || inputCell.rza || inputCell.meterType || inputCell.transformerCurrent || inputCell.transformerVoltage || inputCell.transformerPower)) {
        console.log('🔍 [RusnCellTable] Очищаем материалы у ячейки Ввод для КСО 366');
        // Очищаем только те поля, которые действительно имеют значения
        if (inputCell.breaker) updateCell(inputCell.id, 'breaker', undefined);
        if (inputCell.rza) updateCell(inputCell.id, 'rza', undefined);
        if (inputCell.meterType) updateCell(inputCell.id, 'meterType', undefined);
        if (inputCell.transformerCurrent) updateCell(inputCell.id, 'transformerCurrent', undefined);
        if (inputCell.transformerVoltage) updateCell(inputCell.id, 'transformerVoltage', undefined);
        if (inputCell.transformerPower) updateCell(inputCell.id, 'transformerPower', undefined);
      }
    }

    // Открываем ячейку "Секционный выключатель", если она создана но не открыта
    const sectionBreakerCell = cellConfigs.find(cell => cell.purpose === 'Секционный выключатель');
    if (sectionBreakerCell && !openCellMap['Секционный выключатель']) {
      setOpenCellMap(prev => ({
        ...prev,
        'Секционный выключатель': sectionBreakerCell.id,
      }));
    }

    // Открываем ячейку "Секционный разьединитель", если она создана но не открыта
    const sectionDisconnectorCell = cellConfigs.find(cell => cell.purpose === 'Секционный разьединитель');
    if (sectionDisconnectorCell && !openCellMap['Секционный разьединитель']) {
      setOpenCellMap(prev => ({
        ...prev,
        'Секционный разьединитель': sectionDisconnectorCell.id,
      }));
    }

    // Открываем ячейку "Трансформаторная", если она создана но не открыта
    const transformerCell = cellConfigs.find(cell => cell.purpose === 'Трансформаторная');
    if (transformerCell && !openCellMap['Трансформаторная']) {
      setOpenCellMap(prev => ({
        ...prev,
        'Трансформаторная': transformerCell.id,
      }));
    }

    // Открываем ячейку "Трансформатор напряжения", если она создана но не открыта
    const transformerVoltageCell = cellConfigs.find(cell => cell.purpose === 'Трансформатор напряжения');
    if (transformerVoltageCell && !openCellMap['Трансформатор напряжения']) {
      setOpenCellMap(prev => ({
        ...prev,
        'Трансформатор напряжения': transformerVoltageCell.id,
      }));
    }
  }, [cellConfigs, openCellMap, global.bodyType]);

  // Обновляем счетчик в существующей ячейке "Ввод" при изменении глобального счетчика
  useEffect(() => {
    if (global.meterType && materials.meter.length > 0) {
      const existingInputCell = cellConfigs.find(cell => cell.purpose === 'Ввод');
      
      if (existingInputCell) {
        // Ищем точное совпадение по ID глобально выбранного счетчика
        let targetMeter = materials.meter.find(meter => meter.id.toString() === global.meterType.id.toString());
        
        // Если не найден по ID, ищем по названию категории
        if (!targetMeter) {
          // Ищем по названию категории в доступных счетчиках
          if (global.meterType.name.toLowerCase().includes('меркурий')) {
            // Ищем счетчики Меркурий с приоритетом
            // Сначала ищем точное совпадение
            targetMeter = materials.meter.find(meter => 
              meter.name.toLowerCase().includes('234 art 2') && 
              !meter.name.toLowerCase().includes('artm')
            );
            
            // Если не найден, ищем любой счетчик Меркурий
            if (!targetMeter) {
              targetMeter = materials.meter.find(meter => 
                meter.name.toLowerCase().includes('меркурий')
              );
            }
          } else if (global.meterType.name.toLowerCase().includes('сайман')) {
            // Ищем счетчики Сайман
            targetMeter = materials.meter.find(meter => 
              meter.name.toLowerCase().includes('сайман')
            );
          }
        }
        
        if (targetMeter && existingInputCell.meterType?.id !== targetMeter.id.toString()) {
          updateCell(existingInputCell.id, 'meterType', {
            id: targetMeter.id.toString(),
            name: targetMeter.name,
            price: Number(targetMeter.price),
          });
        }
      }
    }
  }, [global.meterType, materials.meter]);

  // Обновляем материалы в существующей ячейке "Секционный выключатель" при изменении глобального оборудования
  useEffect(() => {
    if (global.breaker && global.rza && materials.breaker.length > 0 && materials.rza.length > 0) {
      const existingSectionCell = cellConfigs.find(cell => cell.purpose === 'Секционный выключатель');
      
      if (existingSectionCell) {
        // Ищем точное совпадение по ID глобально выбранного выключателя
        let targetBreaker = materials.breaker.find(breaker => breaker.id.toString() === global.breaker.id.toString());
        
        // Если не найден по ID, ищем по названию
        if (!targetBreaker) {
          targetBreaker = materials.breaker.find(breaker => 
            breaker.name.toLowerCase().includes('av-12 1250a')
          );
        }
        
        // Ищем точное совпадение по ID глобально выбранного РЗА
        let targetRza = materials.rza.find(rza => rza.id.toString() === global.rza.id.toString());
        
        // Если не найден по ID, ищем по названию
        if (!targetRza) {
          targetRza = materials.rza.find(rza => 
            rza.name.toLowerCase().includes('рс 83 а 2.0') || 
            rza.name.toLowerCase().includes('рзиа по току рс 83 а 2.0')
          );
        }
        
        // Обновляем выключатель, если найден и отличается
        if (targetBreaker && existingSectionCell.breaker?.id !== targetBreaker.id.toString()) {
          updateCell(existingSectionCell.id, 'breaker', {
            id: targetBreaker.id.toString(),
            name: targetBreaker.name,
            price: Number(targetBreaker.price),
          });
        }
        
        // Обновляем РЗА, если найден и отличается
        if (targetRza && existingSectionCell.rza?.id !== targetRza.id.toString()) {
          updateCell(existingSectionCell.id, 'rza', {
            id: targetRza.id.toString(),
            name: targetRza.name,
            price: Number(targetRza.price),
          });
        }
      }
    }
  }, [global.breaker, global.rza, materials.breaker, materials.rza]);

  // Обновляем материалы в существующей ячейке "Секционный разьединитель" при изменении глобального оборудования
  useEffect(() => {
    if (global.sr && materials.sr && materials.sr.length > 0) {
      const existingDisconnectorCell = cellConfigs.find(cell => cell.purpose === 'Секционный разьединитель');
      
      if (existingDisconnectorCell) {
        // Ищем точное совпадение по ID глобально выбранного разъединителя
        let targetDisconnector = materials.sr.find(sr => sr.id.toString() === global.sr.id.toString());
        
        // Если не найден по ID, ищем по названию
        // Приоритетно ищем "РВЗ - 10/630 - III"
        if (!targetDisconnector) {
          targetDisconnector = materials.sr.find(sr => 
            sr.name.toLowerCase().includes('рвз - 10/630 - iii')
          );
        }
        
        // Если не найден, ищем по общим терминам
        if (!targetDisconnector) {
          targetDisconnector = materials.sr.find(sr => 
            sr.name.toLowerCase().includes('разъединитель')
          );
        }
        
        // Обновляем разъединитель, если найден и отличается
        if (targetDisconnector && existingDisconnectorCell.breaker?.id !== targetDisconnector.id.toString()) {
          updateCell(existingDisconnectorCell.id, 'breaker', {
            id: targetDisconnector.id.toString(),
            name: targetDisconnector.name,
            price: Number(targetDisconnector.price),
          });
        }
      }
    }
  }, [global.sr, materials.sr, cellConfigs, updateCell]);

  // Сбрасываем состояние удаленных ячеек при изменении глобальных настроек
  useEffect(() => {
    setDeletedCells(new Set());
  }, [global.breaker, global.rza, global.meterType, global.bodyType, global.sr]);

  // Сбрасываем все ячейки и сводки при изменении типа ячеек
  useEffect(() => {
    if (global.bodyType && prevBodyTypeRef.current && prevBodyTypeRef.current !== global.bodyType) {
      console.log(`🔄 [RusnCellTable] Смена типа камеры: ${prevBodyTypeRef.current} → ${global.bodyType}`);
      
      // Очищаем все ячейки из store
      clearAllCells();
      
      // Очищаем все сводки ячеек
      useRusnStore.getState().clearCellSummaries();
      
      // Сбрасываем состояние удаленных ячеек
      setDeletedCells(new Set());
      
      // Сбрасываем состояние созданных ячеек
      setCreatedCells(new Set());
      
      // Очищаем карту открытых ячеек
      setOpenCellMap({});
      
      // Очищаем глобальные настройки оборудования
      useRusnStore.getState().setGlobal('breaker', null);
      useRusnStore.getState().setGlobal('rza', null);
      useRusnStore.getState().setGlobal('meterType', null);
      useRusnStore.getState().setGlobal('sr', null);
      useRusnStore.getState().setGlobal('tsn', null);
      useRusnStore.getState().setGlobal('tn', null);
      useRusnStore.getState().setGlobal('tt', null);
      
      // Обновляем selectedGroupSlug и selectedGroupName
      const newGroupSlug = localStorage.getItem('selectedGroupSlug') || '';
      const newGroupName = localStorage.getItem('selectedGroupName') || '';
      setSelectedGroupSlug(newGroupSlug);
      setSelectedGroupName(newGroupName);
      
      console.log(`🔄 [RusnCellTable] Все ячейки и настройки очищены для новой камеры: ${global.bodyType}`);
    }
    
    // Обновляем предыдущий тип
    prevBodyTypeRef.current = global.bodyType;
  }, [global.bodyType, clearAllCells]);


  // Фильтруем материалы по выбранным категориям
  const filteredMaterials = {
    breaker: materials.breaker,
    rza: materials.rza,
    meter: materials.meter,
    transformer: materials.transformer,
    sr: materials.sr,
    tsn: materials.tsn,
    tn: materials.tn,
    tt: materials.tt,
  };

  // Сохраняем выбранные значения в localStorage
  useEffect(() => {
    if (selectedGroupSlug) {
      localStorage.setItem('selectedGroupSlug', selectedGroupSlug);
    }
    if (selectedGroupName) {
      localStorage.setItem('selectedGroupName', selectedGroupName);
    }
  }, [selectedGroupSlug, selectedGroupName]);

  // Выводим калькуляции и настройки свитчгеар в консоль при изменении типа ячейки
  useEffect(() => {
    const fetchSwitchgearConfig = async () => {
      try {
        const configs = await switchgearApi.getAll();
        const filteredConfigs = configs.filter((config) => config.type === selectedGroupName);
      } catch (error) {
        console.error('Ошибка при получении настроек:', error);
      }
    };

    if (selectedGroupName) {
      fetchSwitchgearConfig();
    }
  }, [selectedGroupName, calculations.cell]);

  useEffect(() => {
    const handleAddCell = (event: CustomEvent) => {
      const newCell = event.detail;
      addCell(newCell);
    };

    window.addEventListener('addCell', handleAddCell as EventListener);
    return () => {
      window.removeEventListener('addCell', handleAddCell as EventListener);
    };
  }, [addCell]);

  const handleToggle = (type: string) => {
    const isOpen = !!openCellMap[type];

    if (isOpen) {
      const id = openCellMap[type];
      const cell = cellConfigs.find(c => c.id === id);
      
      // Проверяем, есть ли в ячейке выбранные материалы
      if (cell && hasSelectedMaterials(cell)) {
        // Если есть материалы, просто скрываем ячейку
        setOpenCellMap((prev) => {
          const newMap = { ...prev };
          delete newMap[type];
          return newMap;
        });
      } else {
        // Если нет материалов, удаляем ячейку полностью
        removeCell(id);
        removeCellSummary(id); // Удаляем из сводки
        setOpenCellMap((prev) => {
          const newMap = { ...prev };
          delete newMap[type];
          return newMap;
        });
        
        // Отмечаем любую удаленную ячейку как удаленную
        setDeletedCells(prev => new Set([...prev, type]));
      }
    } else {
      // Убираем ячейку из списка удаленных, если пользователь добавляет её обратно
      setDeletedCells(prev => {
        const newSet = new Set(prev);
        newSet.delete(type);
        return newSet;
      });
      
      // Отмечаем ячейку как созданную пользователем, чтобы она не создавалась автоматически
      setCreatedCells(prev => new Set([...prev, type]));
      
      // Если добавляем ячейку "Ввод" или "Отходящая", создаем её с предустановленными материалами
      if ((type === 'Ввод' || type === 'Отходящая') && isEquipmentSelected && materials.breaker.length > 0) {
        // Для камеры "КСО 366" ячейка "Ввод" создается без материалов
        if (global.bodyType === 'Камера КСО 366' && type === 'Ввод') {
          console.log('🔍 [handleToggle] Камера КСО 366 - создаем ячейку Ввод без материалов');
          addCell({
            purpose: type,
            cellType: global.bodyType || '',
            count: 2,
            totalPrice: 0,
          });
        } else {
          // Находим материалы по названию
        const findMaterialByName = (materialList: any[], searchTerms: string[]) => {
          return materialList.find(material => 
            searchTerms.some(term => 
              material.name.toLowerCase().includes(term.toLowerCase())
            )
          );
        };

        // Поиск по точным названиям материалов
        const targetBreaker = findMaterialByName(materials.breaker, ['AV-12 1250A']);
        const targetRza = findMaterialByName(materials.rza, ['РС 83 А 2.0', 'РЗиА по току РС 83 А 2.0']);
        
        // Приоритетно используем глобально выбранный счетчик, если он есть
        let targetMeter = null;
        if (global.meterType) {
          // Ищем точное совпадение по ID глобально выбранного счетчика
          targetMeter = materials.meter.find(meter => meter.id.toString() === global.meterType.id.toString());
        }
        
        // Если глобальный счетчик не найден, ищем по названию
        if (!targetMeter) {
          // Сначала ищем точные совпадения для доступных счетчиков
          targetMeter = findMaterialByName(materials.meter, [
            'Счетчик э/э Меркурий 234 ART 2 - 00 PR',
            'Счетчик э/э Меркурий 234 ARTM 2  - 00 PBR.G',
            'Счетчик э/э Сайман CA4У-Э712 (3*57,7/100V)',
            'Счетчик э/э Сайман CA4У-Э712'
          ]);
          
          // Если точные совпадения не найдены, ищем по общим терминам
          if (!targetMeter) {
            targetMeter = findMaterialByName(materials.meter, [
              '234 ART 2',
              '234 ARTM 2',
              'CA4У-Э712',
              'Меркурий',
              'Сайман'
            ]);
          }
        }
        
        const targetTt = findMaterialByName(materials.tt, ['ТОЛ-10 200/5', '200/5']);
        
        addCell({
          purpose: type,
          cellType: global.bodyType || '',
          breaker: targetBreaker ? {
            id: targetBreaker.id.toString(),
            name: targetBreaker.name,
            price: Number(targetBreaker.price),
          } : undefined,
          rza: targetRza ? {
            id: targetRza.id.toString(),
            name: targetRza.name,
            price: Number(targetRza.price),
          } : undefined,
          meterType: targetMeter ? {
            id: targetMeter.id.toString(),
            name: targetMeter.name,
            price: Number(targetMeter.price),
          } : undefined,
          transformerCurrent: targetTt ? {
            id: targetTt.id.toString(),
            name: targetTt.name,
            price: Number(targetTt.price),
          } : undefined,
          count: type === 'Ввод' ? 2 : 1,
          totalPrice: 0,
        });
        }
      } else {
        // Для других ячеек создаем пустые
        addCell({
          purpose: type,
          cellType: global.bodyType || '',
          count: 1,
          totalPrice: 0,
        });
      }
      
      const newCell = cellConfigs.find((cell) => cell.purpose === type);
      if (newCell) {
        setOpenCellMap((prev) => ({
          ...prev,
          [type]: newCell.id,
        }));
      }
    }
  };

  // Синхронизируем openCellMap с cellConfigs
  useEffect(() => {
    const newOpenCellMap: Record<string, string> = {};
    cellConfigs.forEach((cell) => {
      if (cell.purpose !== 'Отходящая') {
        newOpenCellMap[cell.purpose] = cell.id;
      }
    });
    setOpenCellMap(newOpenCellMap);
  }, [cellConfigs]);

  if (loading || groupsLoading) {
    return <div>Загрузка...</div>;
  }

  if (materialsError || groupsError) {
    return (
      <div className="text-red-600 p-4 rounded bg-red-50">
        <h3 className="font-medium mb-2">Произошла ошибка:</h3>
        {materialsError && <p>{materialsError}</p>}
        {groupsError && <p>{groupsError}</p>}
      </div>
    );
  }

  // Проверяем, выбран ли тип ячеек в общих настройках
  if (!global.bodyType) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <div>
            <h3 className="text-sm font-medium text-yellow-900">Сначала выберите тип ячеек</h3>
            <p className="text-sm text-yellow-700 mt-1">
              Перейдите в раздел &quot;Общие настройки&quot; и выберите тип ячеек для продолжения
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!isEquipmentSelected) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <div>
            <h3 className="text-sm font-medium text-yellow-900">Сначала выберите основные материалы</h3>
            <p className="text-sm text-yellow-700 mt-1">
              Перейдите в раздел &quot;Оборудование&quot; и выберите выключатель и РЗиА для продолжения
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Кнопка для очистки store при проблемах */}
      {cellConfigs.length > 10 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div>
                <h3 className="font-medium text-red-800">Обнаружено слишком много ячеек ({cellConfigs.length})</h3>
                <p className="text-sm text-red-600">Это может привести к проблемам с производительностью</p>
              </div>
            </div>
            <button
              onClick={() => {
                clearAllCells();
                useRusnStore.getState().clearCellSummaries();
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Очистить все ячейки
            </button>
          </div>
        </div>
      )}
      
      {/* Информация о выбранном типе ячеек */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          <div>
            <h3 className="text-sm font-medium text-blue-900">Тип ячеек: {global.bodyType}</h3>
            <p className="text-sm text-blue-700 mt-1">Все ячейки будут созданы с выбранным типом</p>
          </div>
        </div>
      </div>

      {cellTypes.map((type) => {
        if (type === 'Отходящая') {
          const outgoingCells = cellConfigs.filter((c) => c.purpose === 'Отходящая');

          return (
            <TogglerWithInput
              key="Отходящая"
              label="Ячейка: Отходящая"
              toggled={outgoingCells.length > 0}
              onToggle={() => {
                if (outgoingCells.length === 0) {
                  // Создаем отходящую ячейку с материалами, как ячейку "Ввод"
                  if (isEquipmentSelected && materials.breaker.length > 0) {
                    const findMaterialByName = (materialList: any[], searchTerms: string[]) => {
                      return materialList.find(material => 
                        searchTerms.some(term => 
                          material.name.toLowerCase().includes(term.toLowerCase())
                        )
                      );
                    };

                    const targetBreaker = findMaterialByName(materials.breaker, ['AV-12 1250A']);
                    const targetRza = findMaterialByName(materials.rza, ['РС 83 А 2.0', 'РЗиА по току РС 83 А 2.0']);
                    
                    let targetMeter = null;
                    if (global.meterType) {
                      targetMeter = materials.meter.find(meter => meter.id.toString() === global.meterType.id.toString());
                    }
                    
                    if (!targetMeter) {
                      targetMeter = findMaterialByName(materials.meter, [
                        'Счетчик э/э Меркурий 234 ART 2 - 00 PR',
                        'Счетчик э/э Меркурий 234 ARTM 2  - 00 PBR.G',
                        'Счетчик э/э Сайман CA4У-Э712 (3*57,7/100V)',
                        'Счетчик э/э Сайман CA4У-Э712'
                      ]);
                      
                      if (!targetMeter) {
                        targetMeter = findMaterialByName(materials.meter, [
                          '234 ART 2',
                          '234 ARTM 2',
                          'CA4У-Э712',
                          'Меркурий',
                          'Сайман'
                        ]);
                      }
                    }
                    
                    const targetTt = findMaterialByName(materials.tt, ['ТОЛ-10 200/5', '200/5']);
                    
                    addCell({
                      purpose: 'Отходящая',
                      cellType: global.bodyType || '',
                      breaker: targetBreaker ? {
                        id: targetBreaker.id.toString(),
                        name: targetBreaker.name,
                        price: Number(targetBreaker.price),
                      } : undefined,
                      rza: targetRza ? {
                        id: targetRza.id.toString(),
                        name: targetRza.name,
                        price: Number(targetRza.price),
                      } : undefined,
                      meterType: targetMeter ? {
                        id: targetMeter.id.toString(),
                        name: targetMeter.name,
                        price: Number(targetMeter.price),
                      } : undefined,
                      transformerCurrent: targetTt ? {
                        id: targetTt.id.toString(),
                        name: targetTt.name,
                        price: Number(targetTt.price),
                      } : undefined,
                      count: 1,
                      totalPrice: 0,
                    });
                  } else {
                    // Если оборудование не выбрано, создаем пустую ячейку
                    addCell({
                      purpose: 'Отходящая',
                      cellType: global.bodyType || '',
                      count: 1,
                      totalPrice: 0,
                    });
                  }
                  
                  const newCell = cellConfigs.find((cell) => cell.purpose === 'Отходящая');
                  if (newCell) {
                    setOpenCellMap((prev) => ({
                      ...prev,
                      ['Отходящая']: newCell.id,
                    }));
                  }
                } else {
                  outgoingCells.forEach((cell) => {
                    removeCell(cell.id);
                  });
                  setOpenCellMap((prev) => {
                    const newMap = { ...prev };
                    delete newMap['Отходящая'];
                    return newMap;
                  });
                }
              }}
            >
              {outgoingCells.map((cell, idx) => (
                <div key={cell.id} className="mb-2">
                  <span className="block text-sm text-gray-500 font-medium mb-1">
                    Отходящая {idx + 1}
                  </span>
                  <RusnCell
                    cell={cell}
                    materials={filteredMaterials}
                    onUpdate={(id, field, value) => {
                      updateCell(id, field, value);
                    }}
                    onRemove={removeCell}
                    groupSlug={selectedGroupSlug}
                    selectedGroupName={selectedGroupName}
                    selectedCalculationName={calculations.cell[0]?.name || ''}
                  />
                </div>
              ))}
              
              {/* Кнопка добавления новой отходящей ячейки */}
              {outgoingCells.length > 0 && (
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => {
                      // Создаем отходящую ячейку с материалами, как ячейку "Ввод"
                      if (isEquipmentSelected && materials.breaker.length > 0) {
                        const findMaterialByName = (materialList: any[], searchTerms: string[]) => {
                          return materialList.find(material => 
                            searchTerms.some(term => 
                              material.name.toLowerCase().includes(term.toLowerCase())
                            )
                          );
                        };

                        const targetBreaker = findMaterialByName(materials.breaker, ['AV-12 1250A']);
                        const targetRza = findMaterialByName(materials.rza, ['РС 83 А 2.0', 'РЗиА по току РС 83 А 2.0']);
                        
                        let targetMeter = null;
                        if (global.meterType) {
                          targetMeter = materials.meter.find(meter => meter.id.toString() === global.meterType.id.toString());
                        }
                        
                        if (!targetMeter) {
                          targetMeter = findMaterialByName(materials.meter, [
                            'Счетчик э/э Меркурий 234 ART 2 - 00 PR',
                            'Счетчик э/э Меркурий 234 ARTM 2  - 00 PBR.G',
                            'Счетчик э/э Сайман CA4У-Э712 (3*57,7/100V)',
                            'Счетчик э/э Сайман CA4У-Э712'
                          ]);
                          
                          if (!targetMeter) {
                            targetMeter = findMaterialByName(materials.meter, [
                              '234 ART 2',
                              '234 ARTM 2',
                              'CA4У-Э712',
                              'Меркурий',
                              'Сайман'
                            ]);
                          }
                        }
                        
                        const targetTt = findMaterialByName(materials.tt, ['ТОЛ-10 200/5', '200/5']);
                        
                        addCell({
                          purpose: 'Отходящая',
                          cellType: global.bodyType || '',
                          breaker: targetBreaker ? {
                            id: targetBreaker.id.toString(),
                            name: targetBreaker.name,
                            price: Number(targetBreaker.price),
                          } : undefined,
                          rza: targetRza ? {
                            id: targetRza.id.toString(),
                            name: targetRza.name,
                            price: Number(targetRza.price),
                          } : undefined,
                          meterType: targetMeter ? {
                            id: targetMeter.id.toString(),
                            name: targetMeter.name,
                            price: Number(targetMeter.price),
                          } : undefined,
                          transformerCurrent: targetTt ? {
                            id: targetTt.id.toString(),
                            name: targetTt.name,
                            price: Number(targetTt.price),
                          } : undefined,
                          count: 2,
                          totalPrice: 0,
                        });
                      } else {
                        // Если оборудование не выбрано, создаем пустую ячейку
                        addCell({
                          purpose: 'Отходящая',
                          cellType: global.bodyType || '',
                          count: 2,
                          totalPrice: 0,
                        });
                      }
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-[#8eba1e] text-white rounded-lg hover:bg-[#7aa51a] transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Добавить отходящую
                  </button>
                </div>
              )}
            </TogglerWithInput>
          );
        }

        return (
          <TogglerWithInput
            key={type}
            label={`Ячейка: ${type}`}
            toggled={!!openCellMap[type]}
            onToggle={() => handleToggle(type)}
          >
            {openCellMap[type] && (
              <RusnCell
                cell={cellConfigs.find((c) => c.id === openCellMap[type])!}
                materials={filteredMaterials}
                onUpdate={(id, field, value) => {
                  updateCell(id, field, value);
                }}
                onRemove={removeCell}
                groupSlug={selectedGroupSlug}
                selectedGroupName={selectedGroupName}
                selectedCalculationName={calculations.cell[0]?.name || ''}
              />
            )}
          </TogglerWithInput>
        );
      })}

      <RusnSummaryTable
        cells={cellConfigs}
        materials={materials}
        groupSlug={selectedGroupSlug}
        selectedGroupName={selectedGroupName}
        selectedCalculationName={calculations.cell[0]?.name || ''}
      />
    </div>
  );
}
