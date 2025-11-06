import { useState, useEffect } from 'react';
import { api } from '@/api/baseUrl';
import { Decimal } from 'decimal.js';

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
        const url = `${api}/calculations/groups/${groupSlug}/calculations`;
        
        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch calculations: ${response.status} ${response.statusText}`);
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
        console.error('❌ Error fetching calculations:', error);
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
    let totalMaterialsCost = calculation.data.categories.reduce((total, category) => {
      return total + category.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    }, 0);

    const calculationData = calculation.data.calculation;
    if (!calculationData) return totalMaterialsCost;

    // Calculate the total cost using precise decimal arithmetic
    const totalSalary = new Decimal(calculationData.manufacturingHours).mul(calculationData.hourlyRate);
    const overheadCost = new Decimal(totalMaterialsCost).mul(calculationData.overheadPercentage).div(100);
    const productionCost = new Decimal(totalMaterialsCost).add(totalSalary).add(overheadCost);
    const adminCost = new Decimal(totalMaterialsCost).mul(calculationData.adminPercentage).div(100);
    const fullCost = productionCost.add(adminCost);
    const plannedProfit = fullCost.mul(calculationData.plannedProfitPercentage).div(100);
    const wholesalePrice = fullCost.add(plannedProfit);
    const ndsAmount = wholesalePrice.mul(calculationData.ndsPercentage).div(100);
    const finalPrice = wholesalePrice.add(ndsAmount);


    // Возвращаем рассчитанную цену
    return finalPrice.toNumber();
  };

  return {
    calculations,
    loading,
    error,
    calculateCellTotal,
  };
}
