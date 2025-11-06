import { useState, useCallback, useRef } from 'react';

interface CalculationResults {
  [cellId: string]: {
    mainCalculation: number;
    meterCalculation: number;
  };
}

export function useCalculationResults() {
  const [results, setResults] = useState<CalculationResults>({});
  const lastResults = useRef<CalculationResults>({});

  const updateCellResult = useCallback((cellId: string, type: 'main' | 'meter', price: number) => {
    const key = type === 'main' ? 'mainCalculation' : 'meterCalculation';
    
    // Проверяем, изменилось ли значение
    if (lastResults.current[cellId]?.[key] === price) {
      return; // Не обновляем, если значение не изменилось
    }
    
    setResults(prev => {
      const newResults = {
        ...prev,
        [cellId]: {
          ...prev[cellId],
          [key]: price
        }
      };
      
      // Обновляем ref
      lastResults.current = newResults;
      
      return newResults;
    });
  }, []);

  const getCellResult = useCallback((cellId: string) => {
    return results[cellId] || { mainCalculation: 0, meterCalculation: 0 };
  }, [results]);

  return {
    results,
    updateCellResult,
    getCellResult
  };
}
