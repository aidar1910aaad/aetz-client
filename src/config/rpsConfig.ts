/**
 * Конфигурация РПС и коммутационных аппаратов
 * Расход материалов (алюминий и медь) в кг
 */

/**
 * Расход материалов
 */
export interface MaterialConsumption {
  /** Расход алюминия в кг */
  aluminum: number;
  /** Расход меди в кг */
  copper: number;
}

/**
 * Конфигурация РПС
 */
export interface RpsConfig {
  /** Название РПС */
  name: string;
  /** Номинальный ток в амперах */
  current: number;
  /** Расход материалов */
  materials: MaterialConsumption;
}

/**
 * Конфигурация автомата
 */
export interface AutomatonConfig {
  /** Название автомата */
  name: string;
  /** Номинальный ток в амперах (или диапазон, например "до 400") */
  current: number | string;
  /** Расход материалов */
  materials: MaterialConsumption;
}

/**
 * Конфигурация выкатного автомата
 */
export interface WithdrawableAutomatonConfig {
  /** Название */
  name: string;
  /** Номинальный ток в амперах */
  current: number;
  /** Расход материалов */
  materials: MaterialConsumption;
}

/**
 * РПС конфигурации
 */
export const RPS_CONFIGS: RpsConfig[] = [
  {
    name: 'РПС 100',
    current: 100,
    materials: { aluminum: 4, copper: 5 }
  },
  {
    name: 'РПС 250',
    current: 250,
    materials: { aluminum: 4, copper: 5 }
  },
  {
    name: 'РПС 400',
    current: 400,
    materials: { aluminum: 4, copper: 5 }
  },
  {
    name: 'РПС 630',
    current: 630,
    materials: { aluminum: 6, copper: 9 }
  }
];

/**
 * Автомат конфигурации (литой корпус)
 */
export const AUTOMATON_CONFIGS: AutomatonConfig[] = [
  {
    name: 'Автомат до 400',
    current: 'до 400',
    materials: { aluminum: 4, copper: 5 }
  },
  {
    name: 'Автомат 630',
    current: 630,
    materials: { aluminum: 6, copper: 9 }
  },
  {
    name: 'Автомат 800',
    current: 800,
    materials: { aluminum: 20, copper: 35 }
  },
  {
    name: 'Автомат 1000',
    current: 1000,
    materials: { aluminum: 20, copper: 35 }
  },
  {
    name: 'Автомат 1600',
    current: 1600,
    materials: { aluminum: 31, copper: 63 }
  }
];

/**
 * Выкатной автомат конфигурации
 */
export const WITHDRAWABLE_AUTOMATON_CONFIGS: WithdrawableAutomatonConfig[] = [
  {
    name: 'Выкатной автомат 630',
    current: 630,
    materials: { aluminum: 12, copper: 25 }
  },
  {
    name: 'Выкатной автомат 1000',
    current: 1000,
    materials: { aluminum: 20, copper: 36 }
  },
  {
    name: 'Выкатной автомат 1250',
    current: 1250,
    materials: { aluminum: 20, copper: 63 }
  },
  {
    name: 'Выкатной автомат 1600',
    current: 1600,
    materials: { aluminum: 31, copper: 63 }
  },
  {
    name: 'Выкатной автомат 2000',
    current: 2000,
    materials: { aluminum: 37, copper: 98 }
  },
  {
    name: 'Выкатной автомат 2500',
    current: 2500,
    materials: { aluminum: 62, copper: 118 }
  }
];

/**
 * Получить конфигурацию РПС по току
 */
export function getRpsByCurrent(current: number): RpsConfig | undefined {
  return RPS_CONFIGS.find(rps => rps.current === current);
}

/**
 * Получить конфигурацию РПС по названию
 */
export function getRpsByName(name: string): RpsConfig | undefined {
  return RPS_CONFIGS.find(rps => rps.name === name);
}

/**
 * Получить конфигурацию автомата по току
 */
export function getAutomatonByCurrent(current: number | string): AutomatonConfig | undefined {
  return AUTOMATON_CONFIGS.find(aut => aut.current === current);
}

/**
 * Получить конфигурацию выкатного автомата по току
 */
export function getWithdrawableAutomatonByCurrent(current: number): WithdrawableAutomatonConfig | undefined {
  return WITHDRAWABLE_AUTOMATON_CONFIGS.find(aut => aut.current === current);
}

/**
 * Получить расход материала для РПС
 */
export function getRpsMaterial(
  current: number,
  materialType: 'Алюминий' | 'Медь'
): number {
  const config = getRpsByCurrent(current);
  if (!config) return 0;
  return materialType === 'Алюминий' ? config.materials.aluminum : config.materials.copper;
}

/**
 * Получить расход материала для автомата
 */
export function getAutomatonMaterial(
  current: number | string,
  materialType: 'Алюминий' | 'Медь'
): number {
  const config = getAutomatonByCurrent(current);
  if (!config) return 0;
  return materialType === 'Алюминий' ? config.materials.aluminum : config.materials.copper;
}

/**
 * Получить расход материала для выкатного автомата
 */
export function getWithdrawableAutomatonMaterial(
  current: number,
  materialType: 'Алюминий' | 'Медь'
): number {
  const config = getWithdrawableAutomatonByCurrent(current);
  if (!config) return 0;
  return materialType === 'Алюминий' ? config.materials.aluminum : config.materials.copper;
}
