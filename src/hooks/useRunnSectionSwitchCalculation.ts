import { useState, useEffect } from 'react';
import { RunnCell } from '@/store/useRunnStore';
import { getCalculationsByGroup } from '@/api/calculations';

export function useRunnSectionSwitchCalculation(cell: RunnCell | null) {
  const [calculation, setCalculation] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCalculation = async () => {
      if (!cell || cell.purpose !== 'Секционный выключатель') {
        setCalculation(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem('token') || '';
        
        // Получаем все калькуляции из группы ЩО
        const calculations = await getCalculationsByGroup('panel-sho-70', token);
        
        // Ищем первую доступную калькуляцию с типом "section_switch"
        const sectionSwitchCalculation = calculations.find((calc: any) => {
          // Проверяем тип ячейки
          if (calc.data?.cellConfig?.type !== 'section_switch') {
            return false;
          }
          
          // Проверяем наличие withdrawable_breaker в материалах
          if (!calc.data?.cellConfig?.materials?.withdrawable_breaker?.length) {
            return false;
          }
          
          // Берем первую доступную калькуляцию секционного выключателя
          return true;
        });

        if (sectionSwitchCalculation) {
          setCalculation(sectionSwitchCalculation);
        } else {
          setError('Калькуляция для секционного выключателя не найдена');
        }
      } catch (err) {
        setError('Ошибка загрузки калькуляции');
      } finally {
        setLoading(false);
      }
    };

    fetchCalculation();
  }, [cell]);

  return {
    calculation,
    loading,
    error,
  };
} 