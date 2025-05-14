'use client';

import { useRunnStore } from '@/store/useRunnStore';
import RunnCellTable from './RunnCellTable';
import TogglerWithInput from './TogglerWithInput';

const withdrawableOptions = ['Чинт', 'Metasol', 'Astels', 'Hyundai'];
const moldedOptions = ['КЭАЗ', 'Чинт', 'Metasol', 'Astels', 'Hyundai'];
const meterOptions = ['Сайман', 'Меркурий'];

export default function RunnGlobalConfig({ availableCells }: { availableCells: string[] }) {
  const { global, setGlobal } = useRunnStore();

  return (
    <section className="flex flex-col gap-6 mb-4">
      <div>
        <label className="block mb-1 font-medium">Автомат выкатной</label>
        <select
          value={global.withdrawableBreaker || ''}
          onChange={(e) => setGlobal('withdrawableBreaker', e.target.value)}
          className="w-full border px-3 py-2 rounded"
        >
          <option value="">Выберите</option>
          {withdrawableOptions.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block mb-1 font-medium">Автомат литой корпус</label>
        <select
          value={global.moldedCaseBreaker || ''}
          onChange={(e) => setGlobal('moldedCaseBreaker', e.target.value)}
          className="w-full border px-3 py-2 rounded"
        >
          <option value="">Выберите</option>
          {moldedOptions.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block mb-1 font-medium">Счетчик</label>
        <select
          value={global.meterType || ''}
          onChange={(e) => setGlobal('meterType', e.target.value)}
          className="w-full border px-3 py-2 rounded"
        >
          <option value="">Выберите</option>
          {meterOptions.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block mb-1 font-medium">Напряжение</label>
        <select
          value={global.voltage}
          onChange={(e) => setGlobal('voltage', Number(e.target.value))}
          className="w-full border px-3 py-2 rounded"
        >
          {[0.4, 6, 10].map((v) => (
            <option key={v} value={v}>
              {v} кВ
            </option>
          ))}
        </select>
      </div>

      <RunnCellTable />

      <TogglerWithInput label="Шинный мост (м)">
        <input
          type="number"
          min={0}
          value={global.busBridgeLength}
          onChange={(e) => setGlobal('busBridgeLength', Number(e.target.value))}
          className="w-full border px-3 py-2 rounded"
        />
      </TogglerWithInput>
    </section>
  );
}
