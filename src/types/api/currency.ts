export interface CurrencySettings {
  id: number;
  usdRate: string;
  eurRate: string;
  rubRate: string;
  kztRate: string;
  defaultCurrency: string;
  hourlyWage: string;
  vatRate: string;
  administrativeExpenses: string;
  plannedSavings: string;
  productionExpenses: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateCurrencySettingsRequest {
  usdRate?: number;
  eurRate?: number;
  rubRate?: number;
  kztRate?: number;
  defaultCurrency?: string;
  hourlyWage?: number;
  vatRate?: number;
  administrativeExpenses?: number;
  plannedSavings?: number;
  productionExpenses?: number;
} 