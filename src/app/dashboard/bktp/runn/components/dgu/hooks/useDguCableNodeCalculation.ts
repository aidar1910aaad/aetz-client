import { useState, useEffect } from 'react';
import { getCalculationsByGroup } from '@/api/calculations';

export function useDguCableNodeCalculation() {
  const [calculation, setCalculation] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCalculation = async () => {
      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem('token') || '';
        if (!token) {
          setError('Токен не найден');
          setLoading(false);
          return;
        }

        const calculations = await getCalculationsByGroup('panel-sho-70', token);
        
        // Ищем калькуляцию по ID 108 или slug "узел-дгу-кабель"
        const foundCalculation = calculations.find((calc: any) => 
          calc.id === 108 || calc.slug === 'узел-дгу-кабель'
        );

        if (foundCalculation) {
          setCalculation(foundCalculation);
        } else {
          setError('Калькуляция "Узел ДГУ кабель" не найдена');
        }
      } catch (err: any) {
        console.error('Ошибка при получении калькуляции:', err);
        setError(err.message || 'Ошибка при загрузке калькуляции');
      } finally {
        setLoading(false);
      }
    };

    fetchCalculation();
  }, []);

  return { calculation, loading, error };
}


