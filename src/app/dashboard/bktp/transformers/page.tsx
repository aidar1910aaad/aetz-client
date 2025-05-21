'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { transformerData } from '@/data/mock-transformers';
import { useTransformerStore } from '@/store/useTransformerStore';
import Breadcrumbs from '@/components/Breadcrumbs/Breadcrumbs';

const voltages = [10, 20];
const types = ['ТМГ', 'ТСЛ'];
const powers = [25, 40, 63, 100, 160, 250, 400, 630, 1000, 1250, 1600, 2000, 2500, 3150, 4000];
const manufacturers = ['Alageum', 'ZBB'];

export default function TransformerConfigurator() {
  const router = useRouter();
  const { selectedTransformer, setTransformer, skipTransformer } = useTransformerStore();

  const [selected, setSelected] = useState({
    voltage: selectedTransformer?.voltage ?? null,
    type: selectedTransformer?.type ?? null,
    power: selectedTransformer?.power ?? null,
    manufacturer: selectedTransformer?.manufacturer ?? null,
  });

  const [quantity, setQuantity] = useState(selectedTransformer?.quantity ?? 2);
  const [skip, setSkip] = useState(selectedTransformer === null);

  const handleSelect = <T extends keyof typeof selected>(key: T, value: (typeof selected)[T]) => {
    setSelected((prev) => ({
      ...prev,
      [key]: prev[key] === value ? null : value,
    }));
  };

  const isComplete = Object.values(selected).every((v) => v !== null);

  const matched = transformerData.find(
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
      setTransformer({ ...matched, quantity });
    }
    router.push('/dashboard/bktp/rusn');
  };

  const renderButtons = <T extends string | number>(items: T[], key: keyof typeof selected) => (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => {
        const isAvailable = transformerData.some((t) => {
          const temp = { ...selected, [key]: item };
          return transformerData.some(
            (d) =>
              (temp.voltage === null || d.voltage === temp.voltage) &&
              (temp.type === null || d.type === temp.type) &&
              (temp.power === null || d.power === temp.power) &&
              (temp.manufacturer === null || d.manufacturer === temp.manufacturer)
          );
        });

        return (
          <button
            key={item}
            onClick={() => handleSelect(key, item)}
            disabled={!isAvailable || skip}
            className={`px-4 py-2 rounded-full border font-medium text-sm transition-all duration-200
              ${
                selected[key] === item
                  ? 'bg-[#3A55DF] text-white border-[#3A55DF]'
                  : !isAvailable || skip
                  ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                  : 'bg-white hover:bg-[#E8F0FF] text-gray-800 border-gray-300'
              }`}
          >
            {item}
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="h-[calc(100vh-110px)] overflow-y-auto px-6 py-2 bg-gray-50">
      <div className="px-6 pt-6 pb-2">
        <Breadcrumbs />
        <h2 className="text-2xl font-semibold mt-2">Силовой трансформатор</h2>

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
              skipTransformer(); // очищает стор
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
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        <div>
          <h3 className="font-medium mb-1">Напряжение (кВ)</h3>
          {renderButtons(voltages, 'voltage')}
        </div>

        <div>
          <h3 className="font-medium mb-1">Тип</h3>
          {renderButtons(types, 'type')}
        </div>

        <div>
          <h3 className="font-medium mb-1">Мощность (кВА)</h3>
          {renderButtons(powers, 'power')}
        </div>

        <div>
          <h3 className="font-medium mb-1">Производитель</h3>
          {renderButtons(manufacturers, 'manufacturer')}
        </div>

        <div className="flex items-center gap-4">
          <label className="font-medium text-sm">Количество трансформаторов</label>
          <input
            type="number"
            min={1}
            disabled={skip}
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
            className="w-24 border px-3 py-1 rounded"
          />
        </div>

        {!skip && isComplete && matched && (
          <div className="bg-gray-50 border rounded p-4 space-y-1 text-sm">
            <p>
              <span className="font-medium">Спецификация:</span> {matched.spec}
            </p>
            <p>
              <span className="font-medium">Цена за 1 шт:</span> {matched.price.toLocaleString()} тг
            </p>
            <p>
              <span className="font-medium">Количество:</span> {quantity}
            </p>
            <p>
              <span className="font-medium">Сумма:</span>{' '}
              {(matched.price * quantity).toLocaleString()} тг
            </p>
          </div>
        )}
      </div>

      <div className="p-4 bg-white border-t">
        <button
          onClick={handleSubmit}
          className="w-full py-2 rounded text-white bg-[#3A55DF] hover:bg-[#2e46c5] transition"
        >
          Добавить в спецификацию
        </button>
      </div>
    </div>
  );
}
