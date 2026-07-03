import { AutoCellConfig } from '../config/autoCellConfigs';
import { isRusnCameraWithPerCellMeter } from '@/domain/rusn/rusnConstants';
import { filterMaterialsByCategory } from './rusnMaterials';

// Функция для поиска материала по названию
export const findMaterialByName = (materialList: any[], searchTerms: string[]) => {
  return materialList.find(material => 
    searchTerms.some(term => 
      material.name.toLowerCase().includes(term.toLowerCase())
    )
  );
};

// Функция для создания ячейки по конфигурации
export const createCellByConfig = (
  cellType: string, 
  config: AutoCellConfig, 
  materials: any, 
  global: any, 
  addCell: (cellData: any) => void
) => {
  const cellData: any = {
    purpose: cellType,
    cellType: global.bodyType,
    count: config.count,
    totalPrice: 0,
  };

  // Для камеры "КСО 366" ВСЕ ячейки создаются без материалов
  if (global.bodyType === 'Камера КСО 366') {
    addCell(cellData);
    return;
  }

  // Добавляем выключатель
  if (config.materials.breaker) {
    let targetBreaker = null;
    const breakerPool =
      config.useGlobalBreaker && global.breaker
        ? filterMaterialsByCategory(materials.breaker, global.breaker)
        : materials.breaker;

    targetBreaker = findMaterialByName(breakerPool, config.materials.breaker);
    
    if (targetBreaker) {
      cellData.breaker = {
        id: targetBreaker.id.toString(),
        name: targetBreaker.name,
        price: Number(targetBreaker.price),
      };
    }
  }

  // Добавляем РЗА
  if (config.materials.rza) {
    let targetRza = null;
    const rzaPool =
      config.useGlobalRza && global.rza
        ? filterMaterialsByCategory(materials.rza, global.rza)
        : materials.rza;

    targetRza = findMaterialByName(rzaPool, config.materials.rza);
    
    if (targetRza) {
      cellData.rza = {
        id: targetRza.id.toString(),
        name: targetRza.name,
        price: Number(targetRza.price),
      };
    }
  }

  // Добавляем разъединитель
  if (config.materials.sr) {
    let targetSr = null;
    const srPool = global.sr ? filterMaterialsByCategory(materials.sr, global.sr) : materials.sr;

    targetSr = findMaterialByName(srPool, config.materials.sr);
    
    if (targetSr) {
      cellData.sr = {
        id: targetSr.id.toString(),
        name: targetSr.name,
        price: Number(targetSr.price),
      };
    }
  }

  // Добавляем счетчик
  if (
    config.materials.meter &&
    config.useGlobalMeter &&
    !isRusnCameraWithPerCellMeter(global.bodyType)
  ) {
    let targetMeter = null;
    const meterPool = global.meterType
      ? filterMaterialsByCategory(materials.meter, global.meterType)
      : materials.meter;

    targetMeter = findMaterialByName(meterPool, config.materials.meter);

    if (!targetMeter && config.materials.meterFallback) {
      targetMeter = findMaterialByName(meterPool, config.materials.meterFallback);
    }
    
    if (targetMeter) {
      cellData.meterType = {
        id: targetMeter.id.toString(),
        name: targetMeter.name,
        price: Number(targetMeter.price),
      };
    }
  }

  // Добавляем трансформатор тока
  if (config.materials.tt) {
    const ttPool = global.tt ? filterMaterialsByCategory(materials.tt, global.tt) : materials.tt;
    const targetTt = findMaterialByName(ttPool, config.materials.tt);
    if (targetTt) {
      cellData.transformerCurrent = {
        id: targetTt.id.toString(),
        name: targetTt.name,
        price: Number(targetTt.price),
      };
    }
  }

  // Добавляем трансформатор напряжения
  if ((config.materials as any).transformerVoltage) {
    const tnPool = global.tn
      ? filterMaterialsByCategory(materials.tn, global.tn)
      : materials.tn;
    const targetTv = findMaterialByName(tnPool, (config.materials as any).transformerVoltage);
    
    if (targetTv) {
      cellData.transformerVoltage = {
        id: targetTv.id.toString(),
        name: targetTv.name,
        price: Number(targetTv.price),
      };
    }
  }

  // Добавляем силовой трансформатор (для трансформатора собственных нужд)
  if ((config.materials as any).transformerPower) {
    const tsnPool = global.tsn
      ? filterMaterialsByCategory(materials.tsn, global.tsn)
      : materials.tsn;
    const targetTp = findMaterialByName(tsnPool, (config.materials as any).transformerPower);
    
    if (targetTp) {
      cellData.transformerPower = {
        id: targetTp.id.toString(),
        name: targetTp.name,
        price: Number(targetTp.price),
      };
    }
  }

  addCell(cellData);
};


