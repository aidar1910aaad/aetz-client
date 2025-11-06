'use client';

import { useState, useEffect } from 'react';
import { transformersApi, Transformer } from '@/api/transformers';
import { showToast } from '@/shared/modals/ToastProvider';
import { showConfirm } from '@/components/ui/confirm';
import RoleGuard from '@/components/common/RoleGuard';
import { UserRole } from '@/types/user';

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
    <RoleGuard
      allowedRoles={[UserRole.ADMIN, UserRole.PTO]}
      redirectTo="/dashboard"
      pagePath="/dashboard/settings/transformer"
    >
      <div className="h-[calc(100vh-65px)] overflow-y-auto bg-gradient-to-br from-white via-gray-50/30 to-blue-50/20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[#8eba1e] rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#8eba1e]">Трансформаторы</h1>
              <p className="text-sm text-gray-600 mt-1">Настройка трансформаторов для расчетов</p>
            </div>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="px-4 py-2 text-sm font-medium text-white bg-[#8eba1e] rounded-lg hover:bg-[#7aa31a] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8eba1e] transition-all duration-200 shadow-md hover:shadow-lg"
          >
            Добавить трансформатор
          </button>
        </div>

        {/* Фильтры и поиск */}
        <div className="bg-white rounded-xl shadow-lg border border-[#8eba1e]/20 p-6 mb-6">
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Поиск..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8eba1e]/30 focus:border-[#8eba1e] transition-all"
            />
            <select
              value={filterVoltage}
              onChange={(e) => setFilterVoltage(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8eba1e]/30 focus:border-[#8eba1e] transition-all"
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
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8eba1e]/30 focus:border-[#8eba1e] transition-all"
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
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8eba1e]/30 focus:border-[#8eba1e] transition-all"
            >
              <option value="">Все производители</option>
              {uniqueManufacturers.map((manufacturer) => (
                <option key={manufacturer} value={manufacturer}>
                  {manufacturer}
                </option>
              ))}
            </select>
          </div>
        </div>

      {/* Таблица */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div>
          <table className="w-full divide-y divide-gray-200 table-auto">
            <thead className="bg-gray-50">
              <tr>
                <th
                  onClick={() => handleSort('model')}
                  className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 w-1/6"
                >
                  Модель {sortField === 'model' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th
                  onClick={() => handleSort('voltage')}
                  className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 w-1/6"
                >
                  Напряжение {sortField === 'voltage' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th
                  onClick={() => handleSort('type')}
                  className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 w-1/6"
                >
                  Тип {sortField === 'type' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th
                  onClick={() => handleSort('power')}
                  className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 w-1/6"
                >
                  Мощность {sortField === 'power' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th
                  onClick={() => handleSort('manufacturer')}
                  className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 w-1/6"
                >
                  Производитель{' '}
                  {sortField === 'manufacturer' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th
                  onClick={() => handleSort('price')}
                  className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 w-1/6"
                >
                  Цена {sortField === 'price' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
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
                    <td className="px-3 py-4 text-sm text-gray-900 truncate">
                      {transformer.model}
                    </td>
                    <td className="px-3 py-4 text-sm text-gray-900 truncate">
                      {transformer.voltage}
                    </td>
                    <td className="px-3 py-4 text-sm text-gray-900 truncate">
                      {transformer.type}
                    </td>
                    <td className="px-3 py-4 text-sm text-gray-900 truncate">
                      {transformer.power}
                    </td>
                    <td className="px-3 py-4 text-sm text-gray-900 truncate">
                      {transformer.manufacturer}
                    </td>
                    <td className="px-3 py-4 text-sm text-gray-900 truncate">
                      {transformer.price.toLocaleString()} тг
                    </td>
                    <td className="px-3 py-4 text-right text-sm font-medium">
                      <button
                        onClick={() => handleOpenModal(transformer)}
                        className="text-[#8eba1e] hover:text-[#7aa31a] mr-2 text-xs"
                      >
                        Редактировать
                      </button>
                      <button
                        onClick={() => handleDelete(transformer.id)}
                        className="text-red-600 hover:text-red-900 text-xs"
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
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#8eba1e] focus:ring-[#8eba1e] sm:text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Напряжение</label>
                    <input
                      type="text"
                      value={formData.voltage}
                      onChange={(e) => setFormData({ ...formData, voltage: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#8eba1e] focus:ring-[#8eba1e] sm:text-sm"
                      required
                    />
                    <div className="mt-2 flex gap-2">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, voltage: '10' })}
                        className="px-3 py-1 text-xs font-medium text-[#8eba1e] bg-[#8eba1e]/10 border border-[#8eba1e]/30 rounded-md hover:bg-[#8eba1e]/20 transition-colors"
                      >
                        10
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, voltage: '20' })}
                        className="px-3 py-1 text-xs font-medium text-[#8eba1e] bg-[#8eba1e]/10 border border-[#8eba1e]/30 rounded-md hover:bg-[#8eba1e]/20 transition-colors"
                      >
                        20
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Тип</label>
                    <input
                      type="text"
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#8eba1e] focus:ring-[#8eba1e] sm:text-sm"
                      required
                    />
                    <div className="mt-2 flex gap-2">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, type: 'ТМГ' })}
                        className="px-3 py-1 text-xs font-medium text-[#8eba1e] bg-[#8eba1e]/10 border border-[#8eba1e]/30 rounded-md hover:bg-[#8eba1e]/20 transition-colors"
                      >
                        ТМГ
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, type: 'ТСЛ' })}
                        className="px-3 py-1 text-xs font-medium text-[#8eba1e] bg-[#8eba1e]/10 border border-[#8eba1e]/30 rounded-md hover:bg-[#8eba1e]/20 transition-colors"
                      >
                        ТСЛ
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Мощность</label>
                    <input
                      type="number"
                      value={formData.power}
                      onChange={(e) => setFormData({ ...formData, power: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#8eba1e] focus:ring-[#8eba1e] sm:text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Производитель</label>
                    <input
                      type="text"
                      value={formData.manufacturer}
                      onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#8eba1e] focus:ring-[#8eba1e] sm:text-sm"
                      required
                    />
                    <div className="mt-2 flex gap-2">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, manufacturer: 'Alageum' })}
                        className="px-3 py-1 text-xs font-medium text-[#8eba1e] bg-[#8eba1e]/10 border border-[#8eba1e]/30 rounded-md hover:bg-[#8eba1e]/20 transition-colors"
                      >
                        Alageum
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, manufacturer: 'ZBB' })}
                        className="px-3 py-1 text-xs font-medium text-[#8eba1e] bg-[#8eba1e]/10 border border-[#8eba1e]/30 rounded-md hover:bg-[#8eba1e]/20 transition-colors"
                      >
                        ZBB
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, manufacturer: 'АЭТЗ' })}
                        className="px-3 py-1 text-xs font-medium text-[#8eba1e] bg-[#8eba1e]/10 border border-[#8eba1e]/30 rounded-md hover:bg-[#8eba1e]/20 transition-colors"
                      >
                        АЭТЗ
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Цена</label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#8eba1e] focus:ring-[#8eba1e] sm:text-sm"
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
                      className="px-4 py-2 text-sm font-medium text-white bg-[#8eba1e] border border-transparent rounded-md hover:bg-[#7aa31a] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8eba1e]"
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
    </div>
    </RoleGuard>
  );
}
