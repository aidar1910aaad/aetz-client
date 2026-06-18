'use client';

import { useRouter } from 'next/navigation';
import { useCalculations } from '@/hooks/useCalculations';
import { Plus, Trash2, Layers, Pencil } from 'lucide-react';
import { useMemo, useState } from 'react';
import { showToast } from '@/shared/modals/ToastProvider';
import RoleGuard from '@/components/common/RoleGuard';
import { UserRole } from '@/types/user';
import PageLoader from '@/shared/loader/PageLoader';
import { Select } from '@/components/ui/select';

type VoltageFilter = number | null;

const voltageOptions = [
  { value: 400, label: '0.4 кВ' },
  { value: 10, label: '10 кВ' },
  { value: 20, label: '20 кВ' },
] as const;

function getVoltageLabel(voltage?: number | null) {
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
}

function getVoltageBadgeClass(voltage?: number | null) {
  if (!voltage) return 'bg-gray-50 text-gray-600 ring-gray-200';
  switch (voltage) {
    case 400:
      return 'bg-emerald-50 text-emerald-800 ring-emerald-200/60';
    case 10:
      return 'bg-blue-50 text-blue-800 ring-blue-200/60';
    case 20:
      return 'bg-violet-50 text-violet-800 ring-violet-200/60';
    default:
      return 'bg-gray-50 text-gray-600 ring-gray-200';
  }
}

function Modal({
  title,
  onClose,
  children,
  footer,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white shadow-xl">
        <div className="border-b border-gray-100 px-5 py-4">
          <h3 className="text-base font-semibold text-gray-900">{title}</h3>
        </div>
        <div className="px-5 py-4">{children}</div>
        <div className="flex justify-end gap-2 border-t border-gray-100 px-5 py-4">{footer}</div>
      </div>
    </div>
  );
}

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
  const [voltageFilter, setVoltageFilter] = useState<VoltageFilter>(null);

  const filteredGroups = useMemo(() => {
    if (voltageFilter === null) return groups;
    return groups.filter((group) => group.voltageType === voltageFilter);
  }, [groups, voltageFilter]);

  const voltageCounts = useMemo(() => {
    return groups.reduce(
      (acc, group) => {
        const key = group.voltageType ?? 0;
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      },
      {} as Record<number, number>
    );
  }, [groups]);

  const handleOpenGroup = (slug: string) => {
    router.push(`/dashboard/calc/${encodeURIComponent(slug)}`);
  };

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
      // handled in hook
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
      // handled in hook
    }
  };

  const handleDelete = async (group: { id: number; name: string; slug: string }) => {
    if (!confirm(`Удалить группу «${group.name}»?`)) return;

    try {
      await handleDeleteGroup(group.id);
    } catch {
      // handled in hook
    }
  };

  if (loading) {
    return (
      <RoleGuard
        allowedRoles={[UserRole.ADMIN, UserRole.PTO]}
        redirectTo="/dashboard"
        pagePath="/dashboard/calc"
      >
        <div className="h-[calc(100vh-64px)]">
          <PageLoader inline />
        </div>
      </RoleGuard>
    );
  }

  return (
    <RoleGuard
      allowedRoles={[UserRole.ADMIN, UserRole.PTO]}
      redirectTo="/dashboard"
      pagePath="/dashboard/calc"
    >
      <div className="h-[calc(100vh-64px)] overflow-y-auto bg-gray-50">
        <div className="border-b border-[#7aa31a]/30 bg-gradient-to-r from-[#7aa31a] to-[#8eba1e] px-6 py-5">
          <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-white">Группы калькуляций</h1>
              <p className="mt-1 text-sm text-white/85">
                Справочники расчётов стоимости по типам оборудования
              </p>
            </div>
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-[#7aa31a] transition-colors hover:bg-white/90"
            >
              <Plus size={16} />
              Добавить группу
            </button>
          </div>
        </div>

        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
          {/* Toolbar */}
          <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <div className="rounded-lg border border-[#8eba1e]/20 bg-white px-4 py-2">
                <span className="text-sm text-gray-500">Всего: </span>
                <span className="text-sm font-semibold text-[#8eba1e]">{groups.length}</span>
                {voltageFilter !== null && (
                  <span className="ml-1 text-sm text-gray-400">
                    · показано {filteredGroups.length}
                  </span>
                )}
              </div>
              {voltageCounts[400] > 0 && (
                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-800 ring-1 ring-emerald-200/60">
                  0.4 кВ: {voltageCounts[400]}
                </span>
              )}
              {voltageCounts[10] > 0 && (
                <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-800 ring-1 ring-blue-200/60">
                  10 кВ: {voltageCounts[10]}
                </span>
              )}
              {voltageCounts[20] > 0 && (
                <span className="rounded-full bg-violet-50 px-2.5 py-1 text-xs font-medium text-violet-800 ring-1 ring-violet-200/60">
                  20 кВ: {voltageCounts[20]}
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-gray-600">Напряжение:</span>
              <div className="flex flex-wrap gap-1 rounded-lg border border-gray-200 bg-white p-1">
                <button
                  type="button"
                  onClick={() => setVoltageFilter(null)}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                    voltageFilter === null
                      ? 'bg-[#8eba1e] text-white'
                      : 'text-gray-600 hover:text-[#8eba1e]'
                  }`}
                >
                  Все
                </button>
                {voltageOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setVoltageFilter(option.value)}
                    className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                      voltageFilter === option.value
                        ? 'bg-[#8eba1e] text-white'
                        : 'text-gray-600 hover:text-[#8eba1e]'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Content */}
          {groups.length === 0 ? (
            <div className="rounded-lg border border-gray-200 bg-white px-6 py-16 text-center">
              <h3 className="text-base font-semibold text-gray-900">Групп пока нет</h3>
              <p className="mt-1 text-sm text-gray-500">Создайте первую группу калькуляций</p>
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#8eba1e] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#7aa31a]"
              >
                <Plus size={16} />
                Добавить группу
              </button>
            </div>
          ) : filteredGroups.length === 0 ? (
            <div className="rounded-lg border border-gray-200 bg-white px-6 py-16 text-center">
              <h3 className="text-base font-semibold text-gray-900">Нет групп с выбранным напряжением</h3>
              <button
                type="button"
                onClick={() => setVoltageFilter(null)}
                className="mt-4 text-sm font-medium text-[#8eba1e] hover:text-[#7aa31a]"
              >
                Показать все
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filteredGroups.map((group) => (
                <div
                  key={group.id}
                  className="group relative rounded-2xl border border-gray-200 border-t-[3px] border-t-transparent bg-white p-5 shadow-sm transition-all duration-300 hover:border-[#8eba1e]/25 hover:border-t-[#8eba1e] hover:shadow-md"
                >
                  <button
                    type="button"
                    onClick={() => handleDelete(group)}
                    className="absolute right-3 top-3 rounded-lg p-2 text-red-500 transition-colors hover:bg-red-50 hover:text-red-700"
                    title="Удалить"
                  >
                    <Trash2 size={16} />
                  </button>

                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => handleOpenGroup(group.slug)}
                    onKeyDown={(e) => e.key === 'Enter' && handleOpenGroup(group.slug)}
                    className="cursor-pointer"
                  >
                    <div className="mb-4 flex items-start gap-3 pr-8">
                      <div className="rounded-lg bg-gray-100 p-2.5 transition-colors duration-300 group-hover:bg-[#8eba1e]">
                        <Layers className="h-5 w-5 text-[#8eba1e] transition-colors group-hover:text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-base font-semibold leading-snug text-gray-900 transition-colors group-hover:text-[#8eba1e]">
                          {group.name}
                        </h3>
                        <span
                          className={`mt-2 inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${getVoltageBadgeClass(group.voltageType)}`}
                        >
                          {getVoltageLabel(group.voltageType)}
                        </span>
                      </div>
                    </div>

                    <div className="border-t border-gray-100 pt-3">
                      <p className="truncate text-xs text-gray-500">
                        <span className="font-medium text-gray-600">Slug:</span>{' '}
                        <code className="text-gray-500">{group.slug}</code>
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2 border-t border-gray-100 pt-4">
                    <button
                      type="button"
                      onClick={() => handleOpenGroup(group.slug)}
                      className="flex-1 rounded-lg bg-[#8eba1e]/10 py-2 text-xs font-medium text-[#7aa31a] transition-colors hover:bg-[#8eba1e]/20"
                    >
                      Открыть
                    </button>
                    <button
                      type="button"
                      onClick={() => handleEdit(group)}
                      className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-700 transition-colors hover:border-[#8eba1e] hover:text-[#8eba1e]"
                    >
                      <Pencil size={13} />
                      Изменить
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {modalOpen && (
          <Modal
            title="Новая группа калькуляций"
            onClose={() => {
              setModalOpen(false);
              setNewGroupName('');
              setNewGroupVoltage(10);
            }}
            footer={
              <>
                <button
                  type="button"
                  onClick={() => {
                    setModalOpen(false);
                    setNewGroupName('');
                    setNewGroupVoltage(10);
                  }}
                  className="rounded-lg px-4 py-2 text-sm text-gray-600 hover:bg-gray-100"
                >
                  Отмена
                </button>
                <button
                  type="button"
                  onClick={handleCreate}
                  className="rounded-lg bg-[#8eba1e] px-4 py-2 text-sm font-medium text-white hover:bg-[#7aa31a]"
                >
                  Создать
                </button>
              </>
            }
          >
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Название группы
                </label>
                <input
                  type="text"
                  placeholder="Например: Камера КСО А12-10"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-[#8eba1e] focus:outline-none focus:ring-1 focus:ring-[#8eba1e]"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Напряжение</label>
                <Select
                  value={newGroupVoltage}
                  onChange={(e) => setNewGroupVoltage(Number(e.target.value))}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-[#8eba1e] focus:outline-none"
                >
                  <option value={400}>0.4 кВ</option>
                  <option value={10}>10 кВ</option>
                  <option value={20}>20 кВ</option>
                </Select>
              </div>
            </div>
          </Modal>
        )}

        {editModalOpen && editingGroup && (
          <Modal
            title="Редактировать группу"
            onClose={() => {
              setEditModalOpen(false);
              setEditingGroup(null);
            }}
            footer={
              <>
                <button
                  type="button"
                  onClick={() => {
                    setEditModalOpen(false);
                    setEditingGroup(null);
                  }}
                  className="rounded-lg px-4 py-2 text-sm text-gray-600 hover:bg-gray-100"
                >
                  Отмена
                </button>
                <button
                  type="button"
                  onClick={handleUpdate}
                  className="rounded-lg bg-[#8eba1e] px-4 py-2 text-sm font-medium text-white hover:bg-[#7aa31a]"
                >
                  Сохранить
                </button>
              </>
            }
          >
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Название группы
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-[#8eba1e] focus:outline-none focus:ring-1 focus:ring-[#8eba1e]"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Напряжение</label>
                <Select
                  value={editVoltage}
                  onChange={(e) => setEditVoltage(Number(e.target.value))}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-[#8eba1e] focus:outline-none"
                >
                  <option value={400}>0.4 кВ</option>
                  <option value={10}>10 кВ</option>
                  <option value={20}>20 кВ</option>
                </Select>
              </div>
              <p className="text-xs text-gray-400">
                Slug: <code className="text-gray-600">{editingGroup.slug}</code>
              </p>
            </div>
          </Modal>
        )}
      </div>
    </RoleGuard>
  );
}
