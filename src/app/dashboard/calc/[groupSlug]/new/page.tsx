'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { CalculationEditForm } from '../[calcSlug]/components/CalculationEditForm';
import { createCalculation } from '@/api/calculations';
import { useCalculations } from '@/hooks/useCalculations';
import RoleGuard from '@/components/common/RoleGuard';
import { UserRole } from '@/types/user';
import { normalizeCellType } from '@/domain/calculation/cellTypes';

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

      // Проверяем, что название калькуляции не пустое
      if (!calculation.name || calculation.name.trim() === '') {
        throw new Error('Название калькуляции обязательно для заполнения. Пожалуйста, введите название.');
      }

      // Проверяем минимальную длину названия
      if (calculation.name.trim().length < 3) {
        throw new Error('Название калькуляции должно содержать минимум 3 символа.');
      }

      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');

      // Проверяем, что все материалы имеют валидные ID (только если есть материалы)
      if (calculation.data.categories.some(cat => cat.items.length > 0)) {
        const materialsWithoutId = calculation.data.categories.flatMap(cat => 
          cat.items.filter(item => !item.id || item.id <= 0)
        );
        
        if (materialsWithoutId.length > 0) {
          const materialNames = materialsWithoutId.map(item => item.name || 'Без названия').join(', ');
          throw new Error(`Следующие материалы не выбраны: ${materialNames}. Пожалуйста, выберите материалы из списка.`);
        }
      }

      // Убираем проверку на обязательное наличие материалов
      // Теперь можно создавать калькуляцию без материалов
      // Если материалы есть - они будут добавлены, если нет - калькуляция создастся пустой

      if (!calculation.slug || calculation.slug.trim().length < 3) {
        throw new Error('Slug калькуляции должен содержать минимум 3 символа.');
      }

      const payload = {
        name: calculation.name,
        slug: calculation.slug.trim(),
        groupId: selectedGroup.id,
        data: {
          categories: calculation.data.categories
            .filter(cat => cat.items.length > 0) // Фильтруем только категории с материалами
            .map((cat: any) => ({
              name: cat.name,
              items: cat.items.map((item: any) => ({
                id: item.id, // ID уже проверен выше, используем как есть
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
          cellConfig: calculation.data.cellConfig ? {
            type: normalizeCellType(calculation.data.cellConfig.type),
            materials: calculation.data.cellConfig.materials && typeof calculation.data.cellConfig.materials === 'object' && !Array.isArray(calculation.data.cellConfig.materials)
              ? calculation.data.cellConfig.materials
              : {},
          } : {
            type: '10kv',
            materials: {},
          },
        },
      };

      console.log('🔍 Debug - Creating calculation payload:', JSON.stringify(payload, null, 2));

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
    id: 0, // Временный ID для новой калькуляции
    name: '',
    slug: '', // Будет сгенерирован при сохранении
    data: {
      categories: [],
      calculation: {
        manufacturingHours: 0,
        hourlyRate: 2000,
        overheadPercentage: 10,
        adminPercentage: 15,
        plannedProfitPercentage: 10,
        ndsPercentage: 12,
      },
      cellConfig: {
        type: '10kv' as const, // Явно указываем тип CellType
        materials: {},
      },
    },
  };

  return (
    <RoleGuard
      allowedRoles={[UserRole.ADMIN, UserRole.PTO]}
      redirectTo="/dashboard"
      pagePath={`/dashboard/calc/${groupSlug}/new`}
    >
      <div className="h-[calc(100vh-64px)] overflow-y-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Создание новой калькуляции</h1>

          <CalculationEditForm
            calculation={initialCalculation}
            groupSlug={decodeURIComponent(groupSlug)}
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
    </RoleGuard>
  );
}
