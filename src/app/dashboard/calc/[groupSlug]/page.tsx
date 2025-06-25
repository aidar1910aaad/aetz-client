'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useCalculations } from '@/hooks/useCalculations';
import { FileText, Plus } from 'lucide-react';

export default function GroupCalculationsPage() {
  const router = useRouter();
  const { groupSlug } = useParams() as { groupSlug: string };
  const { selectedGroup, setSelectedGroup, groups, calculations, loading } = useCalculations();

  useEffect(() => {
    const decodedSlug = decodeURIComponent(groupSlug);
    console.log('Group page - Current groups:', groups);
    console.log('Group page - Looking for group with slug:', decodedSlug);
    const group = groups.find((g) => g.slug === decodedSlug);
    console.log('Group page - Found group:', group);
    if (group) {
      console.log('Group page - Setting selected group:', group);
      setSelectedGroup(group);
    }
  }, [groupSlug, groups, setSelectedGroup]);

  const handleOpenCalc = (calcSlug: string) => {
    router.push(`/dashboard/calc/${groupSlug}/${calcSlug}`);
  };

  const handleCreateNew = () => {
    router.push(`/dashboard/calc/${groupSlug}/new`);
  };

  const decodedGroupName = selectedGroup?.name || decodeURIComponent(groupSlug);

  return (
    <div className="px-8 py-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Калькуляции в группе: {decodedGroupName}
        </h2>
        <button
          onClick={handleCreateNew}
          className="inline-flex items-center px-4 py-2 bg-[#3A55DF] text-white rounded-lg hover:bg-[#2A45CF] transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Создать калькуляцию
        </button>
      </div>

      {loading ? (
        <p className="text-gray-500">Загрузка...</p>
      ) : calculations.length === 0 ? (
        <p className="text-gray-500">В этой группе пока нет калькуляций</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {calculations.map((calc) => (
            <div
              key={calc.id}
              onClick={() => handleOpenCalc(calc.slug)}
              className="cursor-pointer bg-white border rounded-xl p-4 shadow hover:border-[#3A55DF]"
            >
              <div className="flex items-center gap-3 mb-2">
                <FileText className="w-5 h-5 text-[#3A55DF]" />
                <h3 className="text-lg font-medium text-gray-800">{calc.name}</h3>
              </div>
              <p className="text-sm text-gray-600">Обновлено: {calc.updatedAt?.split('T')[0]}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
