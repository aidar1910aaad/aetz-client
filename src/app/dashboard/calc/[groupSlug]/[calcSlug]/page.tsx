'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useCalculations } from '@/hooks/useCalculations';
import { CalculationHeader } from './components/CalculationHeader';
import { CalculationEditForm } from './components/CalculationEditForm';
import { Toast } from './components/Toast';
import { updateCalculation } from '@/api/calculations';
import { CalculationSummary } from './components/CalculationSummary';
import RoleGuard from '@/components/common/RoleGuard';
import { UserRole } from '@/types/user';

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
  type: '0.4kv' | '10kv' | '20kv' | 'rza' | 'pu' | 'disconnector' | 'busbar' | 'busbridge' | 'switch' | 'tn' | 'tsn' | 'input' | 'section_switch' | 'outgoing';
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
    hourlyRate: number;
    overheadPercentage: number;
    adminPercentage: number;
    plannedProfitPercentage: number;
    ndsPercentage: number;
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
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
            {index === 0 ? label : ''}
          </td>
          <td className="px-6 py-4 text-sm text-gray-900">
            {material.name}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
            {material.price.toLocaleString()} ₸
          </td>
        </tr>
      ))}
      {showSeparator && (
        <tr>
          <td colSpan={3} className="px-6 py-2">
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


export default function CalculationDetailPage() {
  const { groupSlug, calcSlug } = useParams() as { groupSlug: string; calcSlug: string };
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

      // Validate and fix cell type if needed
      const validCellTypes = [
        '0.4kv',
        '10kv',
        '20kv',
        'rza',
        'pu',
        'disconnector',
        'busbar',
        'busbridge',
        'switch',
        'tn',
        'tsn',
        'input',
        'section_switch',
        'outgoing',
      ] as const;
      const cellType = updatedCalculation.data.cellConfig?.type;

      const validCellType = validCellTypes.includes(cellType as any) ? cellType : '10kv';

      // Отладочная информация
      console.log('🔍 Debug - cellConfig.materials type:', typeof updatedCalculation.data.cellConfig?.materials);
      console.log('🔍 Debug - cellConfig.materials isArray:', Array.isArray(updatedCalculation.data.cellConfig?.materials));
      console.log('🔍 Debug - cellConfig.materials value:', updatedCalculation.data.cellConfig?.materials);

      const payload = {
        name: updatedCalculation.name,
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
            manufacturingHours: Number(updatedCalculation.data.calculation.manufacturingHours),
            hourlyRate: Number(updatedCalculation.data.calculation.hourlyRate),
            overheadPercentage: Number(updatedCalculation.data.calculation.overheadPercentage),
            adminPercentage: Number(updatedCalculation.data.calculation.adminPercentage),
            plannedProfitPercentage: Number(
              updatedCalculation.data.calculation.plannedProfitPercentage
            ),
            ndsPercentage: Number(updatedCalculation.data.calculation.ndsPercentage),
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
      <div className="h-[calc(100vh-65px)] overflow-y-auto bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <CalculationHeader name={selectedCalculation.name} onEdit={handleEdit} />

          {isEditing ? (
            <CalculationEditForm
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
                    manufacturingHours: selectedCalculation.data.calculation?.manufacturingHours || 1,
                    hourlyRate: selectedCalculation.data.calculation?.hourlyRate || 2000,
                    overheadPercentage: selectedCalculation.data.calculation?.overheadPercentage || 10,
                    adminPercentage: selectedCalculation.data.calculation?.adminPercentage || 15,
                    plannedProfitPercentage: selectedCalculation.data.calculation?.plannedProfitPercentage || 10,
                    ndsPercentage: selectedCalculation.data.calculation?.ndsPercentage || 12,
                  },
                  cellConfig: selectedCalculation.data.cellConfig ? {
                    type: (selectedCalculation.data.cellConfig.type as any) || '10kv',
                    materials: selectedCalculation.data.cellConfig.materials || {},
                  } as CellConfiguration : undefined,
                },
              }}
              onSave={handleSave}
              onCancel={handleCancel}
              onFinishEditing={handleFinishEditing}
            />
          ) : (
            <div className="space-y-8">
              {/* Конфигурация ячейки */}
              {selectedCalculation.data?.cellConfig && (
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Конфигурация ячейки</h2>
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <span className="text-gray-700 w-32">Тип ячейки:</span>
                      <span className="font-medium">
                        {selectedCalculation.data.cellConfig.type === '0.4kv' && '0.4 кВ'}
                        {selectedCalculation.data.cellConfig.type === '10kv' && '10 кВ'}
                        {selectedCalculation.data.cellConfig.type === '20kv' && '20 кВ'}
                        {selectedCalculation.data.cellConfig.type === 'rza' && 'РЗА'}
                        {selectedCalculation.data.cellConfig.type === 'pu' && 'ПУ'}
                        {selectedCalculation.data.cellConfig.type === 'disconnector' &&
                          'Разъединитель'}
                        {selectedCalculation.data.cellConfig.type === 'busbar' && 'Сборные шины'}
                        {selectedCalculation.data.cellConfig.type === 'busbridge' && 'Шинный мост'}
                        {selectedCalculation.data.cellConfig.type === 'switch' && 'Выключатель'}
                        {selectedCalculation.data.cellConfig.type === 'tn' &&
                          'Трансформатор напряжения'}
                        {selectedCalculation.data.cellConfig.type === 'tsn' && 'ТСН'}
                        {selectedCalculation.data.cellConfig.type === 'input' && 'Ввод'}
                        {selectedCalculation.data.cellConfig.type === 'section_switch' && 'Секционный выключатель'}
                        {selectedCalculation.data.cellConfig.type === 'outgoing' && 'Отходящая'}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-lg font-medium text-gray-900">Материалы</h3>
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Тип
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Наименование
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Цена
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
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
              )}

              {selectedCalculation.data?.categories?.map(
                (cat: CalculationCategory, idx: number) => (
                  <div
                    key={idx}
                    className="bg-white rounded-lg border border-gray-200 overflow-hidden"
                  >
                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                      <h2 className="text-xl font-semibold text-gray-900">{cat.name}</h2>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Наименование
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Ед.
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Цена
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Кол-во
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Сумма
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {cat.items?.map((item: CalculationMaterial, i: number) => (
                            <tr key={i} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {item.name}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {item.unit}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                                {item.price.toLocaleString()} ₸
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                                {item.quantity}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                                {(item.price * item.quantity).toLocaleString()} ₸
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="bg-gray-50">
                          <tr>
                            <td
                              colSpan={4}
                              className="px-6 py-4 text-sm font-medium text-gray-900 text-right"
                            >
                              Итого по категории:
                            </td>
                            <td className="px-6 py-4 text-sm font-medium text-gray-900 text-right">
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
                initialValues={{
                  manufacturingHours: selectedCalculation.data?.calculation?.manufacturingHours || 1,
                  hourlyRate: selectedCalculation.data?.calculation?.hourlyRate || 2000,
                  overheadPercentage: selectedCalculation.data?.calculation?.overheadPercentage || 10,
                  adminPercentage: selectedCalculation.data?.calculation?.adminPercentage || 15,
                  plannedProfitPercentage: selectedCalculation.data?.calculation?.plannedProfitPercentage || 10,
                  ndsPercentage: selectedCalculation.data?.calculation?.ndsPercentage || 12,
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
