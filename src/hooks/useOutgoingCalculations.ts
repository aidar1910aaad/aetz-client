import { useState, useEffect } from 'react';
import { getCalculationsByGroup } from '@/api/calculations';

export const useOutgoingCalculations = () => {
  const [calculations, setCalculations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCalculations = async () => {
      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem('token') || '';
        const allCalculations = await getCalculationsByGroup('panel-sho-70', token);
        
        // Фильтруем калькуляции по типу "Отходящий ячейка"
        const outgoingCalculations = allCalculations.filter((calc: any) => 
          calc.data?.cellConfig?.type === 'outgoing'
        );
        
        setCalculations(outgoingCalculations);
      } catch (err) {
        setError('Ошибка загрузки калькуляций отходящих ячеек');
      } finally {
        setLoading(false);
      }
    };

    fetchCalculations();
  }, []);

  return { calculations, loading, error };
};