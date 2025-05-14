// RusnGlobalConfig.tsx
'use client';

import { useRusnStore } from '@/store/useRusnStore';
import TogglerWithInput from './TogglerWithInput';
import RusnCellTable from './RusnCellTable';

export default function RusnGlobalConfig({ availableCells }: { availableCells: string[] }) {
  const { global, setGlobal } = useRusnStore();

  return (
    <section className="flex flex-col gap-6">
      <div>
        <label className="block mb-1 font-medium">Тип корпуса</label>
        <select
          value={global.bodyType}
          onChange={(e) => setGlobal('bodyType', e.target.value)}
          className="w-full border px-3 py-2 rounded"
        >
          <option value="">Выберите</option>
          {availableCells.map((opt) => (
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
          {[6, 10, 20].map((v) => (
            <option key={v} value={v}>
              {v} кВ
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block mb-1 font-medium">Выключатель (по умолчанию)</label>
        <select
          value={global.breaker}
          onChange={(e) => setGlobal('breaker', e.target.value)}
          className="w-full border px-3 py-2 rounded"
        >
          <option value="">Выберите</option>
          {['AV-12', 'Siemens', 'Astels', 'ВНА-10/630', 'AETZ', 'Metasol', 'Sosul'].map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block mb-1 font-medium">РЗА (по умолчанию)</label>
        <select
          value={global.rza}
          onChange={(e) => setGlobal('rza', e.target.value)}
          className="w-full border px-3 py-2 rounded"
        >
          <option value="">Выберите</option>
          {['РС83-А2.0', 'Миком Р112', 'Алтей', 'Сименс', 'РЗА системз', 'Шнайдер'].map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block mb-1 font-medium">Счётчик (по умолчанию)</label>
        <select
          value={global.meterType}
          onChange={(e) => setGlobal('meterType', e.target.value)}
          className="w-full border px-3 py-2 rounded"
        >
          <option value="">Выберите</option>
          {['Сайман', 'Mercury', 'Меркурий', 'Нет прибора'].map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>

      <RusnCellTable />

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
