import { useState, useEffect } from 'react';
import { api } from '@/api/baseUrl';

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
    calculation?: {
      manufacturingHours?: number;
      hourlyRate?: number;
      overheadPercentage?: number;
      adminPercentage?: number;
      plannedProfitPercentage?: number;
      ndsPercentage?: number;
    };
    cellConfig?: {
      type?: string;
      materials?: Record<string, unknown>;
    };
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
    cell: [],
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
        const response = await fetch(`${api}/calculations/groups/${groupSlug}/calculations`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
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
          cell: data, // Все калькуляции ячеек
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
    const calculation = calculations.cell.find((c) => c.id === calculationId);
    if (!calculation) return 0;

    // Получаем отпускную цену из данных калькуляции
    const totalMaterialsCost = calculation.data.categories.reduce((total, category) => {
      return total + category.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    }, 0);

    const calculationData = calculation.data.calculation;
    if (!calculationData) return totalMaterialsCost;

    // Calculate the total cost including all materials
    const totalSalary = calculationData.manufacturingHours * calculationData.hourlyRate;
    const overheadCost = (totalMaterialsCost * calculationData.overheadPercentage) / 100;
    const productionCost = totalMaterialsCost + totalSalary + overheadCost;
    const adminCost = (totalMaterialsCost * calculationData.adminPercentage) / 100;
    const fullCost = productionCost + adminCost;
    const plannedProfit = (fullCost * calculationData.plannedProfitPercentage) / 100;
    const wholesalePrice = fullCost + plannedProfit;
    const ndsAmount = (wholesalePrice * calculationData.ndsPercentage) / 100;
    const finalPrice = wholesalePrice + ndsAmount;

    return finalPrice;
  };

  return {
    calculations,
    loading,
    error,
    calculateCellTotal,
  };
}
