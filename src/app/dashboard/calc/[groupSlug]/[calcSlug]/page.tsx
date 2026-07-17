'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useCalculations } from '@/hooks/useCalculations';
import { CalculationHeader } from './components/CalculationHeader';
import { CalculationEditForm } from './components/CalculationEditForm';
import { Toast } from './components/Toast';
import { updateCalculation } from '@/api/calculations';
import { normalizeCellType, getCellTypeLabel } from '@/domain/calculation/cellTypes';
import { formatRzaCellTargets } from '@/domain/calculation/rzaCellTargets';
import { CalculationSummary } from './components/CalculationSummary';
import RoleGuard from '@/components/common/RoleGuard';
import { UserRole } from '@/types/user';
import { API_FALLBACK_CALCULATION_RATES } from '@/utils/calculationSettings';
import { isCustomPercentagesGroup } from '@/domain/calculation/customPercentagesGroups';
import { CellType } from '@/types/calculation';
import type { RzaCellTarget } from '@/domain/calculation/rzaCellTargets';

interface CalculationMaterial {
  id?: number;
  name: string;
  unit: string;
  price: number;
  quantity: number;
}

interface CalculationCategory {
  name: string;
  items: CalculationMaterial[];
}

interface CellMaterial {
  id: number;
  name: string;
  price: number;
  unit: string;
  code: string;
  type: 'switch' | 'rza' | 'counter' | 'sr' | 'tsn' | 'tn' | 'tt' | 'pu' | 'disconnector' | 'busbar' | 'busbridge' | 'withdrawable_breaker' | 'molded_case_breaker' | 'rps' | 'rubilnik';
}

interface CellConfiguration {
  type: CellType;
  rzaCellTargets?: RzaCellTarget[];
  materials: {
    switch?: CellMaterial[];
    rza?: CellMaterial[];
    counter?: CellMaterial[];
    sr?: CellMaterial[];
    tsn?: CellMaterial[];
    tn?: CellMaterial[];
    tt?: CellMaterial[];
    pu?: CellMaterial[];
    disconnector?: CellMaterial[];
    busbar?: CellMaterial[];
    busbridge?: CellMaterial[];
    withdrawable_breaker?: CellMaterial[];
    molded_case_breaker?: CellMaterial[];
    rps?: CellMaterial[];
    rubilnik?: CellMaterial[];
  };
}

interface CalculationData {
  categories: CalculationCategory[];
  calculation: {
    manufacturingHours: number;
    hourlyRate?: number;
    overheadPercentage?: number;
    adminPercentage?: number;
    plannedProfitPercentage?: number;
    ndsPercentage?: number;
  };
  cellConfig?: CellConfiguration;
}

interface Calculation {
  id: number;
  name: string;
  slug: string;
  data: CalculationData;
  createdAt?: string;
  updatedAt?: string;
}

// Компонент-хелпер для отображения строки материала ячейки
interface MaterialRowProps {
  materials: CellMaterial[] | undefined;
  label: string;
  showSeparator?: boolean;
}

const MaterialRow = ({ materials, label, showSeparator }: MaterialRowProps) => {
  if (!materials || materials.length === 0) return null;
  
  return (
    <>
      {materials.map((material, index) => (
        <tr key={`${material.id}-${index}`}>
          <td className="px-4 py-2.5 whitespace-nowrap text-xs text-gray-800">
            {index === 0 ? label : ''}
          </td>
          <td className="px-4 py-2.5 text-xs text-gray-900">
            {material.name}
          </td>
          <td className="px-4 py-2.5 whitespace-nowrap text-xs text-gray-900 text-right">
            {material.price.toLocaleString()} ₸
          </td>
        </tr>
      ))}
      {showSeparator && (
        <tr>
          <td colSpan={3} className="px-4 py-1.5">
            <div className="border-t border-gray-100"></div>
          </td>
        </tr>
      )}
    </>
  );
};

// Конфигурация материалов для отображения
const MATERIAL_CONFIG = [
  { key: 'switch', label: 'Выключатель' },
  { key: 'withdrawable_breaker', label: 'Автомат выкатной' },
  { key: 'molded_case_breaker', label: 'Автомат литой корпус' },
  { key: 'rza', label: 'РЗА' },
  { key: 'counter', label: 'Счетчик' },
  { key: 'sr', label: 'СР' },
  { key: 'tsn', label: 'ТСН' },
  { key: 'tn', label: 'ТН' },
  { key: 'tt', label: 'Трансформатор тока' },
  { key: 'pu', label: 'ПУ' },
  { key: 'disconnector', label: 'Разъединитель' },
  { key: 'busbar', label: 'Сборные шины' },
  { key: 'busbridge', label: 'Шинный мост' },
  { key: 'rps', label: 'РПС' },
  { key: 'rubilnik', label: 'Рубильник' },
] as const;

const toSavedNumber = (value: unknown, fallback: number): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export default function CalculationDetailPage() {
  const { groupSlug, calcSlug } = useParams() as { groupSlug: string; calcSlug: string };
  const decodedGroupSlug = decodeURIComponent(groupSlug);
  const editablePercentages = isCustomPercentagesGroup(decodedGroupSlug);
  const { fetchCalculation, selectedCalculation } = useCalculations();
  const [isEditing, setIsEditing] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (groupSlug && calcSlug) {
      fetchCalculation(groupSlug, calcSlug);
    }
  }, [groupSlug, calcSlug]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async (updatedCalculation: Calculation) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');

      // Проверяем, что все материалы имеют валидные ID (только если есть материалы)
      if (updatedCalculation.data.categories.some(cat => cat.items.length > 0)) {
        const materialsWithoutId = updatedCalculation.data.categories.flatMap(cat => 
          cat.items.filter(item => !item.id || item.id <= 0)
        );
        
        if (materialsWithoutId.length > 0) {
          const materialNames = materialsWithoutId.map(item => item.name || 'Без названия').join(', ');
          throw new Error(`Следующие материалы не выбраны: ${materialNames}. Пожалуйста, выберите материалы из списка.`);
        }
      }

      const cellType = updatedCalculation.data.cellConfig?.type;
      const validCellType = normalizeCellType(cellType);

      // Отладочная информация
      console.log('🔍 Debug - cellConfig.materials type:', typeof updatedCalculation.data.cellConfig?.materials);
      console.log('🔍 Debug - cellConfig.materials isArray:', Array.isArray(updatedCalculation.data.cellConfig?.materials));
      console.log('🔍 Debug - cellConfig.materials value:', updatedCalculation.data.cellConfig?.materials);

      const payload = {
        name: updatedCalculation.name,
        slug: updatedCalculation.slug?.trim() || calcSlug,
        data: {
          categories: updatedCalculation.data.categories
            .filter(cat => cat.items.length > 0) // Фильтруем только категории с материалами
            .map((cat: CalculationCategory) => ({
              name: cat.name,
              items: cat.items.map((item: CalculationMaterial) => ({
                id: item.id, // ID уже проверен выше, используем как есть
                name: item.name,
                unit: item.unit,
                price: Number(item.price),
                quantity: Number(item.quantity),
              })),
            })),
          calculation: {
            manufacturingHours: toSavedNumber(
              updatedCalculation.data.calculation.manufacturingHours,
              API_FALLBACK_CALCULATION_RATES.manufacturingHours ?? 1
            ),
            hourlyRate: toSavedNumber(
              updatedCalculation.data.calculation.hourlyRate,
              API_FALLBACK_CALCULATION_RATES.hourlyRate
            ),
            overheadPercentage: toSavedNumber(
              updatedCalculation.data.calculation.overheadPercentage,
              API_FALLBACK_CALCULATION_RATES.overheadPercentage
            ),
            adminPercentage: toSavedNumber(
              updatedCalculation.data.calculation.adminPercentage,
              API_FALLBACK_CALCULATION_RATES.adminPercentage
            ),
            plannedProfitPercentage: toSavedNumber(
              updatedCalculation.data.calculation.plannedProfitPercentage,
              API_FALLBACK_CALCULATION_RATES.plannedProfitPercentage
            ),
            ndsPercentage: toSavedNumber(
              updatedCalculation.data.calculation.ndsPercentage,
              API_FALLBACK_CALCULATION_RATES.ndsPercentage
            ),
          },
          cellConfig: {
            ...updatedCalculation.data.cellConfig,
            type: validCellType,
            materials: updatedCalculation.data.cellConfig?.materials && typeof updatedCalculation.data.cellConfig.materials === 'object' && !Array.isArray(updatedCalculation.data.cellConfig.materials)
              ? updatedCalculation.data.cellConfig.materials
              : {},
          },
        },
      };

      console.log('🔍 Debug - Final payload cellConfig.materials:', payload.data.cellConfig.materials);
      console.log('🔍 Debug - Final payload categories:', payload.data.categories);
      console.log('🔍 Debug - Complete payload:', JSON.stringify(payload, null, 2));

      await updateCalculation(groupSlug, calcSlug, payload, token);
      await fetchCalculation(groupSlug, calcSlug);
      // setIsEditing(false); // Убираем, чтобы остаться в режиме редактирования
      setToast({ message: 'Калькуляция успешно обновлена', type: 'success' });
    } catch (error) {
      console.error('❌ Error updating calculation:', error);
      setToast({ message: 'Ошибка при обновлении калькуляции', type: 'error' });
      // При ошибке предлагаем пользователю решить, остаться в режиме редактирования или выйти
      if (confirm('Произошла ошибка при сохранении. Хотите остаться в режиме редактирования для исправления ошибки?')) {
        // Пользователь хочет остаться в режиме редактирования
        console.log('Пользователь остался в режиме редактирования для исправления ошибки');
      } else {
        // Пользователь хочет выйти из режима редактирования
        setIsEditing(false);
      }
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleFinishEditing = () => {
    setIsEditing(false);
  };

  const calculateTotalMaterialsCost = () => {
    let total = 0;
    selectedCalculation?.data?.categories?.forEach((category) => {
      category.items?.forEach((item) => {
        total += item.price * item.quantity;
      });
    });
    return total;
  };

  if (!selectedCalculation) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="p-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <RoleGuard
      allowedRoles={[UserRole.ADMIN, UserRole.PTO]}
      redirectTo="/dashboard"
      pagePath={`/dashboard/calc/${groupSlug}/${calcSlug}`}
    >
      <div className="h-[calc(100vh-65px)] overflow-y-auto bg-gradient-to-b from-[#f9fbf1] to-gray-50">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-6 py-4">
        <div className="bg-white rounded-xl shadow-sm border border-[#8eba1e]/20 p-4 sm:p-5">
          <CalculationHeader name={selectedCalculation.name} onEdit={handleEdit} />

          {isEditing ? (
            <CalculationEditForm
              groupSlug={decodeURIComponent(groupSlug)}
              calculation={{
                id: selectedCalculation.id,
                name: selectedCalculation.name,
                slug: selectedCalculation.slug,
                data: {
                  categories: selectedCalculation.data.categories.map(cat => ({
                    name: cat.name,
                    items: cat.items.map(item => ({
                      id: (item as any).id,
                      name: item.name,
                      unit: item.unit,
                      price: item.price,
                      quantity: item.quantity,
                    })),
                  })),
                  calculation: {
                    manufacturingHours: toSavedNumber(
                      selectedCalculation.data.calculation?.manufacturingHours,
                      API_FALLBACK_CALCULATION_RATES.manufacturingHours ?? 1
                    ),
                    hourlyRate: selectedCalculation.data.calculation?.hourlyRate,
                    overheadPercentage:
                      selectedCalculation.data.calculation?.overheadPercentage,
                    adminPercentage: selectedCalculation.data.calculation?.adminPercentage,
                    plannedProfitPercentage:
                      selectedCalculation.data.calculation?.plannedProfitPercentage,
                    ndsPercentage: selectedCalculation.data.calculation?.ndsPercentage,
                  },
                  cellConfig: selectedCalculation.data.cellConfig ? {
                    type: (selectedCalculation.data.cellConfig.type as CellType) || '10kv',
                    rzaCellTargets: (selectedCalculation.data.cellConfig as CellConfiguration)
                      .rzaCellTargets,
                    materials: selectedCalculation.data.cellConfig.materials || {},
                  } as CellConfiguration : undefined,
                },
              }}
              onSave={handleSave}
              onCancel={handleCancel}
              onFinishEditing={handleFinishEditing}
            />
          ) : (
            <div className="space-y-5">
              {/* Конфигурация ячейки */}
              {selectedCalculation.data?.cellConfig && (
                <div className="bg-white rounded-xl border border-[#8eba1e]/20 p-4">
                  <h2 className="text-lg font-semibold text-gray-900 mb-3 border-l-4 border-[#8eba1e] pl-3">
                    Конфигурация ячейки
                  </h2>
                  <div className="space-y-3">
                    <div className="flex items-center text-sm">
                      <span className="text-gray-700 w-28">Тип ячейки:</span>
                      <span className="font-semibold text-[#8eba1e] bg-[#8eba1e]/10 px-2.5 py-1 rounded-md">
                        {getCellTypeLabel(selectedCalculation.data.cellConfig.type)}
                      </span>
                    </div>
                    {selectedCalculation.data.cellConfig.type === 'rza' &&
                      (selectedCalculation.data.cellConfig as CellConfiguration).rzaCellTargets
                        ?.length ? (
                      <div className="flex items-start text-sm">
                        <span className="text-gray-700 w-28 shrink-0">Ячейки РЗА:</span>
                        <span className="font-medium text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md">
                          {formatRzaCellTargets(
                            (selectedCalculation.data.cellConfig as CellConfiguration).rzaCellTargets
                          )}
                        </span>
                      </div>
                    ) : null}
                    <div className="space-y-2">
                      <h3 className="text-base font-medium text-gray-900">Материалы</h3>
                      <div className="overflow-x-auto rounded-md border border-gray-100">
                      <table className="w-full text-xs">
                        <thead className="bg-[#8eba1e]/10 sticky top-0">
                          <tr>
                            <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">
                              Тип
                            </th>
                            <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">
                              Наименование
                            </th>
                            <th className="px-4 py-2 text-right font-medium text-gray-500 uppercase tracking-wider">
                              Цена
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                          {MATERIAL_CONFIG.map(({ key, label }, index) => {
                            const materials = selectedCalculation.data.cellConfig?.materials[key as keyof typeof selectedCalculation.data.cellConfig.materials];
                            return (
                              <MaterialRow
                                key={key}
                                materials={materials}
                                label={label}
                                showSeparator={index < MATERIAL_CONFIG.length - 1 && materials && materials.length > 0}
                              />
                            );
                          })}
                        </tbody>
                      </table>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {selectedCalculation.data?.categories?.map(
                (cat: CalculationCategory, idx: number) => (
                  <div
                    key={idx}
                    className="bg-white rounded-xl border border-[#8eba1e]/20 overflow-hidden"
                  >
                    <div className="bg-[#8eba1e]/10 px-4 py-3 border-b border-[#8eba1e]/20">
                      <h2 className="text-lg font-semibold text-gray-900">{cat.name}</h2>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead className="bg-gray-50 sticky top-0 z-10">
                          <tr>
                            <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">
                              Наименование
                            </th>
                            <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">
                              Ед.
                            </th>
                            <th className="px-4 py-2 text-right font-medium text-gray-500 uppercase tracking-wider">
                              Кол-во
                            </th>
                            <th className="px-4 py-2 text-right font-medium text-gray-500 uppercase tracking-wider">
                              Цена
                            </th>
                            <th className="px-4 py-2 text-right font-medium text-gray-500 uppercase tracking-wider">
                              Сумма
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                          {cat.items?.map((item: CalculationMaterial, i: number) => (
                            <tr key={i} className="hover:bg-[#8eba1e]/5 transition-colors">
                              <td className="px-4 py-2.5 whitespace-nowrap text-xs text-gray-900">
                                {item.name}
                              </td>
                              <td className="px-4 py-2.5 whitespace-nowrap text-xs text-gray-500">
                                {item.unit}
                              </td>
                              <td className="px-4 py-2.5 whitespace-nowrap text-xs text-gray-900 text-right">
                                {item.quantity}
                              </td>
                              <td className="px-4 py-2.5 whitespace-nowrap text-xs text-gray-900 text-right">
                                {item.price.toLocaleString()} ₸
                              </td>
                              <td className="px-4 py-2.5 whitespace-nowrap text-xs text-gray-900 text-right">
                                {(item.price * item.quantity).toLocaleString()} ₸
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="bg-[#8eba1e]/10">
                          <tr>
                            <td
                              colSpan={4}
                              className="px-4 py-2.5 text-xs font-semibold text-gray-900 text-right"
                            >
                              Итого по категории:
                            </td>
                            <td className="px-4 py-2.5 text-xs font-semibold text-[#8eba1e] text-right">
                              {cat.items
                                ?.reduce(
                                  (sum: number, item: CalculationMaterial) =>
                                    sum + item.price * item.quantity,
                                  0
                                )
                                .toLocaleString()}{' '}
                              ₸
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                )
              )}

              <CalculationSummary
                totalMaterialsCost={calculateTotalMaterialsCost()}
                onValuesChange={() => {}}
                isReadOnly={true}
                editablePercentages={editablePercentages}
                initialValues={{
                  manufacturingHours: toSavedNumber(
                    selectedCalculation.data?.calculation?.manufacturingHours,
                    API_FALLBACK_CALCULATION_RATES.manufacturingHours ?? 1
                  ),
                  hourlyRate: selectedCalculation.data?.calculation?.hourlyRate,
                  overheadPercentage:
                    selectedCalculation.data?.calculation?.overheadPercentage,
                  adminPercentage: selectedCalculation.data?.calculation?.adminPercentage,
                  plannedProfitPercentage:
                    selectedCalculation.data?.calculation?.plannedProfitPercentage,
                  ndsPercentage: selectedCalculation.data?.calculation?.ndsPercentage,
                }}
              />
            </div>
          )}
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
    </RoleGuard>
  );
}
