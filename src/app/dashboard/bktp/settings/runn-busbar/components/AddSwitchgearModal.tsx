import React, { useState } from 'react';
import { showToast } from '@/shared/modals/ToastProvider';

interface AddSwitchgearModalProps {
  open: boolean;
  onClose: () => void;
  onAdd?: (newConfig: NewSwitchgearConfig) => void;
  type: string;
  allTypes?: string[];
}

interface NewSwitchgearConfig {
  type: string;
  breaker: string;
  amperage: string;
  group: string;
  busbar: string;
  power?: string; // Добавляем поле для мощности
  cells: {
    name: string;
    quantity: number;
  }[];
}

const availableGroups: string[] = ['АД', 'АД2', 'АД3', 'МТ', 'МТ2', 'МТ3'];
const availableBusbars: string[] = ['60x6', '80x8', '100x10', '120x10', '50x5'];
const availableAmperages: string[] = [
  '870A',
  '1320A',
  '1820A',
  '2070A',
  '2860A',
  '3200A',
  '860A',
  '1125A',
  '1690A',
  '2310A',
  '2650A',
  '3610A',
];
const availableBreakers: string[] = [
  'AV-12 1250A',
  'AV-12 1600A',
  'AV-12 2000A',
  'AV-12 2500A',
  'AV-12 3150A',
];
// Добавляем список доступных мощностей для РУНН панели ЩО
const availablePowers: string[] = [
  '25',
  '40',
  '63',
  '100',
  '160',
  '250',
  '400',
  '630',
  '1000',
  '1250',
  '1600',
  '2000',
  '2500',
  '3150',
  '4000',
];
const cellTypes = ['Ввод', 'СВ', 'ОТХ', 'УСТ', 'Шинный мост'];

export const AddSwitchgearModal: React.FC<AddSwitchgearModalProps> = ({
  open,
  onClose,
  onAdd,
  type,
  allTypes = [],
}) => {
  const [newConfig, setNewConfig] = useState<NewSwitchgearConfig>({
    type: type || '',
    breaker: '',
    amperage: '',
    group: '',
    busbar: '',
    power: '',
    cells: [],
  });

  const handleAdd = () => {
    // Проверяем, является ли это панелью ЩО (обычной или с нулевой фазой)
    const isPanel = type && (
      type.toLowerCase().includes('панель') && type.toLowerCase().includes('що') ||
      type.toLowerCase().includes('що-70') ||
      type.toLowerCase().includes('що-70n')
    );
    
    // Временно принудительно включаем режим мощности для тестирования
    // TODO: Убрать после тестирования
    const forcePowerMode = true;
    
    const validationResult = {
      type: !!newConfig.type,
      amperage: !!newConfig.amperage,
      group: !!newConfig.group,
      busbar: !!newConfig.busbar,
      powerOrBreaker: forcePowerMode ? !!newConfig.power : (isPanel ? !!newConfig.power : !!newConfig.breaker),
      power: newConfig.power,
      breaker: newConfig.breaker
    };
    
    if (
      newConfig.type &&
      newConfig.amperage &&
      newConfig.group &&
      newConfig.busbar &&
      (forcePowerMode ? newConfig.power : (isPanel ? newConfig.power : newConfig.breaker)) // Для панели ЩО проверяем мощность, иначе выключатель
    ) {
      if (onAdd) {
        onAdd(newConfig);
      }
      setNewConfig({
        type: type || '',
        breaker: '',
        amperage: '',
        group: '',
        busbar: '',
        power: '',
        cells: [],
      });
      onClose();
    } else {
      showToast('Пожалуйста, заполните все обязательные поля.', 'error');
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Тип панели</label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setNewConfig({ ...newConfig, type: 'Панель ЩО-70' })}
                    className={`flex-1 px-4 py-2 rounded-md border text-sm font-medium transition-colors ${
                      newConfig.type === 'Панель ЩО-70'
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    Панель ЩО-70
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewConfig({ ...newConfig, type: 'Панель ЩО-70N' })}
                    className={`flex-1 px-4 py-2 rounded-md border text-sm font-medium transition-colors ${
                      newConfig.type === 'Панель ЩО-70N'
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    Панель ЩО-70N
                  </button>
                </div>
              </div>
              {/* Показываем поле мощности для РУНН панели ЩО, иначе поле выключателя */}
              {(() => {
                const isPanel = type && (
                  type.toLowerCase().includes('панель') && type.toLowerCase().includes('що') ||
                  type.toLowerCase().includes('що-70') ||
                  type.toLowerCase().includes('що-70n')
                );
                
                // Временно принудительно включаем режим мощности для тестирования
                // TODO: Убрать после тестирования
                return isPanel || true;
              })() ? (
                <div>
                  <label htmlFor="power" className="block text-sm font-medium text-gray-700">
                    Мощность (кВА)
                  </label>
                  <input
                    id="power"
                    value={newConfig.power || ''}
                    onChange={(e) => setNewConfig({ ...newConfig, power: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="25"
                    list="power-options"
                  />
                  <datalist id="power-options">
                    {availablePowers.map((powerOption) => (
                      <option key={powerOption} value={powerOption} />
                    ))}
                  </datalist>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {availablePowers.map((powerOption) => (
                      <button
                        key={powerOption}
                        type="button"
                        onClick={() => setNewConfig({ ...newConfig, power: powerOption })}
                        className="px-3 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        {powerOption}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  <label htmlFor="breaker" className="block text-sm font-medium text-gray-700">
                    Выключатель
                  </label>
                  <input
                    id="breaker"
                    value={newConfig.breaker}
                    onChange={(e) => setNewConfig({ ...newConfig, breaker: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="AV-12 1250"
                    list="breaker-options"
                  />
                  <datalist id="breaker-options">
                    {availableBreakers.map((breakerOption) => (
                      <option key={breakerOption} value={breakerOption} />
                    ))}
                  </datalist>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {availableBreakers.map((breakerOption) => (
                      <button
                        key={breakerOption}
                        type="button"
                        onClick={() => setNewConfig({ ...newConfig, breaker: breakerOption })}
                        className="px-3 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        {breakerOption}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <label htmlFor="amperage" className="block text-sm font-medium text-gray-700">
                  Ток
                </label>
                <input
                  id="amperage"
                  value={newConfig.amperage}
                  onChange={(e) => setNewConfig({ ...newConfig, amperage: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="870A"
                  list="amperage-options"
                />
                <datalist id="amperage-options">
                  {availableAmperages.map((amperageOption) => (
                    <option key={amperageOption} value={amperageOption} />
                  ))}
                </datalist>
                <div className="mt-2 flex flex-wrap gap-2">
                  {availableAmperages.map((amperageOption) => (
                    <button
                      key={amperageOption}
                      type="button"
                      onClick={() => setNewConfig({ ...newConfig, amperage: amperageOption })}
                      className="px-3 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      {amperageOption}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label htmlFor="group" className="block text-sm font-medium text-gray-700">
                  Группа
                </label>
                <input
                  id="group"
                  value={newConfig.group}
                  onChange={(e) => setNewConfig({ ...newConfig, group: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="АД"
                  list="group-options"
                />
                <datalist id="group-options">
                  {availableGroups.map((groupOption) => (
                    <option key={groupOption} value={groupOption} />
                  ))}
                </datalist>
                <div className="mt-2 flex flex-wrap gap-2">
                  {availableGroups.map((groupOption) => (
                    <button
                      key={groupOption}
                      type="button"
                      onClick={() => setNewConfig({ ...newConfig, group: groupOption })}
                      className="px-3 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      {groupOption}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label htmlFor="busbar" className="block text-sm font-medium text-gray-700">
                  Шина
                </label>
                <input
                  id="busbar"
                  value={newConfig.busbar}
                  onChange={(e) => setNewConfig({ ...newConfig, busbar: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="60x6"
                  list="busbar-options"
                />
                <datalist id="busbar-options">
                  {availableBusbars.map((busbarOption) => (
                    <option key={busbarOption} value={busbarOption} />
                  ))}
                </datalist>
                <div className="mt-2 flex flex-wrap gap-2">
                  {availableBusbars.map((busbarOption) => (
                    <button
                      key={busbarOption}
                      type="button"
                      onClick={() => setNewConfig({ ...newConfig, busbar: busbarOption })}
                      className="px-3 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      {busbarOption}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Масса в кг на ячейку
                </label>
                <div className="space-y-2">
                  {cellTypes.map((cellName) => (
                    <div key={cellName} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{cellName}</span>
                      <input
                        type="number"
                        value={newConfig.cells.find((c) => c.name === cellName)?.quantity || ''}
                        onChange={(e) => {
                          const quantity = Number(e.target.value);
                          setNewConfig((prev) => ({
                            ...prev,
                            cells: prev.cells.some((c) => c.name === cellName)
                              ? prev.cells.map((c) =>
                                  c.name === cellName ? { ...c, quantity } : c
                                )
                              : [...prev.cells, { name: cellName, quantity }],
                          }));
                        }}
                        className="w-20 border border-gray-300 rounded-md shadow-sm py-1 px-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        min="0"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={handleAdd}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Добавить
            </button>
            <button
              type="button"
              onClick={onClose}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Отмена
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}; 