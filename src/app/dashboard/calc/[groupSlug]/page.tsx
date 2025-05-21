'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useCalculations } from '@/hooks/useCalculations';
import { FileText } from 'lucide-react';

export default function GroupCalculationsPage() {
  const router = useRouter();
  const { groupSlug } = useParams() as { groupSlug: string };
  const { selectedGroup, setSelectedGroup, groups, calculations, loading } = useCalculations();

  useEffect(() => {
    const group = groups.find((g) => g.slug === groupSlug);
    if (group) setSelectedGroup(group);
  }, [groupSlug, groups, setSelectedGroup]);

  const handleOpenCalc = (calcSlug: string) => {
    router.push(`/dashboard/calc/${groupSlug}/${calcSlug}`);
  };

  return (
    <div className="px-8 py-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        Калькуляции в группе: {selectedGroup?.name || groupSlug}
      </h2>

      {loading ? (
        <p className="text-gray-500">Загрузка...</p>
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
