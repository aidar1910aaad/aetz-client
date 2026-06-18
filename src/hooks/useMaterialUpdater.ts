import { useEffect, useRef } from 'react';
import { useCellManager } from './useCellManager';
import { useTransformerStore } from '@/store/useTransformerStore';

// Хук для автоматического обновления материалов в ячейках
export const useMaterialUpdaterWithManager = (
  manager: ReturnType<typeof useCellManager>
) => {
  const { cellConfigs, updateCell, materials, global, findMaterialById, findMaterialByName } = manager;
  const autoAppliedValuesRef = useRef<Record<string, string | undefined>>({});
  const lastGlobalTargetRef = useRef<Record<string, string | undefined>>({});
  const lastSeenValuesRef = useRef<Record<string, string | undefined>>({});
  const manuallyClearedFieldsRef = useRef<Record<string, boolean>>({});

  const getAutoKey = (cellId: string, field: string) => `${cellId}:${field}`;

  const markAutoValue = (cellId: string, field: string, targetId: string) => {
    const autoKey = getAutoKey(cellId, field);
    autoAppliedValuesRef.current[autoKey] = targetId;
    lastSeenValuesRef.current[autoKey] = targetId;
    manuallyClearedFieldsRef.current[autoKey] = false;
    lastGlobalTargetRef.current[field] = targetId;
  };

  const shouldApplyAutoValue = (
    cellId: string,
    field: string,
    currentId: string | undefined,
    targetId: string
  ) => {
    const autoKey = getAutoKey(cellId, field);
    const previousSeenId = lastSeenValuesRef.current[autoKey];

    if (!currentId && previousSeenId) {
      manuallyClearedFieldsRef.current[autoKey] = true;
    } else if (currentId) {
      manuallyClearedFieldsRef.current[autoKey] = false;
    }

    lastSeenValuesRef.current[autoKey] = currentId;

    if (manuallyClearedFieldsRef.current[autoKey]) {
      return false;
    }

    const previousAutoId = autoAppliedValuesRef.current[autoKey] ?? lastGlobalTargetRef.current[field];

    // Auto-fill empty fields and keep auto-managed fields in sync, but preserve manual overrides.
    return !currentId || currentId === previousAutoId || currentId === targetId;
  };

  // Обновление счетчика в ячейке "Ввод"
  useEffect(() => {
    if (global.bodyType === 'Камера КСО 366' || global.bodyType === 'Камера 8DJH') return;
    if (!global.meterType || !materials.meter.length) return;

    const inputCell = cellConfigs.find(cell => cell.purpose === 'Ввод');
    if (!inputCell) return;

    let targetMeter = findMaterialById(materials.meter, global.meterType.id.toString());
    
    if (!targetMeter) {
      const searchTerms = global.meterType.name.toLowerCase().includes('меркурий') 
        ? ['меркурий', '234 art 2'] 
        : ['сайман'];
      targetMeter = findMaterialByName(materials.meter, searchTerms);
    }

    if (targetMeter && inputCell.meterType?.id !== targetMeter.id.toString() && shouldApplyAutoValue(inputCell.id, 'meterType', inputCell.meterType?.id, targetMeter.id.toString())) {
      updateCell(inputCell.id, 'meterType', {
        id: targetMeter.id.toString(),
        name: targetMeter.name,
        price: Number(targetMeter.price),
      });
      markAutoValue(inputCell.id, 'meterType', targetMeter.id.toString());
    } else if (targetMeter && inputCell.meterType?.id === targetMeter.id.toString()) {
      markAutoValue(inputCell.id, 'meterType', targetMeter.id.toString());
    }
  }, [global.bodyType, global.meterType, materials.meter, cellConfigs, updateCell, findMaterialById, findMaterialByName]);

  // Обновление материалов в ячейке "Секционный выключатель"
  useEffect(() => {
    if (global.bodyType === 'Камера КСО 366' || global.bodyType === 'Камера 8DJH') return;
    if (!global.breaker || !global.rza || !materials.breaker.length || !materials.rza.length) return;

    const sectionCell = cellConfigs.find(cell => cell.purpose === 'Секционный выключатель');
    if (!sectionCell) return;

    // Обновляем выключатель
    let targetBreaker = findMaterialById(materials.breaker, global.breaker.id.toString());
    if (!targetBreaker) {
      targetBreaker = findMaterialByName(materials.breaker, ['av-12 1250a']);
    }

    if (targetBreaker && sectionCell.breaker?.id !== targetBreaker.id.toString() && shouldApplyAutoValue(sectionCell.id, 'breaker', sectionCell.breaker?.id, targetBreaker.id.toString())) {
      updateCell(sectionCell.id, 'breaker', {
        id: targetBreaker.id.toString(),
        name: targetBreaker.name,
        price: Number(targetBreaker.price),
      });
      markAutoValue(sectionCell.id, 'breaker', targetBreaker.id.toString());
    } else if (targetBreaker && sectionCell.breaker?.id === targetBreaker.id.toString()) {
      markAutoValue(sectionCell.id, 'breaker', targetBreaker.id.toString());
    }

    // Обновляем РЗА
    let targetRza = findMaterialById(materials.rza, global.rza.id.toString());
    if (!targetRza) {
      targetRza = findMaterialByName(materials.rza, ['рс 83 а 2.0', 'рзиа по току рс 83 а 2.0']);
    }

    if (targetRza && sectionCell.rza?.id !== targetRza.id.toString() && shouldApplyAutoValue(sectionCell.id, 'rza', sectionCell.rza?.id, targetRza.id.toString())) {
      updateCell(sectionCell.id, 'rza', {
        id: targetRza.id.toString(),
        name: targetRza.name,
        price: Number(targetRza.price),
      });
      markAutoValue(sectionCell.id, 'rza', targetRza.id.toString());
    } else if (targetRza && sectionCell.rza?.id === targetRza.id.toString()) {
      markAutoValue(sectionCell.id, 'rza', targetRza.id.toString());
    }
  }, [global.bodyType, global.breaker, global.rza, materials.breaker, materials.rza, cellConfigs, updateCell, findMaterialById, findMaterialByName]);

  // Обновление материалов в ячейках "Ввод", "Трансформаторная", "Отходящая"
  useEffect(() => {
    if (global.bodyType === 'Камера КСО 366' || global.bodyType === 'Камера 8DJH') return;
    if (!global.breaker || !global.rza || !materials.breaker.length || !materials.rza.length) return;

    const cellTypesToSync = ['Ввод', 'Трансформаторная', 'Отходящая'];
    
    cellTypesToSync.forEach(cellPurpose => {
      const cells =
        cellPurpose === 'Отходящая'
          ? cellConfigs.filter((c) => c.purpose === cellPurpose)
          : cellConfigs.filter((c) => c.purpose === cellPurpose).slice(0, 1);

      cells.forEach((cell) => {
      // Обновляем выключатель
      let targetBreaker = findMaterialById(materials.breaker, global.breaker.id.toString());
      if (!targetBreaker) {
        targetBreaker = findMaterialByName(materials.breaker, ['av-12 1250a']);
      }

      if (targetBreaker && cell.breaker?.id !== targetBreaker.id.toString() && shouldApplyAutoValue(cell.id, 'breaker', cell.breaker?.id, targetBreaker.id.toString())) {
        updateCell(cell.id, 'breaker', {
          id: targetBreaker.id.toString(),
          name: targetBreaker.name,
          price: Number(targetBreaker.price),
        });
        markAutoValue(cell.id, 'breaker', targetBreaker.id.toString());
      } else if (targetBreaker && cell.breaker?.id === targetBreaker.id.toString()) {
        markAutoValue(cell.id, 'breaker', targetBreaker.id.toString());
      }

      // Обновляем РЗА
      let targetRza = findMaterialById(materials.rza, global.rza.id.toString());
      if (!targetRza) {
        targetRza = findMaterialByName(materials.rza, ['рс 83 а 2.0', 'рзиа по току рс 83 а 2.0']);
      }

      if (targetRza && cell.rza?.id !== targetRza.id.toString() && shouldApplyAutoValue(cell.id, 'rza', cell.rza?.id, targetRza.id.toString())) {
        updateCell(cell.id, 'rza', {
          id: targetRza.id.toString(),
          name: targetRza.name,
          price: Number(targetRza.price),
        });
        markAutoValue(cell.id, 'rza', targetRza.id.toString());
      } else if (targetRza && cell.rza?.id === targetRza.id.toString()) {
        markAutoValue(cell.id, 'rza', targetRza.id.toString());
      }

      // Обновляем счетчик (только для ячеек, которые его используют)
      if (global.meterType && materials.meter.length > 0) {
        let targetMeter = findMaterialById(materials.meter, global.meterType.id.toString());
        if (!targetMeter) {
          targetMeter = findMaterialByName(materials.meter, ['меркурий', 'сайман']);
        }

        if (targetMeter && cell.meterType?.id !== targetMeter.id.toString() && shouldApplyAutoValue(cell.id, 'meterType', cell.meterType?.id, targetMeter.id.toString())) {
          updateCell(cell.id, 'meterType', {
            id: targetMeter.id.toString(),
            name: targetMeter.name,
            price: Number(targetMeter.price),
          });
          markAutoValue(cell.id, 'meterType', targetMeter.id.toString());
        } else if (targetMeter && cell.meterType?.id === targetMeter.id.toString()) {
          markAutoValue(cell.id, 'meterType', targetMeter.id.toString());
        }
      }
      });
    });
  }, [global.bodyType, global.breaker, global.rza, global.meterType, materials.breaker, materials.rza, materials.meter, cellConfigs, updateCell, findMaterialById, findMaterialByName]);

  // Обновление материалов для Изоляционный адаптер
  useEffect(() => {
    if (global.bodyType !== 'Камера 8DJH') return;
    
    const insulationAdapterCell = cellConfigs.find(cell => cell.purpose === 'Изоляционный адаптер');
    if (!insulationAdapterCell) return;
    
    // Получаем трансформатор для определения типа адаптера
    const selectedTransformer = useTransformerStore.getState().selectedTransformer;
    const adapterType = selectedTransformer?.voltage === '20' 
      ? 'Изоляционный адаптер 20кВ' 
      : 'Изоляционный адаптер 10кВ';
    
    // Обновляем тип ячейки если он изменился
    if (insulationAdapterCell.cellType !== adapterType) {
      updateCell(insulationAdapterCell.id, 'cellType', adapterType);
    }
  }, [global.bodyType, cellConfigs, updateCell]);

  // Обновление разъединителя в ячейке "Секционный разъединитель"
  useEffect(() => {
    // Для КСО 366 и 8DJH не применяем автоматический выбор разъединителя
    if (global.bodyType === 'Камера КСО 366' || global.bodyType === 'Камера 8DJH') return;
    
    if (!materials.sr?.length) return;

    const disconnectorCell = cellConfigs.find(cell => cell.purpose === 'Секционный разьединитель');
    if (!disconnectorCell) return;

    let targetSr;
    
    // Для камеры КСО А12-10 автоматически выбираем РВЗ - 10/630 - III
    if (global.bodyType === 'Камера КСО А12-10') {
      targetSr = findMaterialByName(materials.sr, ['рвз - 10/630 - iii']);
    } else {
      // Для других камер используем глобальный выбор
      if (!global.sr) return;
      targetSr = findMaterialById(materials.sr, global.sr.id.toString());
      if (!targetSr) {
        targetSr = findMaterialByName(materials.sr, ['рвз - 10/630 - iii']);
      }
    }

    if (targetSr && disconnectorCell.sr?.id !== targetSr.id.toString() && shouldApplyAutoValue(disconnectorCell.id, 'sr', disconnectorCell.sr?.id, targetSr.id.toString())) {
      updateCell(disconnectorCell.id, 'sr', {
        id: targetSr.id.toString(),
        name: targetSr.name,
        price: Number(targetSr.price),
      });
      markAutoValue(disconnectorCell.id, 'sr', targetSr.id.toString());
    } else if (targetSr && disconnectorCell.sr?.id === targetSr.id.toString()) {
      markAutoValue(disconnectorCell.id, 'sr', targetSr.id.toString());
    }
  }, [global.bodyType, global.sr, materials.sr, cellConfigs, updateCell, findMaterialById, findMaterialByName]);
};

export const useMaterialUpdater = () => {
  useMaterialUpdaterWithManager(useCellManager());
};
