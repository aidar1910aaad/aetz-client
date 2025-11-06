import { AutoCellConfig } from '../config/autoCellConfigs';

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
    
    if (config.useGlobalBreaker && global.breaker) {
      targetBreaker = materials.breaker.find(breaker => breaker.id.toString() === global.breaker.id.toString());
    }
    
    if (!targetBreaker) {
      targetBreaker = findMaterialByName(materials.breaker, config.materials.breaker);
    }
    
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
    
    if (config.useGlobalRza && global.rza) {
      targetRza = materials.rza.find(rza => rza.id.toString() === global.rza.id.toString());
    }
    
    if (!targetRza) {
      targetRza = findMaterialByName(materials.rza, config.materials.rza);
    }
    
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
    
    if (global.sr) {
      targetSr = materials.sr.find(sr => sr.id.toString() === global.sr.id.toString());
    }
    
    if (!targetSr) {
      targetSr = findMaterialByName(materials.sr, config.materials.sr);
    }
    
    if (targetSr) {
      cellData.sr = {
        id: targetSr.id.toString(),
        name: targetSr.name,
        price: Number(targetSr.price),
      };
    }
  }

  // Добавляем счетчик
  if (config.materials.meter && config.useGlobalMeter) {
    let targetMeter = null;
    
    // Приоритетно используем глобально выбранный счетчик
    if (global.meterType) {
      targetMeter = materials.meter.find(meter => meter.id.toString() === global.meterType.id.toString());
    }
    
    // Если глобальный счетчик не найден, ищем по названию
    if (!targetMeter) {
      targetMeter = findMaterialByName(materials.meter, config.materials.meter);
      
      if (!targetMeter && config.materials.meterFallback) {
        targetMeter = findMaterialByName(materials.meter, config.materials.meterFallback);
      }
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
    const targetTt = findMaterialByName(materials.tt, config.materials.tt);
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
    const targetTv = findMaterialByName(materials.tn, (config.materials as any).transformerVoltage);
    
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
    const targetTp = findMaterialByName(materials.tsn, (config.materials as any).transformerPower);
    
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


