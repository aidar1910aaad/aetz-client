import { BmzSettings } from '@/api/bmz';

export interface BmzData {
  buildingType: 'bmz' | 'tp' | 'none';
  settings: BmzSettings | null;
  length: number;
  width: number;
  height: number;
  thickness: number;
  blockCount: number;
  equipmentState: Record<string, boolean>;
}

export interface EquipmentCalculation {
  name: string;
  price: number;
  quantity: number;
  unit: string;
  totalPrice: number;
}

/**
 * Рассчитывает площадь здания в квадратных метрах
 */
export const calculateArea = (width: number, length: number): number => {
  return (width / 1000) * (length / 1000);
};

/**
 * Рассчитывает базовую цену за квадратный метр
 */
export const calculateBasePrice = (
  settings: BmzSettings | null,
  thickness: number,
  area: number
): number => {
  if (!settings) return 0;

  const matchingRanges = settings.areaPriceRanges.filter(
    (range) => thickness >= range.minWallThickness && thickness <= range.maxWallThickness
  );

  matchingRanges.sort((a, b) => b.minArea - a.minArea);
  const priceRange = matchingRanges.find((range) => area >= range.minArea);

  return priceRange?.pricePerSquareMeter || 0;
};

/**
 * Рассчитывает стоимость оборудования
 */
export const calculateEquipmentPrice = (equipment: any, area: number): EquipmentCalculation => {
  let price = 0;
  let quantity = 0;
  let unit = '';

  if (equipment.priceType === 'perSquareMeter') {
    price = equipment.pricePerSquareMeter || 0;
    quantity = area;
    unit = 'м²';
  } else if (equipment.priceType === 'perHalfSquareMeter') {
    price = equipment.pricePerSquareMeter || 0;
    quantity = area / 2;
    unit = 'м²';
  } else if (equipment.priceType === 'fixed') {
    price = equipment.fixedPrice || 0;
    quantity = 1;
    unit = 'компл.';
  }

  return {
    name: equipment.name,
    price,
    quantity,
    unit,
    totalPrice: price * quantity,
  };
};

/**
 * Рассчитывает общую стоимость БМЗ
 */
export const calculateTotalPrice = (bmzData: BmzData): number => {
  if (!bmzData.settings || bmzData.buildingType === 'none') return 0;

  const area = calculateArea(bmzData.width, bmzData.length);
  let total = 0;

  if (bmzData.buildingType === 'bmz') {
    const basePrice = calculateBasePrice(bmzData.settings, bmzData.thickness, area);
    total += basePrice * area;
  }

  bmzData.settings.equipment.forEach((equipment) => {
    const stateKey = equipment.name.toLowerCase().replace(/\s+/g, '');
    if (bmzData.equipmentState[stateKey]) {
      const equipmentCalc = calculateEquipmentPrice(equipment, area);
      total += equipmentCalc.totalPrice;
    }
  });

  return Math.round(total);
};

/**
 * Форматирует цену в казахстанских тенге
 */
export const formatPrice = (num?: number): string => {
  return num ? num.toLocaleString('ru-RU') + ' тг' : '—';
};

/**
 * Получает все активное оборудование с расчетами
 */
export const getActiveEquipment = (bmzData: BmzData): EquipmentCalculation[] => {
  if (!bmzData.settings) return [];

  const area = calculateArea(bmzData.width, bmzData.length);

  return bmzData.settings.equipment
    .filter((equipment) => {
      const stateKey = equipment.name.toLowerCase().replace(/\s+/g, '');
      return bmzData.equipmentState[stateKey];
    })
    .map((equipment) => calculateEquipmentPrice(equipment, area));
};
