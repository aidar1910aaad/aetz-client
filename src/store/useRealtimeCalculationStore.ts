import { create } from 'zustand';

interface RealtimeCalculationState {
  isCalculating: boolean;
  lastCalculatedAt: string | null;
  totalAmount: number | null;
  data: any | null;
  requestConfig: any | null;
  customRowsByTable: Record<string, any[]>;
  tableMarkupPercents: Record<string, number>;
  tableMarkupTotals: Record<string, number | null>;
  error: string | null;
  setCalculating: (value: boolean) => void;
  setRequestConfig: (payload: any) => void;
  setResult: (payload: { totalAmount: number; data: any }) => void;
  setFinalPricingInputs: (payload: {
    customRowsByTable?: Record<string, any[]>;
    tableMarkupPercents?: Record<string, number>;
    tableMarkupTotals?: Record<string, number | null>;
  }) => void;
  setError: (message: string | null) => void;
  reset: () => void;
}

export const useRealtimeCalculationStore = create<RealtimeCalculationState>((set) => ({
  isCalculating: false,
  lastCalculatedAt: null,
  totalAmount: null,
  data: null,
  requestConfig: null,
  customRowsByTable: {},
  tableMarkupPercents: {},
  tableMarkupTotals: {},
  error: null,
  setCalculating: (value) => set({ isCalculating: value }),
  setRequestConfig: (payload) => set({ requestConfig: payload }),
  setResult: ({ totalAmount, data }) =>
    set({
      totalAmount,
      data,
      error: null,
      lastCalculatedAt: new Date().toISOString(),
    }),
  setFinalPricingInputs: ({ customRowsByTable, tableMarkupPercents, tableMarkupTotals }) =>
    set((state) => ({
      customRowsByTable: customRowsByTable ?? state.customRowsByTable,
      tableMarkupPercents: tableMarkupPercents ?? state.tableMarkupPercents,
      tableMarkupTotals: tableMarkupTotals ?? state.tableMarkupTotals,
    })),
  setError: (message) => set({ error: message }),
  reset: () =>
    set({
      isCalculating: false,
      lastCalculatedAt: null,
      totalAmount: null,
      data: null,
      requestConfig: null,
      customRowsByTable: {},
      tableMarkupPercents: {},
      tableMarkupTotals: {},
      error: null,
    }),
}));
