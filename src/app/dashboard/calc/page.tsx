'use client';

import { useRouter } from 'next/navigation';
import { useCalculations } from '@/hooks/useCalculations';
import { FolderPlus, Folder } from 'lucide-react';
import { useState } from 'react';

export default function CalculationsPage() {
  const router = useRouter();
  const { groups, loading, handleCreateGroup } = useCalculations();

  const [modalOpen, setModalOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');

  const handleOpenGroup = (slug: string) => {
    router.push(`/dashboard/calc/${encodeURIComponent(slug)}`);
  };

  const handleCreate = async () => {
    if (!newGroupName.trim()) return;
    const slug = newGroupName.toLowerCase().replace(/\s+/g, '-');
    await handleCreateGroup({ name: newGroupName, slug });
    setNewGroupName('');
    setModalOpen(false);
  };

  return (
    <div className="h-[calc(100vh-110px)] overflow-y-auto px-8 py-8 bg-gradient-to-br from-gray-50 to-white">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold text-gray-800">Группы калькуляций</h2>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 bg-[#3A55DF] text-white px-4 py-2 rounded hover:bg-[#2e46c5] transition text-sm"
        >
          <FolderPlus className="w-5 h-5" />
          Добавить папку
        </button>
      </div>

      {loading ? (
        <p className="text-gray-500">Загрузка...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group) => (
            <div
              key={group.id}
              onClick={() => handleOpenGroup(group.slug)}
              className="group cursor-pointer bg-white border border-gray-200 hover:border-[#3A55DF] shadow-sm hover:shadow-md rounded-xl p-6 transition"
            >
              <div className="flex items-center gap-3 mb-2">
                <Folder className="w-6 h-6 text-[#3A55DF]" />
                <h3 className="text-lg font-semibold text-gray-800 group-hover:text-[#3A55DF] transition">
                  {group.name}
                </h3>
              </div>
              <p className="text-sm text-gray-600">Slug: {group.slug}</p>
            </div>
          ))}
        </div>
      )}

      {/* Модалка (временно простая) */}
      {modalOpen && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] flex items-center justify-center z-50">
          {' '}
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">Новая папка</h3>
            <input
              type="text"
              placeholder="Введите название"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              className="w-full border border-gray-300 rounded px-4 py-2 mb-4"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
              >
                Отмена
              </button>
              <button
                onClick={handleCreate}
                className="px-4 py-2 rounded bg-[#3A55DF] text-white hover:bg-[#2e46c5]"
              >
                Создать
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
