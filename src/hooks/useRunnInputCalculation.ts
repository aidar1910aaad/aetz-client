import { useState, useEffect } from 'react';
import { RunnCell } from '@/store/useRunnStore';
import { loadRunnPanelCalculations } from '@/domain/runn/calculationLoader';
import {
  findBaseOutgoingCalculation,
  findInputCalculation,
  findOutgoingCalculationByCaseAndMaterial,
  findOutgoingMeterCalculation,
  findSectionSwitchCalculation,
  findTorcevaiaCalculation,
} from '@/domain/runn/calculationMatcher';
import {
  isInputPurpose,
  isOutgoingPurpose,
  isTorcevaiaPurpose,
  RUNN_CELL_PURPOSE,
} from '@/domain/runn/runnConstants';

type MaterialType = 'withdrawable_breaker' | 'counter';

export function useRunnCalculation(cell: RunnCell | null, materialType: MaterialType) {
  const [calculation, setCalculation] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCalculation = async () => {
      if (!cell || !isInputPurpose(cell.purpose)) {
        setCalculation(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem('token') || '';
        const calculations = await loadRunnPanelCalculations(token);
        
        const cellValue = materialType === 'withdrawable_breaker' ? cell.breaker : cell.meterType;
        const foundCalculation = cellValue?.trim()
          ? findInputCalculation(calculations, materialType, cellValue)
          : undefined;

        if (foundCalculation) {
          setCalculation(foundCalculation);
        } else {
          setError(`Калькуляция для ${materialType === 'withdrawable_breaker' ? 'автомата выкатного' : 'ПУ'} не найдена`);
        }
      } catch (err) {
        setError('Ошибка загрузки калькуляции');
      } finally {
        setLoading(false);
      }
    };

    fetchCalculation();
  }, [cell, materialType, cell?.breaker, cell?.meterType]);

  return { calculation, loading, error };
}

// Специализированные хуки для удобства
export const useRunnBreakerCalculation = (cell: RunnCell | null) => 
  useRunnCalculation(cell, 'withdrawable_breaker');

export const useRunnCounterCalculation = (cell: RunnCell | null) => 
  useRunnCalculation(cell, 'counter');

// Хук для поиска калькуляции секционного выключателя на основе размера корпуса
export function useRunnSectionSwitchCalculation(
  sectionSwitchCell: RunnCell | null, 
  inputCell: RunnCell | null
) {
  const [calculation, setCalculation] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCalculation = async () => {
      if (!sectionSwitchCell || sectionSwitchCell.purpose !== RUNN_CELL_PURPOSE.SECTION_SWITCH || !inputCell) {
        setCalculation(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem('token') || '';
        const calculations = await loadRunnPanelCalculations(token);
        const foundCalculation = findSectionSwitchCalculation(
          calculations,
          sectionSwitchCell.breaker
        );

        if (foundCalculation) {
          setCalculation(foundCalculation);
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
  }, [sectionSwitchCell, inputCell, sectionSwitchCell?.breaker]);

  // Принудительное обновление при изменении автомата
  useEffect(() => {
    if (sectionSwitchCell?.breaker) {
      // Принудительно обновляем калькуляцию при изменении автомата
      const timeoutId = setTimeout(async () => {
        setLoading(true);
        setError(null);

        try {
          const token = localStorage.getItem('token') || '';
          const calculations = await loadRunnPanelCalculations(token);
          
          const foundCalculation = findSectionSwitchCalculation(
            calculations,
            sectionSwitchCell.breaker
          );

          if (foundCalculation) {
            setCalculation(foundCalculation);
          } else {
            setError('Калькуляция для секционного выключателя не найдена');
          }
        } catch (err) {
          setError('Ошибка загрузки калькуляции');
        } finally {
          setLoading(false);
        }
      }, 100);
      
      return () => clearTimeout(timeoutId);
    }
  }, [sectionSwitchCell?.breaker]);

  return { calculation, loading, error };
}

// Хук для загрузки калькуляции ПУ для отходящих ячеек
export function useRunnMeterCalculation(cell: RunnCell | null) {
  const [calculation, setCalculation] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCalculation = async () => {
      // Проверяем, что ячейка является отходящей
      if (!cell || !isOutgoingPurpose(cell.purpose)) {
        setCalculation(null);
        return;
      }

      // Если в ячейке нет ПУ, не ищем калькуляцию
      if (!cell.meterType) {
        setCalculation(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem('token') || '';
        const calculations = await loadRunnPanelCalculations(token);

        const foundCalculation = findOutgoingMeterCalculation(calculations, cell.meterType);

        if (foundCalculation) {
          setCalculation(foundCalculation);
        } else {
          setError('Калькуляция ПУ для отходящей ячейки не найдена');
        }
      } catch (err) {
        setError('Ошибка загрузки калькуляции ПУ');
      } finally {
        setLoading(false);
      }
    };

    fetchCalculation();
  }, [cell?.meterType]);

  return { calculation, loading, error };
}

// Хук для поиска калькуляции торцевой панели
export function useRunnTorcevaiaCalculation(cell: RunnCell | null) {
  const [calculation, setCalculation] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCalculation = async () => {
      if (!cell || !isTorcevaiaPurpose(cell.purpose)) {
        setCalculation(null);
        setLoading(false);
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem('token') || '';
        const calculations = await loadRunnPanelCalculations(token);
        
        const foundCalculation = findTorcevaiaCalculation(calculations);

        if (foundCalculation) {
          setCalculation(foundCalculation);
        } else {
          setError('Калькуляция для торцевой панели не найдена');
          setCalculation(null);
        }
      } catch (err) {
        setError('Ошибка загрузки калькуляции торцевой панели');
        setCalculation(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCalculation();
  }, [cell?.id]); // Зависим только от id ячейки, чтобы избежать лишних перезагрузок

  return { calculation, loading, error };
}

// Хук для поиска калькуляции отходящих ячеек
export function useRunnOutgoingCalculation(cell: RunnCell | null) {
  const [calculation, setCalculation] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCalculation = async () => {
      // Проверяем, что ячейка является отходящей
      if (!cell || !isOutgoingPurpose(cell.purpose)) {
        setCalculation(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem('token') || '';
        const calculations = await loadRunnPanelCalculations(token);
        
        const foundCalculation = findBaseOutgoingCalculation(calculations);

        if (foundCalculation) {
          setCalculation(foundCalculation);
        } else {
          setError('Базовая калькуляция для отходящей ячейки не найдена');
        }
      } catch (err) {
        setError('Ошибка загрузки калькуляции');
      } finally {
        setLoading(false);
      }
    };

    fetchCalculation();
  }, [cell?.purpose]);

  return { calculation, loading, error };
}

// Хук для поиска калькуляции для "Литой корпус" и "Литой корпус + Рубильник"
export function useRunnMoldedCaseCalculation(cell: RunnCell | null, inputCell?: RunnCell | null) {
  const [calculation, setCalculation] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCalculation = async () => {
      // Проверяем, что ячейка является отходящей с литым корпусом
      if (!cell || !isOutgoingPurpose(cell.purpose)) {
        setCalculation(null);
        return;
      }

      // Проверяем, что выбран литой корпус
      if (cell.switchingDevice !== 'Литой корпус' && cell.switchingDevice !== 'Литой корпус + Рубильник') {
        setCalculation(null);
        return;
      }

      // Если нет выбранных автоматов, не ищем калькуляцию
      if (!cell.rubilniki || cell.rubilniki.filter(r => r && r.trim() !== '').length === 0) {
        setCalculation(null);
        return;
      }

      // Если нет ячейки "Ввод" для получения глубины корпуса, не ищем калькуляцию
      if (!inputCell?.breaker) {
        setCalculation(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Получаем глубину корпуса из ячейки "Ввод"
        const { getCaseInfo } = await import('@/utils/caseSizeUtils');
        const caseInfo = getCaseInfo(inputCell.breaker);
        
        if (!caseInfo.isValid) {
          setError('Не удалось определить глубину корпуса для поиска калькуляции');
          setLoading(false);
          return;
        }

        const token = localStorage.getItem('token') || '';
        const calculations = await loadRunnPanelCalculations(token);
        
        const selectedAutomatons = cell.rubilniki.filter(r => r && r.trim() !== '');
        const foundCalculation = findOutgoingCalculationByCaseAndMaterial(
          calculations,
          caseInfo.caseSize,
          'molded_case_breaker',
          selectedAutomatons
        );

        if (foundCalculation) {
          setCalculation(foundCalculation);
        } else {
          setError(`Калькуляция для литого корпуса с глубиной ${caseInfo.caseSize} и данными автоматами не найдена`);
        }
      } catch (err) {
        console.error('Ошибка загрузки калькуляции для литого корпуса:', err);
        setError('Ошибка загрузки калькуляции');
      } finally {
        setLoading(false);
      }
    };

    fetchCalculation();
  }, [cell, inputCell]);

  return { calculation, loading, error };
}

// Хук для поиска калькуляции для "Воздушный"
export function useRunnAirCalculation(cell: RunnCell | null, inputCell?: RunnCell | null) {
  const [calculation, setCalculation] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCalculation = async () => {
      // Проверяем, что ячейка является отходящей с воздушным выключателем
      if (!cell || !isOutgoingPurpose(cell.purpose)) {
        setCalculation(null);
        return;
      }

      // Проверяем, что выбран воздушный выключатель
      if (cell.switchingDevice !== 'Воздушный') {
        setCalculation(null);
        return;
      }

      // Если нет выбранного автомата, не ищем калькуляцию
      if (!cell.breaker || cell.breaker.trim() === '') {
        setCalculation(null);
        return;
      }

      // Если нет ячейки "Ввод" для получения глубины корпуса, не ищем калькуляцию
      if (!inputCell?.breaker) {
        setCalculation(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Получаем глубину корпуса из ячейки "Ввод"
        const { getCaseInfo } = await import('@/utils/caseSizeUtils');
        const caseInfo = getCaseInfo(inputCell.breaker);
        
        if (!caseInfo.isValid) {
          setError('Не удалось определить глубину корпуса для поиска калькуляции');
          setLoading(false);
          return;
        }

        const token = localStorage.getItem('token') || '';
        const calculations = await loadRunnPanelCalculations(token);
        
        const foundCalculation = findOutgoingCalculationByCaseAndMaterial(
          calculations,
          caseInfo.caseSize,
          'withdrawable_breaker',
          [cell.breaker]
        );

        if (foundCalculation) {
          setCalculation(foundCalculation);
        } else {
          setError(`Калькуляция для воздушного выключателя с глубиной ${caseInfo.caseSize} и данным автоматом не найдена`);
        }
      } catch (err) {
        console.error('Ошибка загрузки калькуляции для воздушного выключателя:', err);
        setError('Ошибка загрузки калькуляции');
      } finally {
        setLoading(false);
      }
    };

    fetchCalculation();
  }, [cell, inputCell]);

  return { calculation, loading, error };
}