import { useState, useEffect } from 'react';
import { RunnCell } from '@/store/useRunnStore';
import { getCalculationsByGroup } from '@/api/calculations';
import { extractCurrentFromBreakerName } from '@/utils/panelNameUtils';

type MaterialType = 'withdrawable_breaker' | 'counter';

export function useRunnCalculation(cell: RunnCell | null, materialType: MaterialType) {
  const [calculation, setCalculation] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCalculation = async () => {
      if (!cell || cell.purpose !== 'Ввод') {
        setCalculation(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem('token') || '';
        const calculations = await getCalculationsByGroup('panel-sho-70', token);
        
        // Фильтруем калькуляции с типом 'input'
        const inputCalculations = calculations.filter((calc: any) => calc.data?.cellConfig?.type === 'input');
        
        // Ищем калькуляцию по типу материала
        const foundCalculation = calculations.find((calc: any) => {
          if (calc.data?.cellConfig?.type !== 'input') return false;
          
          const materials = calc.data?.cellConfig?.materials?.[materialType];
          if (!materials?.length) return false;
          
          const cellValue = materialType === 'withdrawable_breaker' ? cell.breaker : cell.meterType;
          
          // Проверяем, что cellValue не пустой
          if (!cellValue || cellValue.trim() === '') {
            return false;
          }
          
          // Проверяем, есть ли выбранный материал в массиве материалов калькуляции
          // Используем более гибкое сравнение для автоматов CHINT
          const foundMaterial = materials.find((material: any) => {
            if (material.name === cellValue) {
              return true;
            }
            
            // Для автоматов CHINT делаем более гибкое сравнение
            if (materialType === 'withdrawable_breaker' && 
                cellValue.includes('CHINT') && 
                material.name.includes('CHINT')) {
              
              // Извлекаем токи из обеих строк
              const cellCurrentMatch = cellValue.match(/(\d+)\s*A/i);
              const materialCurrentMatch = material.name.match(/(\d+)\s*A/i);
              
              if (cellCurrentMatch && materialCurrentMatch) {
                const cellCurrent = parseInt(cellCurrentMatch[1]);
                const materialCurrent = parseInt(materialCurrentMatch[1]);
                const isMatch = cellCurrent === materialCurrent;
                
                if (isMatch) {
                  // Найдено совпадение по току
                }
                
                return isMatch;
              }
            }
            
            return false;
          });
          
          if (foundMaterial) {
            return true;
          }
          
          return false;
        });


        if (foundCalculation) {
          setCalculation(foundCalculation);
        } else if (inputCalculations.length > 0) {
          const fallbackCalculation = inputCalculations.find((calc: any) => {
            const materials = calc.data?.cellConfig?.materials?.[materialType];
            return materials?.length > 0;
          });
          
          if (fallbackCalculation) {
            setCalculation(fallbackCalculation);
          } else {
            setError(`Калькуляция для ${materialType === 'withdrawable_breaker' ? 'автомата выкатного' : 'ПУ'} не найдена`);
          }
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
      if (!sectionSwitchCell || sectionSwitchCell.purpose !== 'Секционный выключатель' || !inputCell) {
        setCalculation(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem('token') || '';
        const calculations = await getCalculationsByGroup('panel-sho-70', token);
        

        // Ищем калькуляцию типа "section_switch" с учетом выбранного автомата
        const foundCalculation = calculations.find((calc: any) => {
          // Проверяем тип ячейки
          if (calc.data?.cellConfig?.type !== 'section_switch') return false;
          
          // Проверяем, есть ли материалы в калькуляции
          const hasMaterials = calc.data?.cellConfig?.materials && 
            Object.keys(calc.data.cellConfig.materials).length > 0;
          
          if (!hasMaterials) return false;
          
          // Если есть выбранный автомат, ищем калькуляцию с подходящим материалом
          if (sectionSwitchCell.breaker) {
            const materials = calc.data?.cellConfig?.materials?.molded_case_breaker;
            if (materials && materials.length > 0) {
              // Сначала ищем точное совпадение по названию
              let foundMaterial = materials.find((material: any) => 
                material.name === sectionSwitchCell.breaker
              );
              
              // Если не найден по точному названию, ищем по току
              if (!foundMaterial) {
                const cellCurrent = extractCurrentFromBreakerName(sectionSwitchCell.breaker);
                if (cellCurrent) {
                  foundMaterial = materials.find((material: any) => {
                    const materialCurrent = extractCurrentFromBreakerName(material.name);
                    return materialCurrent === cellCurrent;
                  });
                }
              }
              
              // Если найден подходящий материал, используем эту калькуляцию
              if (foundMaterial) {
                return true;
              }
            }
          }
          
          return true;
        });

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
          const calculations = await getCalculationsByGroup('panel-sho-70', token);
          
          // Ищем калькуляцию типа "section_switch" с учетом выбранного автомата
          const foundCalculation = calculations.find((calc: any) => {
            // Проверяем тип ячейки
            if (calc.data?.cellConfig?.type !== 'section_switch') return false;
            
            // Проверяем, есть ли материалы в калькуляции
            const hasMaterials = calc.data?.cellConfig?.materials && 
              Object.keys(calc.data.cellConfig.materials).length > 0;
            
            if (!hasMaterials) return false;
            
            // Если есть выбранный автомат, ищем калькуляцию с подходящим материалом
            if (sectionSwitchCell.breaker) {
              const materials = calc.data?.cellConfig?.materials?.molded_case_breaker;
              if (materials && materials.length > 0) {
                // Сначала ищем точное совпадение по названию
                let foundMaterial = materials.find((material: any) => 
                  material.name === sectionSwitchCell.breaker
                );
                
                // Если не найден по точному названию, ищем по току
                if (!foundMaterial) {
                  const cellCurrent = extractCurrentFromBreakerName(sectionSwitchCell.breaker);
                  if (cellCurrent) {
                    foundMaterial = materials.find((material: any) => {
                      const materialCurrent = extractCurrentFromBreakerName(material.name);
                      return materialCurrent === cellCurrent;
                    });
                  }
                }
                
                // Если найден подходящий материал, используем эту калькуляцию
                if (foundMaterial) {
                  return true;
                }
              }
            }
            
            return true;
          });

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
      console.log('[useRunnMeterCalculation] Starting fetch for cell:', {
        cell: cell?.purpose,
        meterType: cell?.meterType
      });

      // Проверяем, что ячейка является отходящей
      if (!cell || !cell.purpose.includes('Отходящая')) {
        console.log('[useRunnMeterCalculation] Cell is not outgoing, skipping');
        setCalculation(null);
        return;
      }

      // Если в ячейке нет ПУ, не ищем калькуляцию
      if (!cell.meterType) {
        console.log('[useRunnMeterCalculation] No meter type selected, skipping');
        setCalculation(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem('token') || '';
        const calculations = await getCalculationsByGroup('panel-sho-70', token);
        
        console.log('[useRunnMeterCalculation] Loaded calculations:', calculations.length);
        
        // Ищем калькуляцию типа "outgoing" с ПУ
        const foundCalculation = calculations.find((calc: any) => {
          console.log('[useRunnMeterCalculation] Checking calculation:', {
            name: calc.name,
            type: calc.data?.cellConfig?.type,
            hasCounter: !!calc.data?.cellConfig?.materials?.counter,
            counterLength: calc.data?.cellConfig?.materials?.counter?.length || 0
          });

          // Проверяем тип ячейки
          if (calc.data?.cellConfig?.type !== 'outgoing') {
            return false;
          }
          
          // Проверяем, есть ли counter (ПУ) в материалах
          const materials = calc.data?.cellConfig?.materials?.counter;
          
          if (!materials || !Array.isArray(materials) || materials.length === 0) {
            return false;
          }
          
          // Проверяем, совпадает ли ПУ в калькуляции с ПУ в ячейке
          const hasMatchingCounter = materials.some(material => {
            const matches = material.name === cell.meterType;
            console.log('[useRunnMeterCalculation] Checking material match:', {
              materialName: material.name,
              cellMeterType: cell.meterType,
              matches
            });
            return matches;
          });
          
          // Дополнительно проверяем, что это именно калькуляция ПУ
          // (возможно, по названию или другим характеристикам)
          const isMeterCalculation = calc.name?.toLowerCase().includes('пу') || 
                                   calc.name?.toLowerCase().includes('счетчик') ||
                                   calc.name?.toLowerCase().includes('meter');
          
          console.log('[useRunnMeterCalculation] Calculation check result:', {
            hasMatchingCounter,
            isMeterCalculation,
            finalMatch: hasMatchingCounter && isMeterCalculation
          });
          
          if (hasMatchingCounter && isMeterCalculation) {
            return true;
          }
          
          return false;
        });

        if (foundCalculation) {
          console.log('[useRunnMeterCalculation] Found calculation:', foundCalculation.name);
          setCalculation(foundCalculation);
        } else {
          console.log('[useRunnMeterCalculation] No calculation found');
          setError('Калькуляция ПУ для отходящей ячейки не найдена');
        }
      } catch (err) {
        console.error('[useRunnMeterCalculation] Error:', err);
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
      if (!cell || cell.purpose !== 'Торцевая панель') {
        setCalculation(null);
        setLoading(false);
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem('token') || '';
        const calculations = await getCalculationsByGroup('panel-sho-70', token);
        
        // Ищем калькуляцию с названием "Торцевая панель" или slug "торцевая-панель"
        const foundCalculation = calculations.find((calc: any) => {
          return calc.name === 'Торцевая панель' || calc.slug === 'торцевая-панель';
        });

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
      if (!cell || !cell.purpose.includes('Отходящая')) {
        setCalculation(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem('token') || '';
        const calculations = await getCalculationsByGroup('panel-sho-70', token);
        
        // Ищем базовую калькуляцию типа "outgoing" (без ПУ)
        const foundCalculation = calculations.find((calc: any) => {
          // Проверяем тип ячейки
          if (calc.data?.cellConfig?.type !== 'outgoing') {
            return false;
          }
          
          // Ищем базовую калькуляцию (без counter материалов)
          const materials = calc.data?.cellConfig?.materials;
          if (materials?.counter && Array.isArray(materials.counter) && materials.counter.length > 0) {
            return false; // Пропускаем калькуляции с ПУ
          }
          
          return true;
        });

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
      if (!cell || !cell.purpose.includes('Отходящая')) {
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
        const calculations = await getCalculationsByGroup('panel-sho-70', token);
        
        // Ищем калькуляцию типа "outgoing" с molded_case_breaker и соответствующей глубиной
        const foundCalculation = calculations.find((calc: any) => {
          // Проверяем тип ячейки
          if (calc.data?.cellConfig?.type !== 'outgoing') return false;
          
          // Проверяем, содержит ли название калькуляции глубину корпуса
          const caseSize = caseInfo.caseSize;
          const hasCaseSize = calc.name.includes(caseSize);
          
          if (!hasCaseSize) {
            return false;
          }
          
          // Проверяем, есть ли molded_case_breaker в материалах
          const materials = calc.data?.cellConfig?.materials?.molded_case_breaker;
          
          if (!materials || !Array.isArray(materials) || materials.length === 0) {
            return false;
          }
          
          // Проверяем, есть ли хотя бы один выбранный автомат в материалах калькуляции
          const selectedAutomatons = cell.rubilniki.filter(r => r && r.trim() !== '');
          const hasMatchingAutomaton = selectedAutomatons.some(automatonName => {
            const found = materials.some(material => {
              return material.name === automatonName;
            });
            return found;
          });
          
          if (hasMatchingAutomaton) {
            return true;
          }
          
          return false;
        });

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
      if (!cell || !cell.purpose.includes('Отходящая')) {
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
        const calculations = await getCalculationsByGroup('panel-sho-70', token);
        
        // Ищем калькуляцию типа "outgoing" с withdrawable_breaker и соответствующей глубиной
        const foundCalculation = calculations.find((calc: any) => {
          // Проверяем тип ячейки
          if (calc.data?.cellConfig?.type !== 'outgoing') return false;
          
          // Проверяем, содержит ли название калькуляции глубину корпуса
          const caseSize = caseInfo.caseSize;
          const hasCaseSize = calc.name.includes(caseSize);
          
          if (!hasCaseSize) {
            return false;
          }
          
          // Проверяем, есть ли withdrawable_breaker в материалах
          const materials = calc.data?.cellConfig?.materials?.withdrawable_breaker;
          
          if (!materials || !Array.isArray(materials) || materials.length === 0) {
            return false;
          }
          
          // Проверяем, есть ли выбранный автомат в материалах калькуляции
          const hasMatchingBreaker = materials.some(material => {
            return material.name === cell.breaker;
          });
          
          if (hasMatchingBreaker) {
            return true;
          }
          
          return false;
        });

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