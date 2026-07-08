import { useEffect, useRef } from 'react';
import { useRusnStore } from '@/store/useRusnStore';
import { useTransformerStore } from '@/store/useTransformerStore';
import { useRusnMaterials } from '@/hooks/useRusnMaterials';
import { createCellByConfig } from '@/utils/autoCellUtils';
import { autoCellConfigs } from '@/config/autoCellConfigs';
import { RUSN_CAMERA, RUSN_CELL_PURPOSE } from '@/domain/rusn/rusnConstants';

type UseCellManagerOptions = {
  /** Cell purposes the user intentionally hid — do not auto-create them again */
  hiddenCellPurposes?: Set<string>;
};

// Единый хук для управления ячейками
export const useCellManager = (options: UseCellManagerOptions = {}) => {
  const { hiddenCellPurposes } = options;
  const { cellConfigs, addCell, updateCell, clearAllCells, global } = useRusnStore();
  const { materials, loading: materialsLoading } = useRusnMaterials();
  const prevBodyTypeRef = useRef<string | null>(null);

  // НЕ очищаем ячейки при смене типа камеры - это должно происходить только при смене напряжения
  // useEffect(() => {
  //   if (prevBodyTypeRef.current && prevBodyTypeRef.current !== global.bodyType) {
  //     clearAllCells();
  //   }
  //   prevBodyTypeRef.current = global.bodyType;
  // }, [global.bodyType, clearAllCells]);

  // Автоматическое создание ячеек (только для камер, требующих глобальные материалы)
  useEffect(() => {
    if (!materialsLoading && global.bodyType) {
      // Специальная обработка для 8DJH
      if (global.bodyType === 'Камера 8DJH') {
        console.log('[8DJH] Создаем ячейки для 8DJH');
        
        // Создаем специальные ячейки для 8DJH
        const siemens8DJHCell = cellConfigs.find(cell => cell.purpose === 'Камера Siemens 8DJH');
        const cableJumperCell = cellConfigs.find(cell => cell.purpose === 'Кабельная перемычка');
        const insulationAdapterCell = cellConfigs.find(cell => cell.purpose === 'Изоляционный адаптер');
        
        console.log('[8DJH] Существующие ячейки:', {
          siemens8DJH: !!siemens8DJHCell,
          cableJumper: !!cableJumperCell,
          insulationAdapter: !!insulationAdapterCell
        });
        
        if (!siemens8DJHCell) {
          console.log('[8DJH] Создаем ячейку Siemens 8DJH');
          addCell({
            id: `cell-${Date.now()}-1`,
            purpose: 'Камера Siemens 8DJH',
            cellType: 'Камера 8DJH',
            count: 1,
            siemens8DJH_R: 1,
            siemens8DJH_L: 5,
            totalPrice: 0
          });
        }
        
        if (!cableJumperCell) {
          console.log('[8DJH] Создаем ячейку Кабельная перемычка');
          addCell({
            id: `cell-${Date.now()}-2`,
            purpose: 'Кабельная перемычка',
            cellType: 'Кабельная перемычка 10кВ',
            count: 1,
            totalPrice: 0
          });
        }
        
        if (!insulationAdapterCell) {
          console.log('[8DJH] Создаем ячейку Изоляционный адаптер');
          // Получаем трансформатор для определения типа адаптера
          const selectedTransformer = useTransformerStore.getState().selectedTransformer;
          const adapterType = selectedTransformer?.voltage === '20' 
            ? 'Изоляционный адаптер 20кВ' 
            : 'Изоляционный адаптер 10кВ';
            
          addCell({
            id: `cell-${Date.now()}-3`,
            purpose: 'Изоляционный адаптер',
            cellType: adapterType,
            count: 4,
            totalPrice: 0
          });
        }
        return;
      }
      
      // Специальная обработка для КСО 366
      if (global.bodyType === 'Камера КСО 366') {
        console.log('[КСО 366] Создаем ячейки для КСО 366');
        
        // Создаем ячейки для КСО 366 с определенными количествами
        const inputCell = cellConfigs.find(cell => cell.purpose === 'Ввод');
        const transformerCell = cellConfigs.find(cell => cell.purpose === 'Трансформаторная');
        const outgoingCell = cellConfigs.find(cell => cell.purpose === 'Отходящая');
        const disconnectorCell = cellConfigs.find(cell => cell.purpose === 'Секционный разьединитель');
        
        console.log('[КСО 366] Существующие ячейки:', {
          input: !!inputCell,
          transformer: !!transformerCell,
          outgoing: !!outgoingCell,
          disconnector: !!disconnectorCell
        });
        
        if (!inputCell) {
          console.log('[КСО 366] Создаем ячейку Ввод');
          addCell({
            id: `cell-${Date.now()}-1`,
            purpose: 'Ввод',
            cellType: 'Камера КСО 366',
            count: 2,
            totalPrice: 0
          });
        }
        
        if (!transformerCell) {
          console.log('[КСО 366] Создаем ячейку Трансформаторная');
          addCell({
            id: `cell-${Date.now()}-2`,
            purpose: 'Трансформаторная',
            cellType: 'Камера КСО 366',
            count: 2,
            totalPrice: 0
          });
        }
        
        if (!outgoingCell) {
          console.log('[КСО 366] Создаем ячейку Отходящая');
          addCell({
            id: `cell-${Date.now()}-3`,
            purpose: 'Отходящая',
            cellType: 'Камера КСО 366',
            count: 2,
            totalPrice: 0
          });
        }
        
        if (!disconnectorCell) {
          console.log('[КСО 366] Создаем ячейку Секционный разъединитель');
          addCell({
            id: `cell-${Date.now()}-4`,
            purpose: 'Секционный разьединитель',
            cellType: '', // Пустой тип, чтобы показать селектор
            count: 1,
            totalPrice: 0
          });
        }
        return;
      }
      
      // Для других камер ячейки создаются только по требованию пользователя
      const needsGlobalMaterials = global.bodyType !== 'Камера КСО 366';
      
      if (needsGlobalMaterials) {
        Object.entries(autoCellConfigs).forEach(([cellType, config]) => {
          if (config.createOnDemand) {
            return;
          }

          if (hiddenCellPurposes?.has(cellType)) {
            return;
          }

          const existingCell = cellConfigs.find(cell => cell.purpose === cellType);
          
          if (!existingCell) {
            // Проверяем, нужны ли глобальные материалы для этой ячейки
            const needsBreaker = config.useGlobalBreaker && global.breaker;
            const needsRza = config.useGlobalRza && global.rza;
            const needsMeter = config.useGlobalMeter && global.meterType;
            
            // Создаем ячейку если есть все необходимые глобальные материалы для этой конкретной ячейки
            // Для КСО А12-10 создаем ячейки при наличии breaker и rza, meterType добавляется позже
            const isA17Zssh =
              cellType === RUSN_CELL_PURPOSE.VOLTAGE_TRANSFORMER_ZSSH &&
              global.bodyType === RUSN_CAMERA.KSO_A17_20;

            const hasRequiredMaterials =
              isA17Zssh ||
              ((!config.useGlobalBreaker || global.breaker) &&
                (!config.useGlobalRza || global.rza));
            
            if (hasRequiredMaterials) {
              createCellByConfig(cellType, config, materials, global, addCell);
            }
          }
        });
      }
      // Для КСО 366 ячейки НЕ создаются автоматически - только по кнопке "Добавить"
    }
  }, [materialsLoading, global.breaker, global.rza, global.meterType, global.bodyType, materials, cellConfigs, addCell, hiddenCellPurposes]);

  // Очистка материалов для КСО 366
  useEffect(() => {
    if (global.bodyType === 'Камера КСО 366') {
      // Очищаем материалы для всех ячеек КСО 366
      cellConfigs.forEach(cell => {
        if (hasMaterials(cell)) {
          clearCellMaterials(cell.id);
        }
      });
    }
  }, [global.bodyType, cellConfigs]);

  // Вспомогательные функции
  const hasMaterials = (cell: any) => {
    return !!(cell.breaker || cell.rza || cell.meterType || cell.transformerCurrent || cell.transformerVoltage || cell.transformerPower);
  };

  const clearCellMaterials = (cellId: string) => {
    const fields = ['breaker', 'rza', 'meterType', 'transformerCurrent', 'transformerVoltage', 'transformerPower'];
    fields.forEach(field => {
      updateCell(cellId, field, undefined);
    });
  };

  const findMaterialById = (materialList: any[], id: string) => {
    return materialList.find(material => material.id.toString() === id.toString());
  };

  const findMaterialByName = (materialList: any[], searchTerms: string[]) => {
    return materialList.find(material => 
      searchTerms.some(term => 
        material.name.toLowerCase().includes(term.toLowerCase())
      )
    );
  };

  return {
    cellConfigs,
    addCell,
    updateCell,
    materials,
    global,
    findMaterialById,
    findMaterialByName,
    clearCellMaterials
  };
};
