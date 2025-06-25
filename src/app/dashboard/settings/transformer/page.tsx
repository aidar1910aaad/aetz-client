'use client';

import { useState, useEffect } from 'react';
import { transformersApi, Transformer } from '@/api/transformers';
import { showToast } from '@/shared/modals/ToastProvider';
import { showConfirm } from '@/components/ui/confirm';

export default function TransformerSettingsPage() {
  const [transformers, setTransformers] = useState<Transformer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<keyof Transformer>('model');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [filterVoltage, setFilterVoltage] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('');
  const [filterManufacturer, setFilterManufacturer] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransformer, setEditingTransformer] = useState<Transformer | null>(null);
  const [formData, setFormData] = useState({
    model: '',
    voltage: '',
    type: '',
    power: '',
    manufacturer: '',
    price: '',
  });

  // Загрузка трансформаторов
  useEffect(() => {
    loadTransformers();
  }, []);

  const loadTransformers = async () => {
    try {
      setLoading(true);
      const data = await transformersApi.getAll();
      setTransformers(data);
    } catch (error) {
      showToast('Ошибка при загрузке трансформаторов', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Фильтрация и сортировка
  const filteredTransformers = transformers
    .filter((transformer) => {
      const matchesSearch = Object.values(transformer).some((value) =>
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      );
      const matchesVoltage = !filterVoltage || transformer.voltage === filterVoltage;
      const matchesType = !filterType || transformer.type === filterType;
      const matchesManufacturer =
        !filterManufacturer || transformer.manufacturer === filterManufacturer;
      return matchesSearch && matchesVoltage && matchesType && matchesManufacturer;
    })
    .sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      const direction = sortDirection === 'asc' ? 1 : -1;
      return aValue < bValue ? -direction : aValue > bValue ? direction : 0;
    });

  // Уникальные значения для фильтров
  const uniqueVoltages = [...new Set(transformers.map((t) => t.voltage))];
  const uniqueTypes = [...new Set(transformers.map((t) => t.type))];
  const uniqueManufacturers = [...new Set(transformers.map((t) => t.manufacturer))];

  // Обработчики действий
  const handleDelete = async (id: number) => {
    const confirmed = await showConfirm({
      title: 'Удалить трансформатор?',
      message: 'Это действие нельзя отменить.',
      confirmText: 'Удалить',
      cancelText: 'Отмена',
    });

    if (confirmed) {
      try {
        await transformersApi.delete(id);
        showToast('Трансформатор успешно удален', 'success');
        loadTransformers();
      } catch (error) {
        showToast('Ошибка при удалении трансформатора', 'error');
      }
    }
  };

  const handleSort = (field: keyof Transformer) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleOpenModal = (transformer: Transformer | null = null) => {
    if (transformer) {
      setFormData({
        model: transformer.model,
        voltage: transformer.voltage,
        type: transformer.type,
        power: transformer.power.toString(),
        manufacturer: transformer.manufacturer,
        price: transformer.price.toString(),
      });
      setEditingTransformer(transformer);
    } else {
      setFormData({
        model: '',
        voltage: '',
        type: '',
        power: '',
        manufacturer: '',
        price: '',
      });
      setEditingTransformer(null);
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        model: formData.model,
        voltage: formData.voltage,
        type: formData.type,
        power: parseInt(formData.power),
        manufacturer: formData.manufacturer,
        price: parseInt(formData.price),
      };

      if (editingTransformer) {
        await transformersApi.update(editingTransformer.id, data);
        showToast('Трансформатор успешно обновлен', 'success');
      } else {
        await transformersApi.create(data);
        showToast('Трансформатор успешно создан', 'success');
      }
      setIsModalOpen(false);
      loadTransformers();
    } catch (error) {
      showToast('Ошибка при сохранении трансформатора', 'error');
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Трансформаторы</h1>
        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2 bg-[#3A55DF] text-white rounded hover:bg-[#2e46c5] transition-colors"
        >
          Добавить трансформатор
        </button>
      </div>

      {/* Фильтры и поиск */}
      <div className="flex gap-4 mb-6">
        <input
          type="text"
          placeholder="Поиск..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border rounded px-3 py-2"
        />
        <select
          value={filterVoltage}
          onChange={(e) => setFilterVoltage(e.target.value)}
          className="border rounded px-3 py-2"
        >
          <option value="">Все напряжения</option>
          {uniqueVoltages.map((voltage) => (
            <option key={voltage} value={voltage}>
              {voltage}
            </option>
          ))}
        </select>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="border rounded px-3 py-2"
        >
          <option value="">Все типы</option>
          {uniqueTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
        <select
          value={filterManufacturer}
          onChange={(e) => setFilterManufacturer(e.target.value)}
          className="border rounded px-3 py-2"
        >
          <option value="">Все производители</option>
          {uniqueManufacturers.map((manufacturer) => (
            <option key={manufacturer} value={manufacturer}>
              {manufacturer}
            </option>
          ))}
        </select>
      </div>

      {/* Таблица */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  onClick={() => handleSort('model')}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  Модель {sortField === 'model' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th
                  onClick={() => handleSort('voltage')}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  Напряжение {sortField === 'voltage' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th
                  onClick={() => handleSort('type')}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  Тип {sortField === 'type' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th
                  onClick={() => handleSort('power')}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  Мощность {sortField === 'power' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th
                  onClick={() => handleSort('manufacturer')}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  Производитель{' '}
                  {sortField === 'manufacturer' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th
                  onClick={() => handleSort('price')}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  Цена {sortField === 'price' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center">
                    Загрузка...
                  </td>
                </tr>
              ) : filteredTransformers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center">
                    Трансформаторы не найдены
                  </td>
                </tr>
              ) : (
                filteredTransformers.map((transformer) => (
                  <tr key={transformer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {transformer.model}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {transformer.voltage}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {transformer.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {transformer.power}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {transformer.manufacturer}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {transformer.price.toLocaleString()} тг
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleOpenModal(transformer)}
                        className="text-[#3A55DF] hover:text-[#2e46c5] mr-4"
                      >
                        Редактировать
                      </button>
                      <button
                        onClick={() => handleDelete(transformer.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Удалить
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Модальное окно */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50">
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-[2px]"
            onClick={() => setIsModalOpen(false)}
          />
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <div className="relative bg-white rounded-lg shadow-xl w-full max-w-lg transform transition-all">
              <div className="absolute right-0 top-0 pr-4 pt-4">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none"
                >
                  <span className="sr-only">Закрыть</span>
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="p-6">
                <h3 className="text-lg font-semibold leading-6 text-gray-900 mb-4">
                  {editingTransformer ? 'Редактировать трансформатор' : 'Новый трансформатор'}
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Модель</label>
                    <input
                      type="text"
                      value={formData.model}
                      onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#3A55DF] focus:ring-[#3A55DF] sm:text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Напряжение</label>
                    <input
                      type="text"
                      value={formData.voltage}
                      onChange={(e) => setFormData({ ...formData, voltage: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#3A55DF] focus:ring-[#3A55DF] sm:text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Тип</label>
                    <input
                      type="text"
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#3A55DF] focus:ring-[#3A55DF] sm:text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Мощность</label>
                    <input
                      type="number"
                      value={formData.power}
                      onChange={(e) => setFormData({ ...formData, power: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#3A55DF] focus:ring-[#3A55DF] sm:text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Производитель</label>
                    <input
                      type="text"
                      value={formData.manufacturer}
                      onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#3A55DF] focus:ring-[#3A55DF] sm:text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Цена</label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#3A55DF] focus:ring-[#3A55DF] sm:text-sm"
                      required
                    />
                  </div>
                  <div className="flex justify-end gap-4 mt-6">
                    <button
                      type="button"
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3A55DF]"
                      onClick={() => setIsModalOpen(false)}
                    >
                      Отмена
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-sm font-medium text-white bg-[#3A55DF] border border-transparent rounded-md hover:bg-[#2e46c5] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3A55DF]"
                    >
                      {editingTransformer ? 'Сохранить' : 'Создать'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
