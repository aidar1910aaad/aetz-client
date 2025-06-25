'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { CalculationEditForm } from '../[calcSlug]/components/CalculationEditForm';
import { createCalculation } from '@/api/calculations';
import { useCalculations } from '@/hooks/useCalculations';

export default function CreateCalculationPage() {
  const router = useRouter();
  const { groupSlug } = useParams() as { groupSlug: string };
  const { selectedGroup, setSelectedGroup, groups } = useCalculations();
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    console.log('Current groups:', groups);
    const decodedSlug = decodeURIComponent(groupSlug);
    console.log('Looking for group with slug:', decodedSlug);
    const group = groups.find((g) => g.slug === decodedSlug);
    console.log('Found group:', group);
    if (group) {
      console.log('Setting selected group:', group);
      setSelectedGroup(group);
    }
  }, [groupSlug, groups, setSelectedGroup]);

  const handleSave = async (calculation: any) => {
    try {
      console.log('Current selectedGroup:', selectedGroup);
      if (!selectedGroup) {
        throw new Error('Группа не найдена');
      }

      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');

      // Создаем slug из названия
      const slug = calculation.name
        .toLowerCase()
        .replace(/[^a-z0-9а-яё]/gi, '-') // Заменяем все не-буквы и не-цифры на дефис
        .replace(/-+/g, '-') // Заменяем множественные дефисы на один
        .replace(/^-|-$/g, ''); // Убираем дефисы в начале и конце

      const payload = {
        name: calculation.name,
        slug: slug,
        groupId: selectedGroup.id,
        data: {
          categories: calculation.data.categories.map((cat: any) => ({
            name: cat.name,
            items: cat.items.map((item: any) => ({
              id: item.id || null,
              name: item.name,
              unit: item.unit,
              price: Number(item.price),
              quantity: Number(item.quantity),
            })),
          })),
          calculation: {
            manufacturingHours: Number(calculation.data.calculation.manufacturingHours),
            hourlyRate: Number(calculation.data.calculation.hourlyRate),
            overheadPercentage: Number(calculation.data.calculation.overheadPercentage),
            adminPercentage: Number(calculation.data.calculation.adminPercentage),
            plannedProfitPercentage: Number(calculation.data.calculation.plannedProfitPercentage),
            ndsPercentage: Number(calculation.data.calculation.ndsPercentage),
          },
        },
      };

      await createCalculation(payload, token);
      setToast({ message: 'Калькуляция успешно создана', type: 'success' });
      router.push(`/dashboard/calc/${groupSlug}`);
    } catch (error) {
      console.error('Error creating calculation:', error);
      setToast({ message: 'Ошибка при создании калькуляции', type: 'error' });
    }
  };

  const handleCancel = () => {
    router.back();
  };

  const initialCalculation = {
    name: '',
    data: {
      categories: [],
      calculation: {
        manufacturingHours: 1,
        hourlyRate: 2000,
        overheadPercentage: 10,
        adminPercentage: 15,
        plannedProfitPercentage: 10,
        ndsPercentage: 12,
      },
    },
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Создание новой калькуляции</h1>

          <CalculationEditForm
            calculation={initialCalculation}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        </div>
      </div>

      {toast && (
        <div
          className={`fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg ${
            toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
          } text-white`}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}
