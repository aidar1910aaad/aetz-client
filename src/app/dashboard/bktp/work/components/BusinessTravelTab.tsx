'use client';

import { useState, useEffect } from 'react';
import { useWorkPricesStore } from '@/store/useWorkPricesStore';

interface BusinessTravelTabProps {
  isVisible: boolean;
  onTotalChange?: (total: number) => void;
  onReset?: () => void; // Добавляем callback для сброса данных
}

interface Brigade {
  name: string;
  people: number;
  days: number;
  transportTrips: number;
  accommodation: number;
  dailyAllowance: number;
  isVisible: boolean; // Добавляем флаг видимости
}

export default function BusinessTravelTab({ isVisible, onTotalChange, onReset }: BusinessTravelTabProps) {
  const workPrices = useWorkPricesStore();
  // Базовые ставки
  const mrpRate = workPrices.mrp;
  const apartmentRent = workPrices.accommodationPerDay;
  const transportRate = workPrices.transportExpenses;
  const accommodationRate = workPrices.accommodationPerDay;
  const dailyAllowanceRate = workPrices.mrp * workPrices.dailyAllowanceMultiplier;
  
  // Бригады
  const [brigades, setBrigades] = useState<Brigade[]>([
    {
      name: '1 бригада обследование',
      people: 0,
      days: 0,
      transportTrips: 0,
      accommodation: 0,
      dailyAllowance: 0,
      isVisible: false
    },
    {
      name: '2 бригада монтаж фундамента',
      people: 0,
      days: 0,
      transportTrips: 0,
      accommodation: 0,
      dailyAllowance: 0,
      isVisible: false
    },
    {
      name: '3 бригада монтаж',
      people: 0,
      days: 0,
      transportTrips: 0,
      accommodation: 0,
      dailyAllowance: 0,
      isVisible: false
    },
    {
      name: '4 бригада наладка',
      people: 0,
      days: 0,
      transportTrips: 0,
      accommodation: 0,
      dailyAllowance: 0,
      isVisible: false
    },
    {
      name: '5 бригада включение',
      people: 0,
      days: 0,
      transportTrips: 0,
      accommodation: 0,
      dailyAllowance: 0,
      isVisible: false
    },
    {
      name: '1 бригада ШМР',
      people: 0,
      days: 0,
      transportTrips: 0,
      accommodation: 0,
      dailyAllowance: 0,
      isVisible: false
    }
  ]);

  // Расчеты для каждой бригады
  const calculateBrigadeCosts = (brigade: Brigade) => {
    const transportTotal = brigade.transportTrips * transportRate;
    const accommodationTotal = brigade.accommodation * accommodationRate;
    const dailyAllowanceTotal = brigade.dailyAllowance * dailyAllowanceRate;
    
    return {
      transportTotal,
      accommodationTotal,
      dailyAllowanceTotal,
      total: transportTotal + accommodationTotal + dailyAllowanceTotal
    };
  };

  // Общая сумма (только для видимых бригад)
  const totalCost = brigades.reduce((sum, brigade) => {
    if (brigade.isVisible) {
      const costs = calculateBrigadeCosts(brigade);
      return sum + costs.total;
    }
    return sum;
  }, 0);

  // Передаем сумму командировочных в родительский компонент
  useEffect(() => {
    if (onTotalChange) {
      console.log('BusinessTravelTab: Передаем сумму командировочных:', totalCost);
      console.log('BusinessTravelTab: Видимые бригады:', brigades.filter(b => b.isVisible).map(b => ({ name: b.name, isVisible: b.isVisible })));
      onTotalChange(totalCost);
    }
  }, [totalCost, onTotalChange, brigades]);

  // Обрабатываем сброс данных при отключении командировочных
  useEffect(() => {
    if (onReset) {
      // Сбрасываем все бригады к нулевым значениям
      setBrigades(prevBrigades => 
        prevBrigades.map(brigade => ({
          ...brigade,
          people: 0,
          days: 0,
          transportTrips: 0,
          accommodation: 0,
          dailyAllowance: 0,
          isVisible: false
        }))
      );
      console.log('Все бригады сброшены к нулевым значениям');
    }
  }, [onReset]);

  // Флаг для отслеживания инициализации
  const [isInitialized, setIsInitialized] = useState(false);

  // Восстанавливаем состояние бригад из localStorage при загрузке
  useEffect(() => {
    if (typeof window !== 'undefined' && !isInitialized) {
      const saved = localStorage.getItem('businessTravelBrigades');
      if (saved) {
        try {
          const savedBrigades = JSON.parse(saved);
          // Проверяем, что восстановленные данные имеют правильную структуру
          if (Array.isArray(savedBrigades) && savedBrigades.length > 0) {
            // Проверяем, что все бригады имеют необходимые поля
            const validBrigades = savedBrigades.filter(brigade => 
              brigade && 
              typeof brigade.name === 'string' &&
              typeof brigade.people === 'number' &&
              typeof brigade.days === 'number' &&
              typeof brigade.transportTrips === 'number' &&
              typeof brigade.accommodation === 'number' &&
              typeof brigade.dailyAllowance === 'number' &&
              typeof brigade.isVisible === 'boolean'
            );
            
            if (validBrigades.length === savedBrigades.length) {
              // Пересчитываем суточные только для бригад с ненулевыми значениями
              const recalculatedBrigades = savedBrigades.map(brigade => {
                // Если и люди, и дни больше 0, пересчитываем суточные
                if (brigade.people > 0 && brigade.days > 0) {
                  return {
                    ...brigade,
                    dailyAllowance: brigade.people * brigade.days
                  };
                }
                // Иначе оставляем как есть
                return brigade;
              });
              setBrigades(recalculatedBrigades);
              console.log('Состояние бригад восстановлено из localStorage');
            } else {
              console.warn('Некоторые данные бригад повреждены, используем значения по умолчанию');
            }
          }
        } catch (error) {
          console.error('Ошибка при восстановлении состояния бригад:', error);
        }
      }
      setIsInitialized(true);
    }
  }, [isInitialized]);

  // Сохраняем состояние бригад в localStorage только после инициализации
  useEffect(() => {
    if (typeof window !== 'undefined' && isInitialized && brigades.length > 0) {
      localStorage.setItem('businessTravelBrigades', JSON.stringify(brigades));
    }
  }, [brigades, isInitialized]);

  const handleBrigadeChange = (index: number, field: keyof Brigade, value: number) => {
    setBrigades(prev => prev.map((brigade, i) => {
      if (i === index) {
        const updated = { ...brigade, [field]: value };
        
        // Пересчитываем суточные при изменении количества людей или дней
        if (field === 'people' || field === 'days') {
          updated.dailyAllowance = updated.people * updated.days;
        }
        
        // Если изменяется поле dailyAllowance напрямую, не пересчитываем
        // (это может быть нужно для ручной корректировки)
        
        return updated;
      }
      return brigade;
    }));
  };

  // Функции управления видимостью бригад
  const toggleBrigadeVisibility = (index: number) => {
    setBrigades(prevBrigades => {
      const newBrigades = [...prevBrigades];
      newBrigades[index].isVisible = !newBrigades[index].isVisible;
      return newBrigades;
    });
  };

  // Функция для сброса данных командировочных (для отладки)
  const resetBusinessTravelData = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('businessTravelBrigades');
      localStorage.removeItem('businessTravelTotal');
      console.log('Данные командировочных сброшены');
    }
  };

  // Функция для принудительного пересчета суточных (для отладки)
  const recalculateAllDailyAllowances = () => {
    setBrigades(prevBrigades => 
      prevBrigades.map(brigade => {
        // Пересчитываем суточные только если есть люди и дни
        if (brigade.people > 0 && brigade.days > 0) {
          return {
            ...brigade,
            dailyAllowance: brigade.people * brigade.days
          };
        }
        return brigade;
      })
    );
    console.log('Суточные пересчитаны для бригад с ненулевыми значениями');
  };

  // Функция для сброса всех значений бригады к нулям
  const resetBrigadeToZero = (index: number) => {
    setBrigades(prevBrigades => 
      prevBrigades.map((brigade, i) => {
        if (i === index) {
          return {
            ...brigade,
            people: 0,
            days: 0,
            transportTrips: 0,
            accommodation: 0,
            dailyAllowance: 0
          };
        }
        return brigade;
      })
    );
    console.log(`Бригада ${index} сброшена к нулевым значениям`);
  };

  const addBrigade = (index: number) => {
    setBrigades(prevBrigades => {
      const newBrigades = [...prevBrigades];
      newBrigades[index].isVisible = true;
      return newBrigades;
    });
  };

  const removeBrigade = (index: number) => {
    setBrigades(prevBrigades => {
      const newBrigades = [...prevBrigades];
      newBrigades[index].isVisible = false;
      return newBrigades;
    });
  };

  if (!isVisible) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
      <h3 className="text-lg font-medium text-gray-900 mb-6">
        Командировочные расходы
      </h3>
      
      <div className="space-y-6">
        {/* Базовые ставки */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-[#8eba1e]/10 rounded-lg">
          <div className="text-center p-3 bg-white rounded-lg border border-[#8eba1e]/20">
            <div className="text-sm text-gray-600 mb-1">МРП, тг</div>
            <div className="font-bold text-lg text-gray-900">{mrpRate.toLocaleString()}</div>
          </div>
          <div className="text-center p-3 bg-white rounded-lg border border-[#8eba1e]/20">
            <div className="text-sm text-gray-600 mb-1">Аренда квартиры, тг</div>
            <div className="font-bold text-lg text-gray-900">{apartmentRent.toLocaleString()}</div>
          </div>
          <div className="text-center p-3 bg-white rounded-lg border border-[#8eba1e]/20">
            <div className="text-sm text-gray-600 mb-1">кол-во МРП</div>
            <div className="font-bold text-lg text-gray-900">{workPrices.dailyAllowanceMultiplier}</div>
          </div>
        </div>

        {/* Таблица бригад */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm border border-[#8eba1e]/20 rounded-lg overflow-hidden">
            <thead className="bg-[#8eba1e]/10">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-900 min-w-[200px]">Бригада</th>
                <th className="px-3 py-3 text-center font-semibold text-gray-900 min-w-[100px]">Кол-во человек</th>
                <th className="px-3 py-3 text-center font-semibold text-gray-900 min-w-[100px]">Кол-во дней</th>
                <th className="px-3 py-3 text-center font-semibold text-gray-900 min-w-[150px]">Транспортные расходы</th>
                <th className="px-3 py-3 text-center font-semibold text-gray-900 min-w-[120px]">Проживание</th>
                <th className="px-3 py-3 text-center font-semibold text-gray-900 min-w-[120px]">Суточные</th>
                <th className="px-3 py-3 text-center font-semibold text-gray-900 min-w-[120px]">Итого</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#8eba1e]/20">
              {/* Фундамент */}
              <tr className="bg-[#8eba1e]/10">
                <td className="px-4 py-3 font-semibold text-gray-900" colSpan={7}>
                  Фундамент
                </td>
              </tr>
              
              {/* Показываем только видимые бригады фундамента */}
              {brigades.slice(0, 2).map((brigade, index) => {
                if (!brigade.isVisible) return null;
                
                const costs = calculateBrigadeCosts(brigade);
                return (
                  <tr key={index} className="hover:bg-[#8eba1e]/5">
                    <td className="px-4 py-3 text-gray-900 pl-8 font-medium">
                      <div className="flex items-center justify-between">
                        <span>{brigade.name}</span>
                        <button
                          onClick={() => removeBrigade(index)}
                          className="ml-2 text-[#8eba1e] hover:text-[#7aa31a] text-sm"
                          title="Удалить бригаду"
                        >
                          ✕
                        </button>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-center">
                      <div className="h-16 flex items-center justify-center">
                        <input
                          type="number"
                          value={brigade.people}
                          onChange={(e) => handleBrigadeChange(index, 'people', Number(e.target.value))}
                          className="w-full max-w-[80px] px-2 py-1 text-center border border-gray-300 rounded text-sm focus:ring-2 focus:ring-[#8eba1e] focus:border-[#8eba1e]"
                          min="0"
                        />
                      </div>
                    </td>
                    <td className="px-3 py-3 text-center">
                      <div className="h-16 flex items-center justify-center">
                        <input
                          type="number"
                          value={brigade.days}
                          onChange={(e) => handleBrigadeChange(index, 'days', Number(e.target.value))}
                          className="w-full max-w-[80px] px-2 py-1 text-center border border-gray-300 rounded text-sm focus:ring-2 focus:ring-[#8eba1e] focus:border-[#8eba1e]"
                          min="0"
                        />
                      </div>
                    </td>
                    <td className="px-3 py-3 text-center">
                      <div className="h-16 flex items-center justify-center">
                        <div className="flex items-center justify-center gap-1">
                          <input
                            type="number"
                            value={brigade.transportTrips}
                            onChange={(e) => handleBrigadeChange(index, 'transportTrips', Number(e.target.value))}
                            className="w-full max-w-[80px] px-2 py-1 text-center border border-gray-300 rounded text-sm focus:ring-2 focus:ring-[#8eba1e] focus:border-[#8eba1e]"
                            min="0"
                          />
                          <span className="text-xs text-gray-500">× {transportRate.toLocaleString()}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-center">
                      <div className="h-16 flex items-center justify-center">
                        <div className="flex items-center justify-center gap-1">
                          <input
                            type="number"
                            value={brigade.accommodation}
                            onChange={(e) => handleBrigadeChange(index, 'accommodation', Number(e.target.value))}
                            className="w-full max-w-[80px] px-2 py-1 text-center border border-gray-300 rounded text-sm focus:ring-2 focus:ring-[#8eba1e] focus:border-[#8eba1e]"
                            min="0"
                          />
                          <span className="text-xs text-gray-500">× {accommodationRate.toLocaleString()}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-center">
                      <div className="h-16 flex items-center justify-center">
                        <div className="flex items-center justify-center gap-1">
                          <span className="text-xs text-gray-500 font-medium">{brigade.dailyAllowance}</span>
                          <span className="text-xs text-gray-500">× {dailyAllowanceRate.toLocaleString()}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-center">
                      <div className="h-16 flex items-center justify-center">
                        <div className="font-bold text-lg text-gray-900">
                          {costs.total.toLocaleString()} ₸
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
              
              {/* Кнопки для добавления скрытых бригад фундамента */}
              {brigades.slice(0, 2).map((brigade, index) => {
                if (brigade.isVisible) return null;
                
                return (
                  <tr key={`add-${index}`} className="hover:bg-[#8eba1e]/5">
                    <td className="px-4 py-3 text-gray-900 pl-8" colSpan={7}>
                      <button
                        onClick={() => addBrigade(index)}
                        className="flex items-center gap-2 text-[#8eba1e] hover:text-[#7aa31a] font-medium"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Добавить {brigade.name}
                      </button>
                    </td>
                  </tr>
                );
              })}
              
              {/* Монтаж оборудования */}
              <tr className="bg-[#8eba1e]/10">
                <td className="px-4 py-3 font-semibold text-gray-900" colSpan={7}>
                  Монтаж оборудования
                </td>
              </tr>
              
              {/* Показываем только видимые бригады монтажа оборудования */}
              {brigades.slice(2, 5).map((brigade, index) => {
                if (!brigade.isVisible) return null;
                
                const costs = calculateBrigadeCosts(brigade);
                const actualIndex = index + 2;
                return (
                  <tr key={actualIndex} className="hover:bg-[#8eba1e]/5">
                    <td className="px-4 py-3 text-gray-900 pl-8 font-medium">
                      <div className="flex items-center justify-between">
                        <span>{brigade.name}</span>
                        <button
                          onClick={() => removeBrigade(actualIndex)}
                          className="ml-2 text-[#8eba1e] hover:text-[#7aa31a] text-sm"
                          title="Удалить бригаду"
                        >
                          ✕
                        </button>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-center">
                      <div className="h-16 flex items-center justify-center">
                        <input
                          type="number"
                          value={brigade.people}
                          onChange={(e) => handleBrigadeChange(actualIndex, 'people', Number(e.target.value))}
                          className="w-full max-w-[80px] px-2 py-1 text-center border border-gray-300 rounded text-sm focus:ring-2 focus:ring-[#8eba1e] focus:border-[#8eba1e]"
                          min="0"
                        />
                      </div>
                    </td>
                    <td className="px-3 py-3 text-center">
                      <div className="h-16 flex items-center justify-center">
                        <input
                          type="number"
                          value={brigade.days}
                          onChange={(e) => handleBrigadeChange(actualIndex, 'days', Number(e.target.value))}
                          className="w-full max-w-[80px] px-2 py-1 text-center border border-gray-300 rounded text-sm focus:ring-2 focus:ring-[#8eba1e] focus:border-[#8eba1e]"
                          min="0"
                        />
                      </div>
                    </td>
                    <td className="px-3 py-3 text-center">
                      <div className="h-16 flex items-center justify-center">
                        <div className="flex items-center justify-center gap-1">
                          <input
                            type="number"
                            value={brigade.transportTrips}
                            onChange={(e) => handleBrigadeChange(actualIndex, 'transportTrips', Number(e.target.value))}
                            className="w-full max-w-[80px] px-2 py-1 text-center border border-gray-300 rounded text-sm focus:ring-2 focus:ring-[#8eba1e] focus:border-[#8eba1e]"
                            min="0"
                          />
                          <span className="text-xs text-gray-500">× {transportRate.toLocaleString()}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-center">
                      <div className="h-16 flex items-center justify-center">
                        <div className="flex items-center justify-center gap-1">
                          <input
                            type="number"
                            value={brigade.accommodation}
                            onChange={(e) => handleBrigadeChange(actualIndex, 'accommodation', Number(e.target.value))}
                            className="w-full max-w-[80px] px-2 py-1 text-center border border-gray-300 rounded text-sm focus:ring-2 focus:ring-[#8eba1e] focus:border-[#8eba1e]"
                            min="0"
                          />
                          <span className="text-xs text-gray-500">× {accommodationRate.toLocaleString()}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-center">
                      <div className="h-16 flex items-center justify-center">
                        <div className="flex items-center justify-center gap-1">
                          <span className="text-xs text-gray-500 font-medium">{brigade.dailyAllowance}</span>
                          <span className="text-xs text-gray-500">× {dailyAllowanceRate.toLocaleString()}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-center">
                      <div className="h-16 flex items-center justify-center">
                        <div className="font-bold text-lg text-gray-900">
                          {costs.total.toLocaleString()} ₸
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
              
              {/* Кнопки для добавления скрытых бригад монтажа оборудования */}
              {brigades.slice(2, 5).map((brigade, index) => {
                if (brigade.isVisible) return null;
                
                const actualIndex = index + 2;
                return (
                  <tr key={`add-${actualIndex}`} className="hover:bg-[#8eba1e]/5">
                    <td className="px-4 py-3 text-gray-900 pl-8" colSpan={7}>
                      <button
                        onClick={() => addBrigade(actualIndex)}
                        className="flex items-center gap-2 text-[#8eba1e] hover:text-[#7aa31a] font-medium"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Добавить {brigade.name}
                      </button>
                    </td>
                  </tr>
                );
              })}
              
              {/* ШМР */}
              <tr className="bg-[#8eba1e]/10">
                <td className="px-4 py-3 font-semibold text-gray-900" colSpan={7}>
                  ШМР
                </td>
              </tr>
              
              {/* Кнопка для добавления скрытой бригады ШМР */}
              {brigades.slice(5).map((brigade, index) => {
                if (brigade.isVisible) return null;
                
                const actualIndex = index + 5;
                return (
                  <tr key={`add-${actualIndex}`} className="hover:bg-[#8eba1e]/5">
                    <td className="px-4 py-3 text-gray-900 pl-8" colSpan={7}>
                      <button
                        onClick={() => addBrigade(actualIndex)}
                        className="flex items-center gap-2 text-[#8eba1e] hover:text-[#7aa31a] font-medium"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Добавить {brigade.name}
                      </button>
                    </td>
                  </tr>
                );
              })}
              
              {/* Показываем только видимую бригаду ШМР */}
              {brigades.slice(5).map((brigade, index) => {
                if (!brigade.isVisible) return null;
                
                const costs = calculateBrigadeCosts(brigade);
                const actualIndex = index + 5;
                return (
                  <tr key={actualIndex} className="hover:bg-[#8eba1e]/5">
                    <td className="px-4 py-3 text-gray-900 pl-8 font-medium">
                      <div className="flex items-center justify-between">
                        <span>{brigade.name}</span>
                        <button
                          onClick={() => removeBrigade(actualIndex)}
                          className="ml-2 text-[#8eba1e] hover:text-[#7aa31a] text-sm"
                          title="Удалить бригаду"
                        >
                          ✕
                        </button>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-center">
                      <div className="h-16 flex items-center justify-center">
                        <input
                          type="number"
                          value={brigade.people}
                          onChange={(e) => handleBrigadeChange(actualIndex, 'people', Number(e.target.value))}
                          className="w-full max-w-[80px] px-2 py-1 text-center border border-gray-300 rounded text-sm focus:ring-2 focus:ring-[#8eba1e] focus:border-[#8eba1e]"
                          min="0"
                        />
                      </div>
                    </td>
                    <td className="px-3 py-3 text-center">
                      <div className="h-16 flex items-center justify-center">
                        <input
                          type="number"
                          value={brigade.days}
                          onChange={(e) => handleBrigadeChange(actualIndex, 'days', Number(e.target.value))}
                          className="w-full max-w-[80px] px-2 py-1 text-center border border-gray-300 rounded text-sm focus:ring-2 focus:ring-[#8eba1e] focus:border-[#8eba1e]"
                          min="0"
                        />
                      </div>
                    </td>
                    <td className="px-3 py-3 text-center">
                      <div className="h-16 flex items-center justify-center">
                        <div className="flex items-center justify-center gap-1">
                          <input
                            type="number"
                            value={brigade.transportTrips}
                            onChange={(e) => handleBrigadeChange(actualIndex, 'transportTrips', Number(e.target.value))}
                            className="w-full max-w-[80px] px-2 py-1 text-center border border-gray-300 rounded text-sm focus:ring-2 focus:ring-[#8eba1e] focus:border-[#8eba1e]"
                            min="0"
                          />
                          <span className="text-xs text-gray-500">× {transportRate.toLocaleString()}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-center">
                      <div className="h-16 flex items-center justify-center">
                        <div className="flex items-center justify-center gap-1">
                          <input
                            type="number"
                            value={brigade.accommodation}
                            onChange={(e) => handleBrigadeChange(actualIndex, 'accommodation', Number(e.target.value))}
                            className="w-full max-w-[80px] px-2 py-1 text-center border border-gray-300 rounded text-sm focus:ring-2 focus:ring-[#8eba1e] focus:border-[#8eba1e]"
                            min="0"
                          />
                          <span className="text-xs text-gray-500">× {accommodationRate.toLocaleString()}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-center">
                      <div className="h-16 flex items-center justify-center">
                        <div className="flex items-center justify-center gap-1">
                          <span className="text-xs text-gray-500 font-medium">{brigade.dailyAllowance}</span>
                          <span className="text-xs text-gray-500">× {dailyAllowanceRate.toLocaleString()}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-center">
                      <div className="h-16 flex items-center justify-center">
                        <div className="font-bold text-lg text-gray-900">
                          {costs.total.toLocaleString()} ₸
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-[#8eba1e]/10">
              <tr>
                <td colSpan={6} className="px-4 py-4 text-right font-bold text-gray-900 text-lg">
                  Итого:
                </td>
                <td className="px-3 py-4 text-center">
                  <div className="font-bold text-xl text-white bg-[#8eba1e] px-4 py-2 rounded-lg">
                    {totalCost.toLocaleString()} ₸
                  </div>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
        
        <div className="mt-4 p-4 bg-[#8eba1e]/10 rounded-lg border border-[#8eba1e]/20">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-[#8eba1e]/20 rounded-lg">
              <svg className="w-5 h-5 text-[#8eba1e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Автоматический расчет</h4>
              <div className="text-sm text-gray-700 space-y-1">
                <p><strong>Транспортные расходы:</strong> Количество рейсов × {transportRate.toLocaleString()} ₸</p>
                <p><strong>Проживание:</strong> Количество дней × {accommodationRate.toLocaleString()} ₸</p>
                <p><strong>Суточные:</strong> (Количество человек × Количество дней) × {dailyAllowanceRate.toLocaleString()} ₸</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}