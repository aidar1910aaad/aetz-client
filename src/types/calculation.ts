export interface Material {
  id: number;
  name: string;
  price: number;
  code?: string;
  unit?: string;
  category?: string;
}

export type CellType = '0.4kv' | '10kv' | '20kv' | 'rza';
export type MaterialType = 'switch' | 'rza' | 'counter' | 'sr' | 'tsn' | 'tn';

export interface CellMaterial {
  id: string;
  name: string;
  price: number;
  type: MaterialType;
  unit?: string;
  code?: string;
}

export interface CellConfiguration {
  type: CellType;
  materials: {
    [key in MaterialType]: CellMaterial[];
  };
  categoryId?: number;
}

export interface CellConfig extends CellConfiguration {}

export interface CalculationData {
  categories: Array<{
    name: string;
    items: Array<{
      name: string;
      unit: string;
      price: number;
      quantity: number;
    }>;
  }>;
  calculation: {
    manufacturingHours: number;
    hourlyRate: number;
    overheadPercentage: number;
    adminPercentage: number;
    plannedProfitPercentage: number;
    ndsPercentage: number;
  };
  cellConfig?: CellConfiguration;
}
