'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { transformersApi, Transformer } from '@/api/transformers';
import { useTransformerStore } from '@/store/useTransformerStore';
import Breadcrumbs from '@/components/Breadcrumbs/Breadcrumbs';
import { showToast } from '@/shared/modals/ToastProvider';
import { TransformerFilters } from '@/components/Transformers/TransformerFilters';
import { TransformerSummary } from '@/components/Transformers/TransformerSummary';
import { TransformerSkipBlock } from '@/components/Transformers/TransformerSkipBlock';
import { TransformerQuantityInput } from '@/components/Transformers/TransformerQuantityInput';
import { TransformerLoading } from '@/components/Transformers/TransformerLoading';
import { getCalculationsByGroup, Calculation } from '@/api/calculations';
import { useAuth } from '@/hooks/useAuth';
import { BusbarConfiguration } from '@/components/Transformers/BusbarConfiguration';

export default function TransformerConfigurator() {
  const router = useRouter();
  const { token } = useAuth();
  const { selectedTransformer, setTransformer, skipTransformer } = useTransformerStore();
  const [transformers, setTransformers] = useState<Transformer[]>([]);
  const [loading, setLoading] = useState(true);
  const [calculations, setCalculations] = useState<Calculation[]>([]);
  const [selectedUstCalculations, setSelectedUstCalculations] = useState<Calculation[]>([]);
  const [busbarUstData, setBusbarUstData] = useState<{
    mainUstWeight: number;
    zeroUstWeight: number;
    material: string;
  } | null>(null);

  const [selected, setSelected] = useState({
    voltage: selectedTransformer?.voltage ?? null,
    type: selectedTransformer?.type ?? null,
    power: selectedTransformer?.power ?? null,
    manufacturer: selectedTransformer?.manufacturer ?? null,
    busbars: selectedTransformer?.busbars ?? null, // Сборные шины для РУНН
  });

  const [quantity, setQuantity] = useState(selectedTransformer?.quantity ?? 2);
  const [skip, setSkip] = useState(() => {
    if (selectedTransformer !== null) return false;
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('transformer-skip');
      return stored === 'true';
    }
    return false;
  });

  // Загрузка трансформаторов
  useEffect(() => {
    const loadTransformers = async () => {
      try {
        setLoading(true);
        const data = await transformersApi.getAll();
        setTransformers(data);
      } catch {
        showToast('Ошибка при загрузке трансформаторов', 'error');
      } finally {
        setLoading(false);
      }
    };
    loadTransformers();
  }, []);

  // Загрузка калькуляций группы "ust"
  useEffect(() => {
    const loadCalculations = async () => {
      if (!token) return;
      
      try {
        const data = await getCalculationsByGroup('ust', token);
        setCalculations(data);
      } catch (error) {
        console.error('❌ Ошибка загрузки калькуляций УСТ:', error);
        showToast('Ошибка при загрузке калькуляций', 'error');
      }
    };
    
    loadCalculations();
  }, [token]);

  // Синхронизация состояния skip с localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (skip) {
        localStorage.setItem('transformer-skip', 'true');
      } else {
        localStorage.removeItem('transformer-skip');
      }
    }
  }, [skip]);

  // Получаем уникальные значения для фильтров
  const voltages = [...new Set(transformers.map((t) => t.voltage))].sort(
    (a, b) => Number(a) - Number(b)
  );
  const types = [...new Set(transformers.map((t) => t.type))];
  const powers = [...new Set(transformers.map((t) => t.power))].sort((a, b) => a - b);
  const manufacturers = [...new Set(transformers.map((t) => t.manufacturer))];
  const busbarsOptions = ['Медь', 'Алюминий']; // Опции для сборных шин

  // Вычисляем доступность для каждого фильтра
  const availableVoltages = useMemo(() => {
    return voltages.filter((v) =>
      transformers.some(
        (t) =>
          t.voltage === v &&
          (selected.type === null || t.type === selected.type) &&
          (selected.power === null || t.power === selected.power) &&
          (selected.manufacturer === null || t.manufacturer === selected.manufacturer)
      )
    );
  }, [voltages, transformers, selected]);
  const disabledVoltages = voltages.filter((v) => !availableVoltages.includes(v));

  const availableTypes = useMemo(() => {
    return types.filter((type) =>
      transformers.some(
        (t) =>
          t.type === type &&
          (selected.voltage === null || t.voltage === selected.voltage) &&
          (selected.power === null || t.power === selected.power) &&
          (selected.manufacturer === null || t.manufacturer === selected.manufacturer)
      )
    );
  }, [types, transformers, selected]);
  const disabledTypes = types.filter((type) => !availableTypes.includes(type));

  const availablePowers = useMemo(() => {
    return powers.filter((power) =>
      transformers.some(
        (t) =>
          t.power === power &&
          (selected.voltage === null || t.voltage === selected.voltage) &&
          (selected.type === null || t.type === selected.type) &&
          (selected.manufacturer === null || t.manufacturer === selected.manufacturer)
      )
    );
  }, [powers, transformers, selected]);
  const disabledPowers = powers.filter((power) => !availablePowers.includes(power));

  const availableManufacturers = useMemo(() => {
    return manufacturers.filter((man) =>
      transformers.some(
        (t) =>
          t.manufacturer === man &&
          (selected.voltage === null || t.voltage === selected.voltage) &&
          (selected.type === null || t.type === selected.type) &&
          (selected.power === null || t.power === selected.power)
      )
    );
  }, [manufacturers, transformers, selected]);
  const disabledManufacturers = manufacturers.filter(
    (man) => !availableManufacturers.includes(man)
  );

  const handleSelect = <T extends keyof typeof selected>(key: T, value: (typeof selected)[T]) => {
    setSelected((prev) => ({
      ...prev,
      [key]: prev[key] === value ? null : value,
    }));
  };

  // Автоматический выбор калькуляции УСТ на основе выбранного напряжения
  useEffect(() => {
    if (selected.voltage && calculations.length > 0) {
      let voltageKey = null;
      
      // Определяем ключ напряжения для поиска УСТ
      if (selected.voltage === '10') {
        voltageKey = '10кВ';
      } else if (selected.voltage === '20') {
        voltageKey = '20кВ';
      }
      
      if (voltageKey) {
        const matchingCalculation = calculations.find(calc => 
          calc.name.includes(voltageKey) || calc.name.includes(`УСТ-${voltageKey}`)
        );
        if (matchingCalculation) {
          setSelectedUstCalculations([matchingCalculation]);
          console.log(`✅ Автоматически выбрана калькуляция УСТ для ${voltageKey}:`, matchingCalculation.name);
        }
      }
    } else {
      setSelectedUstCalculations([]);
    }
  }, [selected.voltage, calculations]);

  const isComplete = Object.values(selected).every((v) => v !== null);

  const matched = transformers.find(
    (t) =>
      t.voltage === selected.voltage &&
      t.type === selected.type &&
      t.power === selected.power &&
      t.manufacturer === selected.manufacturer
  );

  // Автоматическое подтягивание УСТ-0.4кВ когда все параметры выбраны
  useEffect(() => {
    console.log('🔍 Проверка подтягивания УСТ-0.4кВ:', {
      isComplete,
      matched: !!matched,
      calculationsCount: calculations.length,
      selectedUstCalculationsCount: selectedUstCalculations.length
    });

    if (isComplete && matched && calculations.length > 0) {
      const ust04Calculation = calculations.find(calc => 
        calc.name.includes('0.4кВ') || calc.name.includes('УСТ-0.4кВ')
      );
      
      console.log('🔍 Поиск УСТ-0.4кВ:', {
        found: !!ust04Calculation,
        calculation: ust04Calculation ? {
          id: ust04Calculation.id,
          name: ust04Calculation.name,
          hasData: !!ust04Calculation.data
        } : null
      });
      
      if (ust04Calculation) {
        // Добавляем УСТ-0.4кВ к существующим УСТ калькуляциям
        setSelectedUstCalculations(prev => {
          const hasUst04 = prev.some(calc => 
            calc.name.includes('0.4кВ') || calc.name.includes('УСТ-0.4кВ')
          );
          console.log('🔍 Проверка существования УСТ-0.4кВ:', {
            hasUst04,
            prevCount: prev.length,
            willAdd: !hasUst04
          });
          if (!hasUst04) {
            console.log('✅ Автоматически подтянута калькуляция УСТ-0.4кВ:', ust04Calculation.name);
            return [...prev, ust04Calculation];
          }
          return prev;
        });
      } else {
        console.log('❌ УСТ-0.4кВ не найдена в доступных калькуляциях');
      }
    }
  }, [isComplete, matched, calculations]);

  const handleSubmit = () => {
    if (skip) {
      skipTransformer();
    } else if (matched) {
      setTransformer({
        id: matched.id,
        model: matched.model,
        voltage: matched.voltage,
        type: matched.type,
        power: matched.power,
        manufacturer: matched.manufacturer,
        price: matched.price,
        quantity,
        busbars: selected.busbars, // Добавляем выбор сборных шин
        ustCalculation: selectedUstCalculations[0] || null, // Добавляем первую выбранную калькуляцию УСТ (для обратной совместимости)
        ustCalculations: selectedUstCalculations, // Добавляем все выбранные УСТ калькуляции
        busbarUstData: busbarUstData, // Добавляем данные о шинах для УСТ-0.4кВ
      });
      console.log('✅ Трансформатор сохранен с калькуляцией УСТ:', selectedUstCalculations[0]?.name);
    } else if (!skip && !isComplete) {
      showToast('Пожалуйста, выберите все параметры трансформатора', 'error');
      return;
    }
    router.push('/dashboard/bktp/rusn');
  };

  if (loading) {
    return <TransformerLoading />;
  }

  return (
    <div className="h-[calc(100vh-64px)] bg-white overflow-y-auto">
      <div className="p-6">
        <Breadcrumbs />
        
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-gray-100 rounded-xl">
              <svg className="w-6 h-6 text-[#8eba1e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Силовой трансформатор</h1>
              <p className="text-gray-600">Настройте параметры трансформатора</p>
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Будет ли трансформатор?</h3>
            <div className="flex gap-4">
              <button
                onClick={() => {
                  setSkip(false);
                }}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold border-2 transition-all duration-200 ${
                  !skip
                    ? 'bg-[#8eba1e] text-white border-[#8eba1e] shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300 hover:border-[#8eba1e]'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Да
              </button>
              <button
                onClick={() => {
                  setSkip(true);
                  setSelected({ voltage: null, type: null, power: null, manufacturer: null, busbars: null });
                  setQuantity(2);
                }}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold border-2 transition-all duration-200 ${
                  skip
                    ? 'bg-red-100 text-red-700 border-red-300 shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300 hover:border-red-300'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Нет
              </button>
            </div>
          </div>
        </div>


        <div className="space-y-6">
          {!skip && (
            <>
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-lg">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <svg className="w-5 h-5 text-[#8eba1e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Параметры трансформатора</h3>
                </div>
                
                <div className="space-y-6">
                  <TransformerFilters
                    label="Напряжение (кВ)"
                    items={voltages}
                    selected={selected.voltage}
                    onSelect={(v) => handleSelect('voltage', v)}
                    disabled={skip}
                    disabledItems={disabledVoltages}
                  />
                  <TransformerFilters
                    label="Тип"
                    items={types}
                    selected={selected.type}
                    onSelect={(v) => handleSelect('type', v)}
                    disabled={skip}
                    disabledItems={disabledTypes}
                  />
                  <TransformerFilters
                    label="Мощность (кВА)"
                    items={powers}
                    selected={selected.power}
                    onSelect={(v) => handleSelect('power', v)}
                    disabled={skip}
                    disabledItems={disabledPowers}
                  />
                  <TransformerFilters
                    label="Производитель"
                    items={manufacturers}
                    selected={selected.manufacturer}
                    onSelect={(v) => handleSelect('manufacturer', v)}
                    disabled={skip}
                    disabledItems={disabledManufacturers}
                  />
                  <TransformerFilters
                    label="Сборные шины для РУНН"
                    items={busbarsOptions}
                    selected={selected.busbars}
                    onSelect={(v) => handleSelect('busbars', v)}
                    disabled={skip}
                  />
                  <TransformerQuantityInput value={quantity} onChange={setQuantity} disabled={skip} />
                </div>
              </div>
              
              {isComplete && matched && (
                <>
                  {console.log('🔍 Данные для TransformerSummary:', {
                    model: matched.model,
                    price: matched.price,
                    quantity,
                    selectedUstCalculations: selectedUstCalculations.length,
                    selectedUstCalculationsData: selectedUstCalculations
                  })}
                  <TransformerSummary 
                    model={matched.model} 
                    price={matched.price} 
                    quantity={quantity} 
                    busbars={selected.busbars}
                    ustCalculations={selectedUstCalculations}
                    busbarUstData={busbarUstData}
                  />
                </>
              )}
              
              {/* Показываем конфигурацию сборных шин в реальном времени */}
              {selected.power && selected.busbars && (
                <BusbarConfiguration 
                  key={`${selected.power}-${selected.busbars}`}
                  transformerPower={selected.power}
                  transformerBusbars={selected.busbars}
                  onUstDataChange={setBusbarUstData}
                />
              )}
            </>
          )}
          {skip && <TransformerSkipBlock />}
        </div>

        <div className="pt-6 pb-8">
          <button
            onClick={handleSubmit}
            disabled={!skip && !isComplete}
            className={`flex items-center gap-2 px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-200 ${
              skip || isComplete
                ? 'bg-[#8eba1e] hover:bg-[#7aa31a] text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {skip ? 'Далее' : 'Добавить в спецификацию'}
          </button>
        </div>
      </div>
    </div>
  );
}
