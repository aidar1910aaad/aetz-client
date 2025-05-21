import { useState, useEffect } from 'react';

interface CalculationItem {
  id: number | null;
  name: string;
  unit: string;
  price: number;
  quantity: number;
}

interface CalculationCategory {
  name: string;
  items: CalculationItem[];
}

interface Calculation {
  id: number;
  name: string;
  slug: string;
  data: {
    categories: CalculationCategory[];
  };
}

interface CalculationState {
  breaker: Calculation[];
  rza: Calculation[];
  meter: Calculation[];
  cell: Calculation[];
}

export function useRusnCalculation(groupSlug?: string) {
  const [calculations, setCalculations] = useState<CalculationState>({
    breaker: [],
    rza: [],
    meter: [],
    cell: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCalculations = async () => {
      if (!groupSlug) {
        setLoading(false);
        return;
      }

      try {
        const token = localStorage.getItem('token') || '';
        const response = await fetch(`http://localhost:3001/calculations/groups/${groupSlug}/calculations`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch calculations');
        }

        const data: Calculation[] = await response.json();
        
        // Группируем расчеты по типам
        const groupedCalculations: CalculationState = {
          breaker: [],
          rza: [],
          meter: [],
          cell: data // Все калькуляции ячеек
        };

        setCalculations(groupedCalculations);
      } catch (error) {
        console.error('Error fetching calculations:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch calculations');
      } finally {
        setLoading(false);
      }
    };

    fetchCalculations();
  }, [groupSlug]);

  const calculateCellTotal = (calculationId: number) => {
    const calculation = calculations.cell.find(c => c.id === calculationId);
    if (!calculation) return 0;

    let total = 0;
    calculation.data.categories.forEach(category => {
      category.items.forEach(item => {
        total += item.price * item.quantity;
      });
    });

    return total;
  };

  return {
    calculations,
    loading,
    error,
    calculateCellTotal
  };
} 