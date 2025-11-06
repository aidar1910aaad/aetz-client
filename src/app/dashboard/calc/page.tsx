'use client';

import { useRouter } from 'next/navigation';
import { useCalculations } from '@/hooks/useCalculations';
import { FolderPlus, Folder, Zap, Edit, Trash, Calculator, Plus } from 'lucide-react';
import { useState } from 'react';
import { showToast } from '@/shared/modals/ToastProvider';
import RoleGuard from '@/components/common/RoleGuard';
import { UserRole } from '@/types/user';

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
    <RoleGuard
      allowedRoles={[UserRole.ADMIN, UserRole.PTO]}
      redirectTo="/dashboard"
      pagePath="/dashboard/calc"
    >
      <div className="h-[calc(100vh-64px)] bg-white overflow-y-auto">
      <div className="p-6">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-gray-100 rounded-xl">
              <Calculator className="w-6 h-6 text-[#8eba1e]" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Группы калькуляций</h1>
              <p className="text-gray-600">Управление группами расчетов</p>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="bg-gray-50 px-4 py-2 rounded-lg">
                <span className="text-sm text-gray-600">Всего групп: </span>
                <span className="font-semibold text-[#8eba1e]">{groups.length}</span>
              </div>
              {voltageFilter !== null && (
                <div className="bg-gray-50 px-4 py-2 rounded-lg">
                  <span className="text-sm text-gray-600">Показано: </span>
                  <span className="font-semibold text-[#8eba1e]">{filteredGroups.length}</span>
                </div>
              )}
            </div>
            <button
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-2 bg-[#8eba1e] hover:bg-[#7aa31a] text-white px-6 py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Plus size={18} />
              Добавить группу
            </button>
          </div>
        </div>

        {/* Фильтры по напряжению */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <span className="text-sm font-medium text-gray-700">Фильтр по напряжению:</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setVoltageFilter(null)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  voltageFilter === null
                    ? 'bg-[#8eba1e] text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:border-[#8eba1e]/30'
                }`}
              >
                Все
              </button>
              <button
                onClick={() => setVoltageFilter(400)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  voltageFilter === 400
                    ? 'bg-green-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:border-[#8eba1e]/30'
                }`}
              >
                0.4 кВ
              </button>
              <button
                onClick={() => setVoltageFilter(10)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  voltageFilter === 10
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:border-[#8eba1e]/30'
                }`}
              >
                10 кВ
              </button>
              <button
                onClick={() => setVoltageFilter(20)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  voltageFilter === 20
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:border-[#8eba1e]/30'
                }`}
              >
                20 кВ
              </button>
            </div>
          </div>
          {voltageFilter !== null && (
            <div className="bg-gray-50 px-4 py-2 rounded-lg inline-block">
              <span className="text-sm text-gray-600">
                Показано <span className="font-semibold text-[#8eba1e]">{filteredGroups.length}</span> из <span className="font-semibold text-[#8eba1e]">{groups.length}</span> групп
              </span>
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8eba1e] mx-auto mb-4"></div>
              <p className="text-gray-600">Загрузка групп...</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredGroups.map((group) => (
              <div
                key={group.id}
                className="group cursor-pointer bg-white border border-gray-200 hover:border-[#8eba1e]/30 shadow-lg hover:shadow-xl rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02]"
              >
                {/* Декоративный акцент сверху */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-[#8eba1e] opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-t-2xl"></div>
                
                <div className="flex items-start justify-between mb-4">
                  <div
                    className="flex items-center gap-3 flex-1"
                    onClick={() => handleOpenGroup(group.slug)}
                  >
                    <div className="p-2 bg-gray-100 group-hover:bg-[#8eba1e] rounded-lg transition-all duration-300">
                      <Folder className="w-6 h-6 text-[#8eba1e] group-hover:text-white flex-shrink-0" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 group-hover:text-[#8eba1e] transition-colors">
                      {group.name}
                    </h3>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(group);
                      }}
                      className="p-2 text-gray-400 hover:text-[#8eba1e] hover:bg-gray-100 rounded-lg transition-all duration-200"
                      title="Редактировать"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(group);
                      }}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-100 rounded-lg transition-all duration-200"
                      title="Удалить"
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3" onClick={() => handleOpenGroup(group.slug)}>
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-[#8eba1e]" />
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getVoltageColor(
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
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#8eba1e] focus:border-[#8eba1e] transition-all duration-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Напряжение</label>
                <select
                  value={newGroupVoltage}
                  onChange={(e) => setNewGroupVoltage(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#8eba1e] focus:border-[#8eba1e] transition-all duration-200"
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
                className="px-4 py-2 rounded-lg bg-[#8eba1e] text-white hover:bg-[#7aa31a] transition-all duration-200 shadow-md hover:shadow-lg"
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
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#8eba1e] focus:border-[#8eba1e] transition-all duration-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Напряжение</label>
                <select
                  value={editVoltage}
                  onChange={(e) => setEditVoltage(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#8eba1e] focus:border-[#8eba1e] transition-all duration-200"
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
                className="px-4 py-2 rounded-lg bg-[#8eba1e] text-white hover:bg-[#7aa31a] transition-all duration-200 shadow-md hover:shadow-lg"
              >
                Сохранить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </div>
    </RoleGuard>
  );
}
