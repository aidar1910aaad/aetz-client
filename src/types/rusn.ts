export type BusMaterial = 'АД' | 'АД2' | 'МТ' | 'МТ2';

export interface BusSpec {
  size: string;
  amps: number[] | number; // For copper/aluminum it's an array of 4 values, for steel it's a single value
  weightPerMeter: number;
}

export interface BusConsumption {
  cellType: string;
  weight: number;
}

export interface BusBridgeConfig {
  material: BusMaterial;
  selectedBus: BusSpec | null;
  totalWeight: number;
  pricePerKg: number;
  totalPrice: number;
  consumption: BusConsumption[];
}

// Таблица соответствия токов и размеров шин
export const BUS_SPECS: Record<BusMaterial, BusSpec[]> = {
  copper: [
    { size: '15x3', amps: [210, null, null, null], weightPerMeter: 0.4 },
    { size: '20x3', amps: [275, null, null, null], weightPerMeter: 0.53 },
    { size: '25x3', amps: [340, null, null, null], weightPerMeter: 0.67 },
    { size: '30x4', amps: [475, null, null, null], weightPerMeter: 1.07 },
    { size: '40x4', amps: [625, 1090, null, null], weightPerMeter: 1.42 },
    { size: '40x5', amps: [700, 1250, null, null], weightPerMeter: 1.78 },
    { size: '50x5', amps: [860, 1525, 1895, null], weightPerMeter: 2.22 },
    { size: '50x6', amps: [955, 1700, 2145, null], weightPerMeter: 2.67 },
    { size: '60x6', amps: [1125, 1740, 2240, 2495], weightPerMeter: 3.2 },
    { size: '80x6', amps: [1480, 2110, 2720, 3220], weightPerMeter: 4.27 },
    { size: '100x6', amps: [1810, 2470, 3170, 3940], weightPerMeter: 5.33 },
    { size: '60x8', amps: [1320, 2160, 2790, 3020], weightPerMeter: 4.27 },
    { size: '80x8', amps: [1690, 2620, 3370, 3850], weightPerMeter: 5.68 },
    { size: '100x8', amps: [2080, 3060, 3930, 4690], weightPerMeter: 7.11 },
    { size: '120x8', amps: [2400, 3400, 4340, 5600], weightPerMeter: 8.53 },
    { size: '60x10', amps: [1475, 2560, 3250, 3725], weightPerMeter: 5.33 },
    { size: '80x10', amps: [1900, 3100, 3990, 4450], weightPerMeter: 7.11 },
    { size: '100x10', amps: [2310, 3610, 4650, 5300], weightPerMeter: 8.89 },
    { size: '120x10', amps: [2650, 4100, 5200, 5900], weightPerMeter: 10.67 },
  ],
  aluminum: [
    { size: '15x3', amps: [165, null, null, null], weightPerMeter: 0.12 },
    { size: '20x3', amps: [215, null, null, null], weightPerMeter: 0.16 },
    { size: '25x3', amps: [265, null, null, null], weightPerMeter: 0.2 },
    { size: '30x4', amps: [365, 370, null, null], weightPerMeter: 0.32 },
    { size: '40x4', amps: [480, 855, null, null], weightPerMeter: 0.43 },
    { size: '40x5', amps: [540, 545, 965, null], weightPerMeter: 0.54 },
    { size: '50x5', amps: [665, 670, 1180, 1470], weightPerMeter: 0.67 },
    { size: '50x6', amps: [740, 745, 1315, 1655], weightPerMeter: 0.81 },
    { size: '60x6', amps: [870, 880, 1530, 1945], weightPerMeter: 0.97 },
    { size: '80x6', amps: [1120, 1170, 2050, 2460], weightPerMeter: 1.3 },
    { size: '100x6', amps: [1425, 1455, 1935, 2500], weightPerMeter: 1.62 },
    { size: '60x8', amps: [1025, 1040, 1680, 2180], weightPerMeter: 1.3 },
    { size: '80x8', amps: [1320, 1355, 2260, 2975], weightPerMeter: 1.73 },
    { size: '100x8', amps: [1625, 1690, 2390, 3050], weightPerMeter: 2.16 },
    { size: '120x8', amps: [1900, 2040, 3380, 4250], weightPerMeter: 2.59 },
    { size: '60x10', amps: [1240, 1480, 2410, 3050], weightPerMeter: 1.62 },
    { size: '80x10', amps: [1700, 1880, 3100, 3440], weightPerMeter: 2.16 },
    { size: '100x10', amps: [1820, 1910, 2860, 3650], weightPerMeter: 2.7 },
    { size: '120x10', amps: [2070, 2300, 3200, 4100], weightPerMeter: 3.24 },
  ],
  steel: [
    { size: '16x2.5', amps: 55, weightPerMeter: 0.31 },
    { size: '20x2.5', amps: 60, weightPerMeter: 0.39 },
    { size: '25x2.5', amps: 75, weightPerMeter: 0.49 },
    { size: '30x3', amps: 95, weightPerMeter: 0.71 },
    { size: '40x3', amps: 125, weightPerMeter: 0.94 },
    { size: '50x3', amps: 155, weightPerMeter: 1.18 },
    { size: '60x3', amps: 185, weightPerMeter: 1.41 },
    { size: '70x3', amps: 225, weightPerMeter: 1.65 },
    { size: '80x3', amps: 245, weightPerMeter: 1.88 },
    { size: '90x3', amps: 275, weightPerMeter: 2.12 },
    { size: '100x3', amps: 305, weightPerMeter: 2.35 },
    { size: '20x3', amps: 65, weightPerMeter: 0.47 },
    { size: '25x3', amps: 80, weightPerMeter: 0.59 },
    { size: '30x3', amps: 95, weightPerMeter: 0.71 },
    { size: '40x3', amps: 130, weightPerMeter: 0.94 },
    { size: '50x3', amps: 155, weightPerMeter: 1.18 },
    { size: '60x3', amps: 195, weightPerMeter: 1.41 },
    { size: '70x4', amps: 225, weightPerMeter: 2.2 },
    { size: '80x4', amps: 245, weightPerMeter: 2.51 },
    { size: '90x4', amps: 290, weightPerMeter: 2.83 },
    { size: '100x4', amps: 325, weightPerMeter: 3.14 },
  ],
};

// Таблица расхода шин по типам ячеек
export const BUS_CONSUMPTION: Record<string, BusConsumption[]> = {
  'КСО А12-10': [
    { cellType: '1ВК', weight: 50 },
    { cellType: '3СВ', weight: 60 },
    { cellType: '4РСВ', weight: 35 },
    { cellType: 'Отходящая линия', weight: 30 },
  ],
  // Добавить другие типы камер
};

// Цены на материалы
export const BUS_MATERIAL_PRICES: Record<BusMaterial, number> = {
  copper: 5600, // цена за кг меди
  aluminum: 2800, // цена за кг алюминия
  steel: 1400, // цена за кг стали
};
