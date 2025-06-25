import { useState } from 'react';
import { Switchgear, CreateSwitchgearDto } from '@/api/switchgear';
import { Plus, Trash2 } from 'lucide-react';
import { amperageDefinitions } from './BusbarTable';

interface SwitchgearModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateSwitchgearDto) => void;
  editingConfig: Switchgear | null;
}

export function SwitchgearModal({
  isOpen,
  onClose,
  onSubmit,
  editingConfig,
}: SwitchgearModalProps) {
  const [formData, setFormData] = useState<CreateSwitchgearDto>({
    type: editingConfig?.type || '',
    breaker: editingConfig?.breaker || '',
    amperage: editingConfig?.amperage || 0,
    group: editingConfig?.group || '',
    busbar: editingConfig?.busbar || '',
    cells: editingConfig?.cells || [],
  });

  const handleAddCell = () => {
    setFormData({
      ...formData,
      cells: [
        ...formData.cells,
        {
          name: '',
          quantity: 0,
        },
      ],
    });
  };

  const handleRemoveCell = (index: number) => {
    setFormData({
      ...formData,
      cells: formData.cells.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
        <h3 className="text-lg font-semibold mb-4">
          {editingConfig ? 'Редактировать конфигурацию' : 'Создать конфигурацию'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Тип</label>
              <input
                type="text"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Выключатель</label>
              <select
                value={formData.breaker}
                onChange={(e) => setFormData({ ...formData, breaker: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Выберите выключатель</option>
                {Object.entries(amperageDefinitions).map(([amperage, def]) => (
                  <optgroup key={amperage} label={`${amperage} А`}>
                    <option value={`${amperage}А`}>{amperage}А</option>
                  </optgroup>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ток</label>
              <select
                value={formData.amperage}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    amperage: parseInt(e.target.value),
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Выберите ток</option>
                {Object.keys(amperageDefinitions).map((amperage) => (
                  <option key={amperage} value={amperage}>
                    {amperage} А
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Группа</label>
              <input
                type="text"
                value={formData.group}
                onChange={(e) => setFormData({ ...formData, group: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Шина</label>
              <input
                type="text"
                value={formData.busbar}
                onChange={(e) => setFormData({ ...formData, busbar: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="block text-sm font-medium text-gray-700">Ячейки</label>
              <button
                type="button"
                onClick={handleAddCell}
                className="text-blue-600 hover:text-blue-900"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            {formData.cells.map((cell, index) => (
              <div key={index} className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Тип ячейки</label>
                  <select
                    value={cell.name}
                    onChange={(e) => {
                      const newCells = [...formData.cells];
                      newCells[index] = {
                        ...cell,
                        name: e.target.value,
                      };
                      setFormData({ ...formData, cells: newCells });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Выберите тип ячейки</option>
                    <option value="Ввод">Ввод</option>
                    <option value="СВ">СВ</option>
                    <option value="ОТХ">ОТХ</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Количество</label>
                  <input
                    type="number"
                    value={cell.quantity}
                    onChange={(e) => {
                      const newCells = [...formData.cells];
                      newCells[index] = {
                        ...cell,
                        quantity: parseInt(e.target.value) || 0,
                      };
                      setFormData({ ...formData, cells: newCells });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                    required
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveCell(index)}
                  className="text-red-600 hover:text-red-900"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {editingConfig ? 'Сохранить' : 'Создать'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
