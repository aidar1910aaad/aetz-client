import { useDguStore } from '@/store/useDguStore';
import TogglerWithInput from '../../../TogglerWithInput';
import {
  calculateNominalCurrentForDgu,
} from '../../../utils/runnDguMaterialFinder';

interface DguGeneralSettingsProps {
  nominalCurrent: number;
}

export default function DguGeneralSettings({ nominalCurrent }: DguGeneralSettingsProps) {
  const dgu = useDguStore();

  return (
    <TogglerWithInput label="Общие настройки" defaultEnabled>
      <div className="space-y-4">
        {/* Кнопки выбора материала */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-medium text-[#3A55DF]">Материал:</span>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() =>
                dgu.setSettings({ material: 'Алюминий' })
              }
              className={`flex-1 px-4 py-2 rounded-md border transition-all duration-200 ${
                dgu.settings.material === 'Алюминий'
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:bg-blue-50'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <div
                  className={`w-4 h-4 rounded-full border ${
                    dgu.settings.material === 'Алюминий' ? 'bg-white border-white' : 'bg-gray-300 border-gray-300'
                  }`}
                ></div>
                <span className="font-medium">Алюминий</span>
              </div>
            </button>
            <button
              type="button"
              onClick={() =>
                dgu.setSettings({ material: 'Медь' })
              }
              className={`flex-1 px-4 py-2 rounded-md border transition-all duration-200 ${
                dgu.settings.material === 'Медь'
                  ? 'bg-orange-600 text-white border-orange-600 shadow-sm'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-orange-400 hover:bg-orange-50'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <div
                  className={`w-4 h-4 rounded-full border ${
                    dgu.settings.material === 'Медь' ? 'bg-white border-white' : 'bg-gray-300 border-gray-300'
                  }`}
                ></div>
                <span className="font-medium">Медь</span>
              </div>
            </button>
          </div>
        </div>

        {/* Остальные поля */}
        <div className="flex flex-wrap gap-4 items-end p-4 rounded bg-white border border-gray-100">
          <div className="flex flex-col gap-1 min-w-[150px]">
            <span className="text-xs font-medium text-[#3A55DF]">
              Номинальная мощность (кВА)
            </span>
            <input
              type="number"
              min={0}
              step={0.1}
              value={dgu.settings.nominalPowerKva || ''}
              onChange={(e) =>
                dgu.setSettings({ nominalPowerKva: Number(e.target.value) || 0 })
              }
              className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#3A55DF]"
              placeholder="0"
            />
          </div>

          <div className="flex flex-col gap-1 min-w-[120px]">
            <span className="text-xs font-medium text-[#3A55DF]">Цена (₸)</span>
            <input
              type="number"
              min={0}
              value={dgu.settings.price || ''}
              onChange={(e) =>
                dgu.setSettings({ price: Number(e.target.value) || 0 })
              }
              className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#3A55DF]"
              placeholder="0"
            />
          </div>

          <div className="flex flex-col gap-1 min-w-[150px]">
            <span className="text-xs font-medium text-[#3A55DF]">Номинальный ток (А)</span>
            <div className="border border-gray-300 rounded px-2 py-1 text-sm bg-gray-50 text-gray-700">
              {nominalCurrent.toFixed(2)} А
            </div>
          </div>
        </div>
      </div>
    </TogglerWithInput>
  );
}

