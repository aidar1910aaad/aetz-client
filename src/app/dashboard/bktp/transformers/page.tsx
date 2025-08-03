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

export default function TransformerConfigurator() {
  const router = useRouter();
  const { selectedTransformer, setTransformer, skipTransformer } = useTransformerStore();
  const [transformers, setTransformers] = useState<Transformer[]>([]);
  const [loading, setLoading] = useState(true);

  const [selected, setSelected] = useState({
    voltage: selectedTransformer?.voltage ?? null,
    type: selectedTransformer?.type ?? null,
    power: selectedTransformer?.power ?? null,
    manufacturer: selectedTransformer?.manufacturer ?? null,
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

  const wasTransformerChoiceMade = skip || selectedTransformer !== null;

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

  // Получаем уникальные значения для фильтров
  const voltages = [...new Set(transformers.map((t) => t.voltage))].sort(
    (a, b) => Number(a) - Number(b)
  );
  const types = [...new Set(transformers.map((t) => t.type))];
  const powers = [...new Set(transformers.map((t) => t.power))].sort((a, b) => a - b);
  const manufacturers = [...new Set(transformers.map((t) => t.manufacturer))];

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

  const isComplete = Object.values(selected).every((v) => v !== null);

  const matched = transformers.find(
    (t) =>
      t.voltage === selected.voltage &&
      t.type === selected.type &&
      t.power === selected.power &&
      t.manufacturer === selected.manufacturer
  );

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
      });
    }
    router.push('/dashboard/bktp/rusn');
  };

  if (loading) {
    return <TransformerLoading />;
  }

  return (
    <div className="h-[calc(100vh-110px)] overflow-y-auto px-6 py-2 bg-gray-50">
      <div className="px-6 pt-6 pb-2">
        <Breadcrumbs />
        <h2 className="text-2xl font-semibold mt-2">Силовой трансформатор</h2>
        {!wasTransformerChoiceMade && (
          <>
            <p className="mt-2 text-sm text-gray-600 mb-2">Будет ли трансформатор?</p>
            <div className="flex gap-4 mb-4">
              <button
                onClick={() => setSkip(false)}
                className={`px-4 py-2 rounded text-sm font-medium border ${
                  !skip
                    ? 'bg-[#3A55DF] text-white border-[#3A55DF]'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'
                }`}
              >
                Да
              </button>
              <button
                onClick={() => {
                  setSkip(true);
                  localStorage.setItem('transformer-skip', 'true');
                  setSelected({ voltage: null, type: null, power: null, manufacturer: null });
                  setQuantity(2);
                  skipTransformer();
                }}
                className={`px-4 py-2 rounded text-sm font-medium border ${
                  skip
                    ? 'bg-red-100 text-red-700 border-red-300'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'
                }`}
              >
                Нет
              </button>
            </div>
          </>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {!skip && (
          <>
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
            <TransformerQuantityInput value={quantity} onChange={setQuantity} disabled={skip} />
            {isComplete && matched && (
              <TransformerSummary model={matched.model} price={matched.price} quantity={quantity} />
            )}
          </>
        )}
        {skip && <TransformerSkipBlock />}
      </div>

      <div className="p-4 bg-white w-[400px] ">
        <button
          onClick={handleSubmit}
          className="w-full px-6 py-3 rounded-lg text-lg font-medium text-white bg-[#3A55DF] hover:bg-[#2e46c5] transition-colors"
        >
          {skip ? 'Далее' : 'Добавить в спецификацию'}
        </button>
      </div>
    </div>
  );
}
