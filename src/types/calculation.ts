export interface Material {
  id: number;
  name: string;
  price: number;
  code?: string;
  unit?: string;
  category?: string;
}

export type CellType =
  | '0.4kv'
  | '10kv'
  | '20kv'
  | 'rza'
  | 'pu'
  | 'disconnector'
  | 'busbar'
  | 'busbridge'
  | 'switch'
  | 'tn'
  | 'tsn';
export type MaterialType =
  | 'switch'
  | 'rza'
  | 'counter'
  | 'sr'
  | 'tsn'
  | 'tn'
  | 'tt' // Трансформатор тока
  | 'pu' // ПУ
  | 'disconnector' // Разъединитель
  | 'busbar' // Сборные шины
  | 'busbridge'; // Шинный мост

export interface CellMaterial {
  id: number;
  name: string;
  price: number;
  type: MaterialType;
  unit?: string;
  code?: string;
}

export interface CellConfiguration {
  type: CellType;
  materials: {
    switch?: CellMaterial[];
    rza?: CellMaterial[];
    counter?: CellMaterial[];
    sr?: CellMaterial[];
    tsn?: CellMaterial[];
    tn?: CellMaterial[];
    tt?: CellMaterial[];
    pu?: CellMaterial[];
    disconnector?: CellMaterial[];
    busbar?: CellMaterial[];
    busbridge?: CellMaterial[];
  };
  categoryId?: number;
}

export interface CellConfig extends CellConfiguration {}

export interface CalculationItem {
  id: number;
  name: string;
  unit: string;
  price: number;
  quantity: number;
}

export interface CalculationCategory {
  name: string;
  items: CalculationItem[];
}

export interface CalculationSettings {
  manufacturingHours: number;
  hourlyRate: number;
  overheadPercentage: number;
  adminPercentage: number;
  plannedProfitPercentage: number;
  ndsPercentage: number;
}

export interface CalculationData {
  categories: CalculationCategory[];
  calculation: CalculationSettings;
  cellConfig?: CellConfiguration;
}
