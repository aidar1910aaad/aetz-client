import { create } from 'zustand';

interface CalculationResults {
  [cellId: string]: {
    mainCalculation: number;
    meterCalculation: number;
  };
}

interface CalculationResultsState {
  results: CalculationResults;
  updateCellResult: (cellId: string, type: 'main' | 'meter', price: number) => void;
  getCellResult: (cellId: string) => { mainCalculation: number; meterCalculation: number };
  clearResults: () => void;
}

export const useCalculationResultsStore = create<CalculationResultsState>((set, get) => ({
  results: {},
  
  updateCellResult: (cellId: string, type: 'main' | 'meter', price: number) => {
    const key = type === 'main' ? 'mainCalculation' : 'meterCalculation';
    
    set((state) => {
      const currentValue = state.results[cellId]?.[key];
      
      // Проверяем, изменилось ли значение
      if (currentValue === price) {
        return state; // Не обновляем, если значение не изменилось
      }
      
      return {
        results: {
          ...state.results,
          [cellId]: {
            ...state.results[cellId],
            [key]: price
          }
        }
      };
    });
  },
  
  getCellResult: (cellId: string) => {
    const state = get();
    return state.results[cellId] || { mainCalculation: 0, meterCalculation: 0 };
  },
  
  clearResults: () => {
    set({ results: {} });
  }
}));

