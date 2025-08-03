'use client';

import { useRouter } from 'next/navigation';
import { useCalculations } from '@/hooks/useCalculations';
import { FolderPlus, Folder, Zap, Edit, Trash } from 'lucide-react';
import { useState } from 'react';
import { showToast } from '@/shared/modals/ToastProvider';

export default function CalculationsPage() {
  const router = useRouter();
  const { groups, loading, handleCreateGroup, handleUpdateGroup, handleDeleteGroup } =
    useCalculations();

  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupVoltage, setNewGroupVoltage] = useState<number>(10);
  const [editingGroup, setEditingGroup] = useState<{
    id: number;
    name: string;
    slug: string;
    voltageType?: number | null;
  } | null>(null);
  const [editName, setEditName] = useState('');
  const [editVoltage, setEditVoltage] = useState<number>(10);
  const [voltageFilter, setVoltageFilter] = useState<number | null>(null);

  const handleOpenGroup = (slug: string) => {
    router.push(`/dashboard/calc/${encodeURIComponent(slug)}`);
  };

  // Фильтрация групп по напряжению
  const filteredGroups = groups.filter((group) => {
    if (voltageFilter === null) return true; // Показать все
    return group.voltageType === voltageFilter;
  });

  const handleCreate = async () => {
    if (!newGroupName.trim()) {
      showToast('Введите название группы', 'error');
      return;
    }

    try {
      const slug = newGroupName.toLowerCase().replace(/\s+/g, '-');
      await handleCreateGroup({
        name: newGroupName,
        slug,
        voltageType: newGroupVoltage,
      });
      setNewGroupName('');
      setNewGroupVoltage(10);
      setModalOpen(false);
    } catch {
      // Ошибка уже обрабатывается в хуке
    }
  };

  const handleEdit = (group: {
    id: number;
    name: string;
    slug: string;
    voltageType?: number | null;
  }) => {
    setEditingGroup(group);
    setEditName(group.name);
    setEditVoltage(group.voltageType || 10);
    setEditModalOpen(true);
  };

  const handleUpdate = async () => {
    if (!editingGroup || !editName.trim()) {
      showToast('Введите название группы', 'error');
      return;
    }

    try {
      await handleUpdateGroup(editingGroup.slug, {
        name: editName,
        voltageType: editVoltage,
      });
      setEditModalOpen(false);
      setEditingGroup(null);
    } catch {
      // Ошибка уже обрабатывается в хуке
    }
  };

  const handleDelete = async (group: { id: number; name: string; slug: string }) => {
    if (!confirm(`Вы уверены, что хотите удалить группу "${group.name}"?`)) {
      return;
    }

    try {
      await handleDeleteGroup(group.id);
    } catch {
      // Ошибка уже обрабатывается в хуке
    }
  };

  const getVoltageLabel = (voltage?: number | null) => {
    if (!voltage) return 'Не указано';

    switch (voltage) {
      case 400:
        return '0.4 кВ';
      case 10:
        return '10 кВ';
      case 20:
        return '20 кВ';
      default:
        return `${voltage} кВ`;
    }
  };

  const getVoltageColor = (voltage?: number | null) => {
    if (!voltage) return 'text-gray-500 bg-gray-100';

    switch (voltage) {
      case 400:
        return 'text-green-600 bg-green-100';
      case 10:
        return 'text-blue-600 bg-blue-100';
      case 20:
        return 'text-purple-600 bg-purple-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="h-[calc(100vh-110px)] overflow-y-auto px-8 py-8 bg-gradient-to-br from-gray-50 to-white">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold text-gray-800">Группы калькуляций</h2>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 bg-[#3A55DF] text-white px-4 py-2 rounded-lg hover:bg-[#2e46c5] transition-colors text-sm font-medium shadow-sm"
        >
          <FolderPlus className="w-5 h-5" />
          Добавить группу
        </button>
      </div>

      {/* Фильтры по напряжению */}
      <div className="mb-6">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-gray-700">Фильтр по напряжению:</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setVoltageFilter(null)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                voltageFilter === null
                  ? 'bg-[#3A55DF] text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Все
            </button>
            <button
              onClick={() => setVoltageFilter(400)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                voltageFilter === 400
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              0.4 кВ
            </button>
            <button
              onClick={() => setVoltageFilter(10)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                voltageFilter === 10
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              10 кВ
            </button>
            <button
              onClick={() => setVoltageFilter(20)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                voltageFilter === 20
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              20 кВ
            </button>
          </div>
        </div>
        {voltageFilter !== null && (
          <p className="text-sm text-gray-500 mt-2">
            Показано {filteredGroups.length} из {groups.length} групп
          </p>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3A55DF]"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGroups.map((group) => (
            <div
              key={group.id}
              className="group cursor-pointer bg-white border border-gray-200 hover:border-[#3A55DF] shadow-sm hover:shadow-md rounded-xl p-6 transition-all duration-200"
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className="flex items-center gap-3 flex-1"
                  onClick={() => handleOpenGroup(group.slug)}
                >
                  <Folder className="w-6 h-6 text-[#3A55DF] flex-shrink-0" />
                  <h3 className="text-lg font-semibold text-gray-800 group-hover:text-[#3A55DF] transition-colors">
                    {group.name}
                  </h3>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(group);
                    }}
                    className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                    title="Редактировать"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(group);
                    }}
                    className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                    title="Удалить"
                  >
                    <Trash className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-2" onClick={() => handleOpenGroup(group.slug)}>
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-gray-400" />
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getVoltageColor(
                      group.voltageType
                    )}`}
                  >
                    {getVoltageLabel(group.voltageType)}
                  </span>
                </div>
                <p className="text-sm text-gray-500">Slug: {group.slug}</p>
                {group.createdAt && (
                  <p className="text-xs text-gray-400">
                    Создано: {new Date(group.createdAt).toLocaleDateString('ru-RU')}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Модалка создания */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">Новая группа калькуляций</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Название группы
                </label>
                <input
                  type="text"
                  placeholder="Введите название"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#3A55DF] focus:border-[#3A55DF]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Напряжение</label>
                <select
                  value={newGroupVoltage}
                  onChange={(e) => setNewGroupVoltage(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#3A55DF] focus:border-[#3A55DF]"
                >
                  <option value={400}>0.4 кВ</option>
                  <option value={10}>10 кВ</option>
                  <option value={20}>20 кВ</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setModalOpen(false);
                  setNewGroupName('');
                  setNewGroupVoltage(10);
                }}
                className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition-colors"
              >
                Отмена
              </button>
              <button
                onClick={handleCreate}
                className="px-4 py-2 rounded-lg bg-[#3A55DF] text-white hover:bg-[#2e46c5] transition-colors"
              >
                Создать
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Модалка редактирования */}
      {editModalOpen && editingGroup && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">Редактировать группу</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Название группы
                </label>
                <input
                  type="text"
                  placeholder="Введите название"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#3A55DF] focus:border-[#3A55DF]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Напряжение</label>
                <select
                  value={editVoltage}
                  onChange={(e) => setEditVoltage(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#3A55DF] focus:border-[#3A55DF]"
                >
                  <option value={400}>0.4 кВ</option>
                  <option value={10}>10 кВ</option>
                  <option value={20}>20 кВ</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setEditModalOpen(false);
                  setEditingGroup(null);
                }}
                className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition-colors"
              >
                Отмена
              </button>
              <button
                onClick={handleUpdate}
                className="px-4 py-2 rounded-lg bg-[#3A55DF] text-white hover:bg-[#2e46c5] transition-colors"
              >
                Сохранить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
