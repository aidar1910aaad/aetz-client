import { RunnCell } from '@/store/useRunnStore';
import { calculateCost } from '@/utils/calculationUtils';
import { autoAddFusesToRubilniki } from '@/utils/fuseUtils';
import { Material } from '@/api/material';
import { useEffect, useState } from 'react';
import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { useTransformerStore } from '@/store/useTransformerStore';
import { useRunnMaterials } from '@/hooks/useRunnMaterials';
import { extractCurrentFromRubilnikName, extractCurrentFromBreakerName, findMatchingCurrentTransformer } from '@/utils/panelNameUtils';
import { useMaterialPrices } from '@/hooks/useMaterialPrices';
import { getRpsMaterial, getAutomatonMaterial, getWithdrawableAutomatonMaterial } from '@/config/rpsConfig';

interface OutgoingCalculationProps {
  cell: RunnCell;
  calculation: any;
  fusesPnMaterials?: Material[];
  avtomatLityMaterials?: Material[];
  additionalRpsMaterials?: Material[];
  additionalMoldedCaseMaterials?: Material[];
  additionalRubilnikMaterials?: Material[];
  rpsLeftMaterials?: Material[];
  categoryMaterials?: Material[];
  onCalculationResult?: (cellId: string, type: 'main' | 'meter', price: number) => void;
}

export default function OutgoingCalculation({
  cell,
  calculation,
  fusesPnMaterials = [],
  avtomatLityMaterials = [],
  additionalRpsMaterials = [],
  additionalMoldedCaseMaterials = [],
  additionalRubilnikMaterials = [],
  rpsLeftMaterials = [],
  categoryMaterials = [],
  onCalculationResult,
}: OutgoingCalculationProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { selectedTransformer } = useTransformerStore();
  const { materials: runnMaterials } = useRunnMaterials();
  const { aluminum: aluminumPrice, copper: copperPrice } = useMaterialPrices();
  
  // Получаем материал трансформатора
  const transformerMaterial = selectedTransformer?.busbars || 'Не выбран';
  
  // Проверяем, выбрано ли 6 автоматов для "Литой корпус" или "Литой корпус + Рубильник"
  const isMoldedCase = cell.switchingDevice === 'Литой корпус' || cell.switchingDevice === 'Литой корпус + Рубильник';
  const selectedAutomatonsCount = cell.rubilniki?.filter(r => r && r.trim() !== '').length || 0;
  const hasSixAutomatons = isMoldedCase && selectedAutomatonsCount === 6;
  
  // Определяем, является ли это калькуляцией ПУ
  // Если выбрано 6 автоматов, то калькуляция ПУ не выполняется
  const isMeterCalculation = !hasSixAutomatons && (
    calculation?.name?.toLowerCase().includes('пу') || 
    calculation?.name?.toLowerCase().includes('счетчик') ||
    calculation?.name?.toLowerCase().includes('meter') ||
    (cell.meterType && calculation?.data?.cellConfig?.materials?.counter)
  );

  // Рассчитываем общую стоимость материалов (без добавления выбранных материалов)
  let materialsTotal = 0;
  
  if (calculation?.data?.categories && Array.isArray(calculation.data.categories)) {
    materialsTotal = calculation.data.categories.reduce(
      (sum, category) =>
        sum + (category.items?.reduce((itemSum, item) => itemSum + (item.price || 0) * (item.quantity || 0), 0) || 0),
      0
    );
  }
  

  // Получаем все материалы из калькуляции
  const materials = calculation.data.cellConfig?.materials || {};

  // Для "Литой корпус" добавляем стоимость выбранного автомата к базовой стоимости
  // Для "Литой корпус + Рубильник" автоматы учитываются отдельно в selectedAutomatonsCost
  // НЕ добавляем для ПУ (счетчика)
  if (cell.switchingDevice === 'Литой корпус' && 
      !isMeterCalculation && 
      cell.rubilniki && cell.rubilniki.filter(r => r && r.trim() !== '').length > 0) {
    
    const selectedAutomatons = cell.rubilniki.filter(r => r && r.trim() !== '');
    
    // Ищем цены автоматов в материалах калькуляции (molded_case_breaker)
    const moldedCaseMaterials = (materials as any)?.molded_case_breaker || [];
    
    // Объединяем все источники автоматов: из калькуляции и базовые
    const allAutomatonMaterials = [...moldedCaseMaterials, ...avtomatLityMaterials];
    
    selectedAutomatons.forEach(automatonName => {
      const foundMaterial = allAutomatonMaterials.find((m: any) => m.name === automatonName);
      if (foundMaterial) {
        const price = typeof foundMaterial.price === 'string' ? parseFloat(foundMaterial.price) : foundMaterial.price;
        materialsTotal += (isNaN(price) ? 0 : price);
      }
    });
  }

  // Для "Воздушный" добавляем стоимость выбранного автомата к базовой стоимости
  // НЕ добавляем для ПУ (счетчика)
  if (cell.switchingDevice === 'Воздушный' && 
      !isMeterCalculation && 
      cell.breaker && cell.breaker.trim() !== '') {
    
    // Ищем цену автомата в материалах калькуляции (withdrawable_breaker)
    const withdrawableBreakerMaterials = (materials as any)?.withdrawable_breaker || [];
    const allBreakerMaterials = [...withdrawableBreakerMaterials, ...categoryMaterials];
    
    const foundMaterial = allBreakerMaterials.find((m: any) => m.name === cell.breaker);
    if (foundMaterial) {
      const price = typeof foundMaterial.price === 'string' ? parseFloat(foundMaterial.price) : foundMaterial.price;
      materialsTotal += (isNaN(price) ? 0 : price);
    }
  }
  const materialTypes = Object.keys(materials);
  
  // Рассчитываем общую стоимость выбранных материалов
  let selectedMaterialsTotal = 0;
  const selectedMaterials = [];
  
  materialTypes.forEach(type => {
    if (materials[type]?.length > 0) {
      const material = materials[type][0];
      
      // Для калькуляции ПУ не добавляем никакие материалы в selectedMaterialsTotal
      // так как ПУ учитывается в meterTotal
      if (isMeterCalculation) {
        return;
      }
      
      // Для РПС не добавляем автоматически выбранный материал типа "rps" в общую сумму
      if (cell.switchingDevice === 'РПС' && type === 'rps') {
        return;
      }
      
      // Для "Литой корпус" и "Литой корпус + Рубильник" не добавляем molded_case_breaker и counter
      // так как они рассчитываются отдельно
      if ((cell.switchingDevice === 'Литой корпус' || cell.switchingDevice === 'Литой корпус + Рубильник') && 
          (type === 'molded_case_breaker' || type === 'counter')) {
        return;
      }
      
      // Для "Воздушный" не добавляем withdrawable_breaker, так как он рассчитывается отдельно
      if (cell.switchingDevice === 'Воздушный' && type === 'withdrawable_breaker') {
        return;
      }
      
      selectedMaterialsTotal += material.price;
      selectedMaterials.push({
        type,
        name: material.name,
        price: material.price
      });
    }
  });

  // Для РПС и "Литой корпус + Рубильник" добавляем цены выбранных рубильников
  // НЕ добавляем для ПУ (счетчика)
  let rpsRubilnikiTotal = 0;
  if ((cell.switchingDevice === 'РПС' || cell.switchingDevice === 'Литой корпус + Рубильник') && 
      !isMeterCalculation && 
      cell.rubilniki && cell.rubilniki.filter(r => r && r.trim() !== '').length > 0) {
    // Получаем выбранные рубильники
    const selectedRubilniki = cell.rubilniki.filter(r => r && r.trim() !== '');
    
    // Ищем цены рубильников в материалах калькуляции, дополнительных материалах и базовых материалах
    const rpsMaterials = (materials as any)?.rps || [];
    const allRpsMaterials = [...rpsMaterials, ...additionalRpsMaterials, ...rpsLeftMaterials];
    
    selectedRubilniki.forEach(rubilnikName => {
      const foundMaterial = allRpsMaterials.find((m: any) => m.name === rubilnikName);
      if (foundMaterial) {
        const price = typeof foundMaterial.price === 'string' ? parseFloat(foundMaterial.price) : foundMaterial.price;
        rpsRubilnikiTotal += (isNaN(price) ? 0 : price);
      }
    });
    
  }

  // Для РПС и "Литой корпус + Рубильник" добавляем стоимость автоматически добавленных предохранителей ПН
  // НЕ добавляем для ПУ (счетчика)
  let fusesPnTotal = 0;
  if ((cell.switchingDevice === 'РПС' || cell.switchingDevice === 'Литой корпус + Рубильник') && 
      !isMeterCalculation && 
      cell.rubilniki && cell.rubilniki.filter(r => r && r.trim() !== '').length > 0 && fusesPnMaterials.length > 0) {
    const selectedRubilniki = cell.rubilniki.filter(r => r && r.trim() !== '');
    const autoAddedFuses = autoAddFusesToRubilniki(selectedRubilniki, fusesPnMaterials);
    
    fusesPnTotal = autoAddedFuses.reduce((sum, fuse) => {
      const price = typeof fuse.price === 'string' ? parseFloat(fuse.price) : fuse.price;
      return sum + (isNaN(price) ? 0 : price);
    }, 0);

  }

  // Для "Литой корпус" и "Литой корпус + Рубильник" автоматы уже добавлены к materialsTotal
  let moldedCaseAutomatonsTotal = 0;
  
  // Рассчитываем стоимость выбранных автоматов для отображения
  // НЕ добавляем для ПУ (счетчика)
  let selectedAutomatonsCost = 0;
  if ((cell.switchingDevice === 'Литой корпус' || cell.switchingDevice === 'Литой корпус + Рубильник') && 
      !isMeterCalculation && 
      cell.rubilniki && cell.rubilniki.filter(r => r && r.trim() !== '').length > 0) {
    
    const selectedAutomatons = cell.rubilniki.filter(r => r && r.trim() !== '');
    const moldedCaseMaterials = (materials as any)?.molded_case_breaker || [];
    
    // Объединяем все источники автоматов: из калькуляции, базовые и дополнительные
    const allAutomatonMaterials = [...moldedCaseMaterials, ...avtomatLityMaterials, ...additionalMoldedCaseMaterials];
    
    selectedAutomatons.forEach(automatonName => {
      const foundMaterial = allAutomatonMaterials.find((m: any) => m.name === automatonName);
      if (foundMaterial) {
        const price = typeof foundMaterial.price === 'string' ? parseFloat(foundMaterial.price) : foundMaterial.price;
        selectedAutomatonsCost += (isNaN(price) ? 0 : price);
      }
    });
  }

  // Рассчитываем стоимость воздушного автомата для отображения
  let airBreakerCost = 0;
  if (cell.switchingDevice === 'Воздушный' && cell.breaker && cell.breaker.trim() !== '') {
    const withdrawableBreakerMaterials = (materials as any)?.withdrawable_breaker || [];
    const allBreakerMaterials = [...withdrawableBreakerMaterials, ...categoryMaterials];
    const foundMaterial = allBreakerMaterials.find((m: any) => m.name === cell.breaker);
    if (foundMaterial) {
      const price = typeof foundMaterial.price === 'string' ? parseFloat(foundMaterial.price) : foundMaterial.price;
      airBreakerCost = (isNaN(price) ? 0 : price);
    }
  }

  // Рассчитываем стоимость расходных материалов (алюминий/медь) для выкатного автомата
  // Режим "Воздушный"
  // НЕ добавляем для ПУ (счетчика)
  let withdrawableAutomatonMaterialConsumptionTotal = 0;
  const withdrawableAutomatonMaterialConsumptionList: Array<{ material: string; current: number; consumption: number; pricePerKg: number; total: number }> = [];
  
  if (cell.switchingDevice === 'Воздушный' && 
      !isMeterCalculation && 
      cell.breaker && 
      cell.breaker.trim() !== '' &&
      transformerMaterial && 
      (transformerMaterial === 'Алюминий' || transformerMaterial === 'Медь')) {
    
    const materialType = transformerMaterial as 'Алюминий' | 'Медь';
    const pricePerKg = materialType === 'Алюминий' ? aluminumPrice : copperPrice;
    
    // Извлекаем ток из названия выкатного автомата
    const current = extractCurrentFromBreakerName(cell.breaker);
    if (current) {
      const materialConsumption = getWithdrawableAutomatonMaterial(current, materialType);
      if (materialConsumption > 0) {
        // Для воздушного автомата всегда 1 шт
        const totalCost = materialConsumption * pricePerKg;
        withdrawableAutomatonMaterialConsumptionTotal = totalCost;
        
        withdrawableAutomatonMaterialConsumptionList.push({
          material: materialType,
          current: current,
          consumption: materialConsumption,
          pricePerKg: pricePerKg,
          total: totalCost
        });
      }
    }
  }

  // Для "Литой корпус" и "Литой корпус + Рубильник" добавляем стоимость ПУ
  // Для калькуляции ПУ используем стоимость выбранного пользователем материала
  // Если выбрано 6 автоматов, ПУ не рассчитывается
  let meterTotal = 0;
  if (cell.meterType && !hasSixAutomatons) {
    if (isMeterCalculation) {
      // Для калькуляции ПУ ищем цену в переданных материалах
      // Сначала ищем в categoryMaterials, затем в материалах калькуляции
      let foundMeter = categoryMaterials.find((m: any) => m.name === cell.meterType);
      
      if (!foundMeter) {
        // Если не найден в categoryMaterials, ищем в материалах калькуляции
        const meterMaterialsFromCalc = (materials as any)?.counter || [];
        foundMeter = meterMaterialsFromCalc.find((m: any) => m.name === cell.meterType);
      }
      
      if (foundMeter) {
        const basePrice = typeof foundMeter.price === 'string' ? parseFloat(foundMeter.price) : foundMeter.price;
        
        // Для РПС, Литой корпус и Литой корпус + Рубильник умножаем ПУ на количество выбранных рубильников
        if ((cell.switchingDevice === 'РПС' || cell.switchingDevice === 'Литой корпус' || cell.switchingDevice === 'Литой корпус + Рубильник') 
            && cell.rubilniki && cell.rubilniki.length > 0) {
          const selectedRubilnikiCount = cell.rubilniki.filter(r => r && r.trim() !== '').length;
          meterTotal = basePrice * selectedRubilnikiCount;
        } else {
          meterTotal = basePrice;
        }
      }
    } else if (cell.switchingDevice === 'Литой корпус' || cell.switchingDevice === 'Литой корпус + Рубильник') {
      // Для обычных калькуляций ищем цену в материалах калькуляции
      const meterMaterialsFromCalc = (materials as any)?.counter || [];
      const foundMeter = meterMaterialsFromCalc.find((m: any) => m.name === cell.meterType);
      
      if (foundMeter) {
        const basePrice = foundMeter.price;
        
        // Для Литой корпус и Литой корпус + Рубильник умножаем ПУ на количество выбранных рубильников
        if (cell.rubilniki && cell.rubilniki.length > 0) {
          const selectedRubilnikiCount = cell.rubilniki.filter(r => r && r.trim() !== '').length;
          meterTotal = basePrice * selectedRubilnikiCount;
        } else {
          meterTotal = basePrice;
        }
      }
    }
  }

  // Добавляем стоимость разъединителей (rubilnik) из дополнительной калькуляции
  let rubilnikTotal = 0;
  
  if (additionalRubilnikMaterials.length > 0) {
    rubilnikTotal = additionalRubilnikMaterials.reduce((sum: number, item: any) => {
      const price = typeof item.price === 'string' ? parseFloat(item.price) : item.price;
      return sum + (isNaN(price) ? 0 : price);
    }, 0);
  }

  // Рассчитываем стоимость расходных материалов (алюминий/медь) для РПС
  // НЕ добавляем для ПУ (счетчика)
  let rpsMaterialConsumptionTotal = 0;
  const rpsMaterialConsumptionList: Array<{ material: string; current: number | string; consumption: number; pricePerKg: number; total: number }> = [];
  
  if (cell.switchingDevice === 'РПС' && 
      !isMeterCalculation && 
      cell.rubilniki && 
      cell.rubilniki.filter(r => r && r.trim() !== '').length > 0 &&
      transformerMaterial && 
      (transformerMaterial === 'Алюминий' || transformerMaterial === 'Медь')) {
    
    const selectedRubilniki = cell.rubilniki.filter(r => r && r.trim() !== '');
    const materialType = transformerMaterial as 'Алюминий' | 'Медь';
    const pricePerKg = materialType === 'Алюминий' ? aluminumPrice : copperPrice;
    
    // Группируем рубильники по току и считаем количество каждого типа
    const rubilnikiByCurrent = new Map<number, number>();
    
    selectedRubilniki.forEach(rubilnikName => {
      const current = extractCurrentFromRubilnikName(rubilnikName);
      if (current) {
        rubilnikiByCurrent.set(current, (rubilnikiByCurrent.get(current) || 0) + 1);
      }
    });
    
    // Для каждого уникального тока находим расход материала и рассчитываем стоимость
    rubilnikiByCurrent.forEach((rubilnikiCount, current) => {
      const materialConsumption = getRpsMaterial(current, materialType);
      if (materialConsumption > 0) {
        // Расход материала на каждый рубильник
        const totalConsumption = materialConsumption * rubilnikiCount;
        const totalCost = totalConsumption * pricePerKg;
        rpsMaterialConsumptionTotal += totalCost;
        
        rpsMaterialConsumptionList.push({
          material: materialType,
          current: current,
          consumption: materialConsumption,
          pricePerKg: pricePerKg,
          total: totalCost
        });
      }
    });
  }

  // Рассчитываем стоимость расходных материалов (алюминий/медь) для автоматов
  // Литой корпус и Литой корпус + Рубильник
  // НЕ добавляем для ПУ (счетчика)
  let automatonMaterialConsumptionTotal = 0;
  const automatonMaterialConsumptionList: Array<{ material: string; current: number | string; consumption: number; pricePerKg: number; total: number }> = [];
  
  if ((cell.switchingDevice === 'Литой корпус' || cell.switchingDevice === 'Литой корпус + Рубильник') && 
      !isMeterCalculation && 
      cell.rubilniki && 
      cell.rubilniki.filter(r => r && r.trim() !== '').length > 0 &&
      transformerMaterial && 
      (transformerMaterial === 'Алюминий' || transformerMaterial === 'Медь')) {
    
    const selectedAutomatons = cell.rubilniki.filter(r => r && r.trim() !== '');
    const materialType = transformerMaterial as 'Алюминий' | 'Медь';
    const pricePerKg = materialType === 'Алюминий' ? aluminumPrice : copperPrice;
    
    // Группируем автоматы по току и считаем количество каждого типа
    const automatonsByCurrent = new Map<number | string, number>();
    
    selectedAutomatons.forEach(automatonName => {
      const current = extractCurrentFromBreakerName(automatonName);
      if (current) {
        // Для токов до 400 используем строку 'до 400', для остальных - число
        const currentKey = current <= 400 ? 'до 400' : current;
        automatonsByCurrent.set(currentKey, (automatonsByCurrent.get(currentKey) || 0) + 1);
      }
    });
    
    // Для каждого уникального тока находим расход материала и рассчитываем стоимость
    automatonsByCurrent.forEach((automatonsCount, current) => {
      const materialConsumption = getAutomatonMaterial(current, materialType);
      if (materialConsumption > 0) {
        // Расход материала на каждый автомат
        const totalConsumption = materialConsumption * automatonsCount;
        const totalCost = totalConsumption * pricePerKg;
        automatonMaterialConsumptionTotal += totalCost;
        
        automatonMaterialConsumptionList.push({
          material: materialType,
          current: current,
          consumption: materialConsumption,
          pricePerKg: pricePerKg,
          total: totalCost
        });
      }
    });
  }

  // Добавляем стоимость трансформаторов тока (по 3 шт для каждого рубильника/автомата)
  // НЕ добавляем для ПУ (счетчика)
  let currentTransformersTotal = 0;
  const currentTransformersList: Array<{ name: string; current: number; quantity: number; price: number }> = [];
  
  // Для РПС - трансформаторы для рубильников
  if (cell.switchingDevice === 'РПС' && 
      !isMeterCalculation && 
      cell.rubilniki && 
      cell.rubilniki.filter(r => r && r.trim() !== '').length > 0 &&
      runnMaterials.currentTransformer.length > 0) {
    
    const selectedRubilniki = cell.rubilniki.filter(r => r && r.trim() !== '');
    
    // Группируем рубильники по току и считаем количество каждого типа
    const rubilnikiByCurrent = new Map<number, number>();
    
    selectedRubilniki.forEach(rubilnikName => {
      const current = extractCurrentFromRubilnikName(rubilnikName);
      if (current) {
        rubilnikiByCurrent.set(current, (rubilnikiByCurrent.get(current) || 0) + 1);
      }
    });
    
    // Для каждого уникального тока находим трансформатор и добавляем по 3 шт на каждый рубильник
    rubilnikiByCurrent.forEach((rubilnikiCount, current) => {
      const matchingTransformer = findMatchingCurrentTransformer(current, runnMaterials.currentTransformer);
      if (matchingTransformer) {
        const transformerPrice = typeof matchingTransformer.price === 'string' 
          ? parseFloat(matchingTransformer.price) 
          : matchingTransformer.price;
        const transformerQuantity = rubilnikiCount * 3; // По 3 шт на каждый рубильник
        const transformerTotal = transformerPrice * transformerQuantity;
        currentTransformersTotal += transformerTotal;
        
        currentTransformersList.push({
          name: matchingTransformer.name,
          current: current,
          quantity: transformerQuantity,
          price: transformerPrice
        });
      }
    });
  }
  
  // Для "Литой корпус" и "Литой корпус + Рубильник" - трансформаторы для автоматов
  if ((cell.switchingDevice === 'Литой корпус' || cell.switchingDevice === 'Литой корпус + Рубильник') && 
      !isMeterCalculation && 
      cell.rubilniki && 
      cell.rubilniki.filter(r => r && r.trim() !== '').length > 0 &&
      runnMaterials.currentTransformer.length > 0) {
    
    const selectedAutomatons = cell.rubilniki.filter(r => r && r.trim() !== '');
    
    // Группируем автоматы по току и считаем количество каждого типа
    const automatonsByCurrent = new Map<number, number>();
    
    selectedAutomatons.forEach(automatonName => {
      const current = extractCurrentFromBreakerName(automatonName);
      if (current) {
        automatonsByCurrent.set(current, (automatonsByCurrent.get(current) || 0) + 1);
      }
    });
    
    // Для каждого уникального тока находим трансформатор и добавляем по 3 шт на каждый автомат
    automatonsByCurrent.forEach((automatonsCount, current) => {
      const matchingTransformer = findMatchingCurrentTransformer(current, runnMaterials.currentTransformer);
      if (matchingTransformer) {
        const transformerPrice = typeof matchingTransformer.price === 'string' 
          ? parseFloat(matchingTransformer.price) 
          : matchingTransformer.price;
        const transformerQuantity = automatonsCount * 3; // По 3 шт на каждый автомат
        const transformerTotal = transformerPrice * transformerQuantity;
        currentTransformersTotal += transformerTotal;
        
        currentTransformersList.push({
          name: matchingTransformer.name,
          current: current,
          quantity: transformerQuantity,
          price: transformerPrice
        });
      }
    });
  }
  
  // Для "Воздушный" - трансформаторы для выкатного автомата
  if (cell.switchingDevice === 'Воздушный' && 
      !isMeterCalculation && 
      cell.breaker && 
      cell.breaker.trim() !== '' &&
      runnMaterials.currentTransformer.length > 0) {
    
    // Извлекаем ток из названия выкатного автомата
    const current = extractCurrentFromBreakerName(cell.breaker);
    if (current) {
      const matchingTransformer = findMatchingCurrentTransformer(current, runnMaterials.currentTransformer);
      if (matchingTransformer) {
        const transformerPrice = typeof matchingTransformer.price === 'string' 
          ? parseFloat(matchingTransformer.price) 
          : matchingTransformer.price;
        const transformerQuantity = 3; // По 3 шт на один выкатной автомат
        const transformerTotal = transformerPrice * transformerQuantity;
        currentTransformersTotal += transformerTotal;
        
        currentTransformersList.push({
          name: matchingTransformer.name,
          current: current,
          quantity: transformerQuantity,
          price: transformerPrice
        });
      }
    }
  }

  // Используем утилиту для расчета
  // Для калькуляции ПУ дополнительные материалы всегда 0
  // Для "Воздушный" выкатной автомат уже включен в materialsTotal, добавляем трансформаторы тока + расходные материалы (алюминий/медь)
  // Для "Литой корпус" автоматы уже включены в materialsTotal, добавляем трансформаторы тока + расходные материалы (алюминий/медь)
  // Для "Литой корпус + Рубильник" используем selectedAutomatonsCost + трансформаторы тока + расходные материалы (алюминий/медь)
  // Для "РПС" используем rpsRubilnikiTotal + трансформаторы тока + расходные материалы (алюминий/медь)
  const additionalMaterialsCost = isMeterCalculation 
    ? 0 // Для калькуляции ПУ дополнительные материалы всегда 0
    : cell.switchingDevice === 'Воздушный'
    ? currentTransformersTotal + withdrawableAutomatonMaterialConsumptionTotal // Выкатной автомат уже включен в materialsTotal, добавляем трансформаторы тока + расходные материалы
    : cell.switchingDevice === 'Литой корпус + Рубильник' 
    ? selectedAutomatonsCost + currentTransformersTotal + automatonMaterialConsumptionTotal
    : cell.switchingDevice === 'Литой корпус'
    ? currentTransformersTotal + automatonMaterialConsumptionTotal // Автоматы уже включены в materialsTotal, добавляем трансформаторы тока + расходные материалы
    : cell.switchingDevice === 'РПС'
    ? rpsRubilnikiTotal + currentTransformersTotal + rpsMaterialConsumptionTotal
    : rpsRubilnikiTotal;
    
  const calculationResult = calculateCost(
    materialsTotal,
    calculation.data.calculation,
    selectedMaterialsTotal + additionalMaterialsCost + fusesPnTotal + meterTotal + rubilnikTotal
  );

  // Определяем тип коммутационного аппарата
  const getSwitchingDeviceLabel = (device: string) => {
    switch (device) {
      case 'Воздушный':
        return 'Автомат воздушный';
      case 'Литой корпус':
        return 'Автомат литой корпус';
      case 'Литой корпус + Рубильник':
        return 'Литой корпус + Рубильник';
      case 'РПС':
        return 'РПС (Рубильник-предохранитель)';
      default:
        return device;
    }
  };

  // Передаем результат калькуляции в родительский компонент
  useEffect(() => {
    if (onCalculationResult && calculationResult && calculationResult.finalPrice) {
      const finalPrice = calculationResult.finalPrice;
      onCalculationResult(cell.id, isMeterCalculation ? 'meter' : 'main', finalPrice);
    }
  }, [onCalculationResult, cell.id, isMeterCalculation, calculationResult?.finalPrice]);

  // Все условные return должны быть ПОСЛЕ всех хуков
  
  // Если выбрано 6 автоматов для "Литой корпус" или "Литой корпус + Рубильник" и это калькуляция ПУ, не показываем калькуляцию
  if (hasSixAutomatons && calculation?.name?.toLowerCase().includes('пу')) {
    return null;
  }

  // Проверяем, что результат расчета существует
  if (!calculationResult) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-3">
        <p className="text-xs text-red-600">Ошибка расчета калькуляции</p>
      </div>
    );
  }

  return (
    <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 mt-3">
      <div 
        className="flex items-center justify-between mb-2 cursor-pointer hover:bg-indigo-100 -m-1 p-1 rounded transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-2">
          {isExpanded ? (
            <ChevronDownIcon className="w-4 h-4 text-indigo-600" />
          ) : (
            <ChevronRightIcon className="w-4 h-4 text-indigo-600" />
          )}
          <h4 className="text-xs font-medium text-indigo-900">Калькуляция отходящей ячейки</h4>
        </div>
        <div className="text-xs text-indigo-700 font-medium">
          {(calculationResult.finalPrice || 0).toLocaleString()} ₸
        </div>
      </div>
      
      {!isExpanded && (
        <div className="text-xs text-indigo-600 mt-2">
          Нажмите для просмотра деталей
        </div>
      )}
      
      {isExpanded && (
        <>
      
      {/* Отладочная информация о ценах */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mb-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
          <div className="text-yellow-700">
            <div>Расчетная цена: {(calculationResult.finalPrice || 0).toLocaleString()} ₸</div>
            <div>Цена из API: {(calculation.data.finalPrice || calculation.data.totalPrice || 0).toLocaleString()} ₸</div>
            <div>Разница: {Math.abs((calculationResult.finalPrice || 0) - (calculation.data.finalPrice || calculation.data.totalPrice || 0)).toLocaleString()} ₸</div>
            <div>materialsTotal: {materialsTotal.toLocaleString()} ₸</div>
            <div>selectedMaterialsTotal: {selectedMaterialsTotal.toLocaleString()} ₸</div>
            <div>additionalMaterialsCost: {additionalMaterialsCost.toLocaleString()} ₸</div>
            <div>fusesPnTotal: {fusesPnTotal.toLocaleString()} ₸</div>
            <div>meterTotal: {meterTotal.toLocaleString()} ₸</div>
            <div>selectedAutomatonsCost: {selectedAutomatonsCost.toLocaleString()} ₸</div>
            <div>rubilnikTotal: {rubilnikTotal.toLocaleString()} ₸</div>
            <div>rpsMaterialConsumptionTotal: {rpsMaterialConsumptionTotal.toLocaleString()} ₸</div>
            {rpsMaterialConsumptionList.length > 0 && (
              <>
                {rpsMaterialConsumptionList.map((item, idx) => (
                  <div key={idx}>
                    Расход {item.material} для РПС {item.current}А: {item.consumption}кг × {item.pricePerKg.toLocaleString()}₸/кг = {item.total.toLocaleString()}₸
                  </div>
                ))}
              </>
            )}
            <div>automatonMaterialConsumptionTotal: {automatonMaterialConsumptionTotal.toLocaleString()} ₸</div>
            {automatonMaterialConsumptionList.length > 0 && (
              <>
                {automatonMaterialConsumptionList.map((item, idx) => (
                  <div key={idx}>
                    Расход {item.material} для автомата {typeof item.current === 'string' ? item.current : `${item.current}А`}: {item.consumption}кг × {item.pricePerKg.toLocaleString()}₸/кг = {item.total.toLocaleString()}₸
                  </div>
                ))}
              </>
            )}
            <div>withdrawableAutomatonMaterialConsumptionTotal: {withdrawableAutomatonMaterialConsumptionTotal.toLocaleString()} ₸</div>
            {withdrawableAutomatonMaterialConsumptionList.length > 0 && (
              <>
                {withdrawableAutomatonMaterialConsumptionList.map((item, idx) => (
                  <div key={idx}>
                    Расход {item.material} для выкатного автомата {item.current}А: {item.consumption}кг × {item.pricePerKg.toLocaleString()}₸/кг = {item.total.toLocaleString()}₸
                  </div>
                ))}
              </>
            )}
            <div>isMeterCalculation: {isMeterCalculation ? 'Да' : 'Нет'}</div>
            <div>calculation.name: {calculation?.name}</div>
            <div>cell.meterType: {cell.meterType}</div>
            <div>cell.switchingDevice: {cell.switchingDevice}</div>
            <div>calculation.data.categories: {calculation?.data?.categories?.length || 0} категорий</div>
            {calculation?.data?.categories?.map((cat: any, idx: number) => (
              <div key={idx}>Категория {idx}: {cat.name} - {cat.items?.reduce((sum: number, item: any) => sum + (item.price || 0) * (item.quantity || 0), 0) || 0} ₸</div>
            ))}
          </div>
        </div>
      )}
      
      {/* Информация о ячейке */}
      <div className="mb-3 p-2 bg-indigo-50 border border-indigo-200 rounded text-xs">
        <div className="text-indigo-700">
          {/* Показываем материал трансформатора */}
          <div className="flex justify-between mb-2 pb-2 border-b border-indigo-200">
            <span>Материал трансформатора:</span>
            <span className="font-medium">{transformerMaterial}</span>
          </div>
          
          {isMeterCalculation ? (
            // Для калькуляции ПУ показываем только информацию о ПУ
            <>
              <div className="flex justify-between">
                <span>Тип ячейки:</span>
                <span className="font-medium">ПУ (счетчик)</span>
              </div>
              {cell.meterType && (
                <div className="flex justify-between mt-1">
                  <span>ПУ:</span>
                  <span className="font-medium">{cell.meterType}</span>
                </div>
              )}
            </>
          ) : (
            // Для обычных калькуляций показываем полную информацию
            <>
              <div className="flex justify-between">
                <span>Тип ячейки:</span>
                <span className="font-medium">{cell.purpose}</span>
              </div>
              {cell.switchingDevice && (
                <div className="flex justify-between mt-1">
                  <span>Коммутационный аппарат:</span>
                  <span className="font-medium">{getSwitchingDeviceLabel(cell.switchingDevice)}</span>
                </div>
              )}
              {cell.breaker && (
                <div className="flex justify-between mt-1">
                  <span>Автомат:</span>
                  <span className="font-medium">{cell.breaker}</span>
                </div>
              )}
              {cell.meterType && (
                <div className="flex justify-between mt-1">
                  <span>ПУ:</span>
                  <span className="font-medium">{cell.meterType}</span>
                </div>
              )}
              {/* Показываем выбранные рубильники для РПС и "Литой корпус + Рубильник" */}
              {(cell.switchingDevice === 'РПС' || cell.switchingDevice === 'Литой корпус + Рубильник') && 
               cell.rubilniki && cell.rubilniki.filter(r => r && r.trim() !== '').length > 0 && (
                <div className="flex justify-between mt-1">
                  <span>Рубильники:</span>
                  <span className="text-xs text-gray-500">
                    {cell.rubilniki.filter(r => r && r.trim() !== '').length} шт.
                  </span>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      
      {/* Детализация стоимости */}
      <div className="space-y-1 text-xs">
        {isMeterCalculation ? (
          // Для калькуляции ПУ показываем только базовую стоимость и ПУ
          <>
            <div className="flex justify-between">
              <span className="text-gray-600">Базовая стоимость:</span>
              <span className="text-gray-700">{materialsTotal.toLocaleString()} ₸</span>
            </div>
            {meterTotal > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">ПУ:</span>
                <span className="text-gray-700">{meterTotal.toLocaleString()} ₸</span>
              </div>
            )}
          </>
        ) : (cell.switchingDevice === 'Литой корпус' || cell.switchingDevice === 'Литой корпус + Рубильник') ? (
          <>
            <div className="flex justify-between">
              <span className="text-gray-600">Базовая стоимость:</span>
              <span className="text-gray-700">
                {cell.switchingDevice === 'Литой корпус + Рубильник' 
                  ? materialsTotal.toLocaleString() 
                  : (materialsTotal - selectedAutomatonsCost).toLocaleString()
                } ₸
              </span>
            </div>
            {selectedAutomatonsCost > 0 && (() => {
              const selectedAutomatons = cell.rubilniki.filter(r => r && r.trim() !== '');
              const moldedCaseMaterials = (materials as any)?.molded_case_breaker || [];
              
              // Для "Литой корпус" ищем во всех источниках, для "Литой корпус + Рубильник" только в калькуляции
              const allAutomatonMaterials = cell.switchingDevice === 'Литой корпус' 
                ? [...moldedCaseMaterials, ...avtomatLityMaterials]
                : moldedCaseMaterials;
              
              return selectedAutomatons.map((automatonName, index) => {
                const foundMaterial = allAutomatonMaterials.find((m: any) => m.name === automatonName);
                if (foundMaterial) {
                  const price = typeof foundMaterial.price === 'string' ? parseFloat(foundMaterial.price) : foundMaterial.price;
                  return (
                    <div key={index} className="flex justify-between">
                      <span className="text-gray-600">Автомат {index + 1}:</span>
                      <span className="text-gray-700">{automatonName} - {(isNaN(price) ? 0 : price).toLocaleString()} ₸</span>
                    </div>
                  );
                }
                return null;
              }).filter(Boolean);
            })()}
          </>
        ) : cell.switchingDevice === 'Воздушный' && airBreakerCost > 0 ? (
          <>
            <div className="flex justify-between">
              <span className="text-gray-600">Базовая стоимость:</span>
              <span className="text-gray-700">{(materialsTotal - airBreakerCost).toLocaleString()} ₸</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Воздушный автомат:</span>
              <span className="text-gray-700">{cell.breaker} - {airBreakerCost.toLocaleString()} ₸</span>
            </div>
          </>
        ) : (
          <div className="flex justify-between">
            <span className="text-gray-600">Базовая стоимость:</span>
            <span className="text-gray-700">{materialsTotal.toLocaleString()} ₸</span>
          </div>
        )}
        
        {/* Показываем каждый выбранный материал */}
        {selectedMaterials.map((material, index) => {
          // Для РПС не показываем автоматически выбранный материал типа "rps"
          if (cell.switchingDevice === 'РПС' && material.type === 'rps') {
            return null;
          }
          
          return (
            <div key={index} className="flex justify-between">
              <span className="text-gray-600">
                {material.type === 'withdrawable_breaker' ? 'Автомат выкатной' : 
                 material.type === 'counter' ? 'ПУ' : 
                 material.type === 'molded_case' ? 'Автомат литой корпус' :
                 material.type === 'disconnector' ? 'Разъединитель' :
                 material.type === 'fuse' ? 'Предохранитель' :
                 material.type}:
              </span>
              <span className="text-gray-700">{material.price.toLocaleString()} ₸</span>
            </div>
          );
        })}
        
        {/* Показываем выбранные рубильники для РПС и "Литой корпус + Рубильник" как дополнительные материалы */}
        {/* НЕ показываем для ПУ (счетчика) */}
        {(cell.switchingDevice === 'РПС' || cell.switchingDevice === 'Литой корпус + Рубильник') && 
         !isMeterCalculation && 
         cell.rubilniki && cell.rubilniki.filter(r => r && r.trim() !== '').length > 0 && (
          <>
            {/* Отладочная информация для рубильников и предохранителей */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mb-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs">
                <div className="text-blue-700">
                  <div>Отладка рубильников:</div>
                  <div>Выбранные: {cell.rubilniki.filter(r => r && r.trim() !== '').join(', ')}</div>
                  <div>Доступные в калькуляции: {(materials as any)?.rps?.map((m: any) => m.name).join(', ') || 'Нет'}</div>
                  <div>Доступные РПС материалы: {fusesPnMaterials.length} шт</div>
                  <div>Стоимость рубильников: {(cell.switchingDevice === 'РПС' ? rpsRubilnikiTotal : selectedAutomatonsCost).toLocaleString()} ₸</div>
                  <div>Доступные предохранители ПН: {fusesPnMaterials.length} шт</div>
                  <div>Стоимость предохранителей ПН: {fusesPnTotal.toLocaleString()} ₸</div>
                </div>
              </div>
            )}
            
            {/* Показываем все выбранные рубильники с ценами */}
            {cell.rubilniki.filter(r => r && r.trim() !== '').map((rubilnik, index) => {
              let price = 0;
              
              if (cell.switchingDevice === 'РПС') {
                // Для РПС ищем в материалах РПС
                const rpsMaterials = (materials as any)?.rps || [];
                const allRpsMaterials = [...rpsMaterials, ...additionalRpsMaterials, ...rpsLeftMaterials];
                const foundMaterial = allRpsMaterials.find((m: any) => m.name === rubilnik);
                price = foundMaterial ? (typeof foundMaterial.price === 'string' ? parseFloat(foundMaterial.price) : foundMaterial.price) : 0;
              } else if (cell.switchingDevice === 'Литой корпус + Рубильник') {
                // Для Литой корпус + Рубильник ищем в материалах автоматов
                const moldedCaseMaterials = (materials as any)?.molded_case_breaker || [];
                const allAutomatonMaterials = [...moldedCaseMaterials, ...avtomatLityMaterials, ...additionalMoldedCaseMaterials];
                const foundMaterial = allAutomatonMaterials.find((m: any) => m.name === rubilnik);
                price = foundMaterial ? (typeof foundMaterial.price === 'string' ? parseFloat(foundMaterial.price) : foundMaterial.price) : 0;
              }
              
              
              return (
                <div key={`rubilnik-${index}`} className="flex justify-between">
                  <span className="text-gray-600">Рубильник {index + 1}:</span>
                  <span className="text-gray-700">{rubilnik} - {price.toLocaleString()} ₸</span>
                </div>
              );
            })}
            
            {/* Показываем автоматически добавленные предохранители ПН */}
            {fusesPnMaterials && fusesPnMaterials.length > 0 && (
              <>
                {(() => {
                  const selectedRubilniki = cell.rubilniki.filter(r => r && r.trim() !== '');
                  const autoAddedFuses = autoAddFusesToRubilniki(selectedRubilniki, fusesPnMaterials);
                  
                  // Группируем предохранители по типу для отображения
                  const fuseGroups = autoAddedFuses.reduce((groups, fuse) => {
                    const baseName = fuse.name.replace(/ \(авто для .*\)/, ''); // Убираем суффикс
                    if (!groups[baseName]) {
                      groups[baseName] = { name: baseName, price: fuse.price, count: 0 };
                    }
                    groups[baseName].count++;
                    return groups;
                  }, {} as Record<string, { name: string; price: number; count: number }>);
                  
                  return Object.values(fuseGroups).map((group, index) => (
                    <div key={`fuse-${index}`} className="flex justify-between">
                      <span className="text-gray-600">Предохранитель ПН ({group.count}шт):</span>
                      <span className="text-gray-700">{group.name} - {(group.price * group.count).toLocaleString()} ₸</span>
                    </div>
                  ));
                })()}
              </>
            )}
          </>
        )}
        
        {/* Показываем разъединители из дополнительной калькуляции */}
        {rubilnikTotal > 0 && (
          <div className="flex justify-between">
            <span className="text-gray-600">Разъединители:</span>
            <span className="text-gray-700">{rubilnikTotal.toLocaleString()} ₸</span>
          </div>
        )}
        
        {/* Показываем трансформаторы тока для РПС, Воздушный, Литой корпус и Литой корпус + Рубильник */}
        {currentTransformersList.length > 0 && (
          <>
            {currentTransformersList.map((transformer, index) => (
              <div key={index} className="flex justify-between">
                <span className="text-gray-600">Трансформатор тока ({transformer.current} А, {transformer.quantity} шт):</span>
                <span className="text-gray-700">{transformer.name} - {(transformer.price * transformer.quantity).toLocaleString()} ₸</span>
              </div>
            ))}
          </>
        )}
        
        {/* Показываем расходные материалы (алюминий/медь) для РПС */}
        {rpsMaterialConsumptionList.length > 0 && (
          <>
            {rpsMaterialConsumptionList.map((item, index) => {
              // Находим количество рубильников с таким током
              const selectedRubilniki = cell.rubilniki?.filter(r => r && r.trim() !== '') || [];
              const rubilnikiCount = selectedRubilniki.filter(r => {
                const current = extractCurrentFromRubilnikName(r);
                return current === item.current;
              }).length;
              
              return (
                <div key={index} className="flex justify-between">
                  <span className="text-gray-600">
                    {item.material} для РПС {item.current}А ({item.consumption}кг × {rubilnikiCount}шт):
                  </span>
                  <span className="text-gray-700">
                    {item.total.toLocaleString()} ₸ ({item.pricePerKg.toLocaleString()} ₸/кг)
                  </span>
                </div>
              );
            })}
          </>
        )}
        
        {/* Показываем расходные материалы (алюминий/медь) для автоматов (Литой корпус и Литой корпус + Рубильник) */}
        {automatonMaterialConsumptionList.length > 0 && (
          <>
            {automatonMaterialConsumptionList.map((item, index) => {
              // Находим количество автоматов с таким током
              const selectedAutomatons = cell.rubilniki?.filter(r => r && r.trim() !== '') || [];
              const automatonsCount = selectedAutomatons.filter(a => {
                const current = extractCurrentFromBreakerName(a);
                if (!current) return false;
                const currentKey = current <= 400 ? 'до 400' : current;
                return currentKey === item.current;
              }).length;
              
              return (
                <div key={index} className="flex justify-between">
                  <span className="text-gray-600">
                    {item.material} для автомата {typeof item.current === 'string' ? item.current : `${item.current}А`} ({item.consumption}кг × {automatonsCount}шт):
                  </span>
                  <span className="text-gray-700">
                    {item.total.toLocaleString()} ₸ ({item.pricePerKg.toLocaleString()} ₸/кг)
                  </span>
                </div>
              );
            })}
          </>
        )}
        
        {/* Показываем расходные материалы (алюминий/медь) для выкатного автомата (Режим "Воздушный") */}
        {withdrawableAutomatonMaterialConsumptionList.length > 0 && (
          <>
            {withdrawableAutomatonMaterialConsumptionList.map((item, index) => (
              <div key={index} className="flex justify-between">
                <span className="text-gray-600">
                  {item.material} для выкатного автомата {item.current}А ({item.consumption}кг × 1шт):
                </span>
                <span className="text-gray-700">
                  {item.total.toLocaleString()} ₸ ({item.pricePerKg.toLocaleString()} ₸/кг)
                </span>
              </div>
            ))}
          </>
        )}
        
        <div className="flex justify-between border-t border-indigo-100 pt-1">
          <span className="text-gray-600 font-medium">Итого материалов:</span>
          <span className="text-gray-700 font-medium">
            {(materialsTotal + selectedMaterialsTotal + additionalMaterialsCost + fusesPnTotal + meterTotal + rubilnikTotal).toLocaleString()} ₸
          </span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">Изготовление ({calculation.data.calculation.manufacturingHours || 0}ч × {calculation.data.calculation.hourlyRate}₸):</span>
          <span className="text-gray-700">{(calculationResult.salary || 0).toLocaleString()} ₸</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">Накладные расходы ({calculation.data.calculation.overheadPercentage}% от материалов):</span>
          <span className="text-gray-700">{(calculationResult.overheadCost || 0).toLocaleString()} ₸</span>
        </div>
        
        <div className="flex justify-between border-t border-indigo-100 pt-1">
          <span className="text-gray-600 font-medium">Производственная себестоимость:</span>
          <span className="text-gray-700 font-medium">{(calculationResult.productionCost || 0).toLocaleString()} ₸</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">Административные расходы ({calculation.data.calculation.adminPercentage}% от материалов):</span>
          <span className="text-gray-700">{(calculationResult.adminCost || 0).toLocaleString()} ₸</span>
        </div>
        
        <div className="flex justify-between border-t border-indigo-100 pt-1">
          <span className="text-gray-600 font-medium">Полная себестоимость:</span>
          <span className="text-gray-700 font-medium">{(calculationResult.fullCost || 0).toLocaleString()} ₸</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">Планируемая прибыль ({calculation.data.calculation.plannedProfitPercentage}% от себестоимости):</span>
          <span className="text-gray-700">{(calculationResult.plannedProfit || 0).toLocaleString()} ₸</span>
        </div>
        
        <div className="flex justify-between border-t border-indigo-100 pt-1">
          <span className="text-gray-600 font-medium">Оптовая цена:</span>
          <span className="text-gray-700 font-medium">{(calculationResult.wholesalePrice || 0).toLocaleString()} ₸</span>
        </div>
        
        <div className="flex justify-between border-t border-indigo-200 pt-1">
          <span className="text-gray-600 font-medium">НДС ({calculation.data.calculation.ndsPercentage}% от оптовой цены):</span>
          <span className="text-gray-700 font-medium">{(calculationResult.ndsAmount || 0).toLocaleString()} ₸</span>
        </div>
      </div>
        </>
      )}
    </div>
  );
} 