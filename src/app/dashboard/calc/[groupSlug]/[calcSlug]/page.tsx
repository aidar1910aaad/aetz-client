'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useCalculations } from '@/hooks/useCalculations';
import { CalculationHeader } from './components/CalculationHeader';
import { CalculationEditForm } from './components/CalculationEditForm';
import { Toast } from './components/Toast';
import { updateCalculation } from '@/api/calculations';
import { CalculationSummary } from './components/CalculationSummary';

interface CalculationMaterial {
  id: number | null;
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
  type: 'switch' | 'rza' | 'counter' | 'sr' | 'tsn' | 'tn' | 'tt';
}

interface CellConfiguration {
  type: '0.4kv' | '10kv' | '20kv' | 'rza';
  materials: {
    switch?: CellMaterial[];
    rza?: CellMaterial[];
    counter?: CellMaterial[];
    sr?: CellMaterial[];
    tsn?: CellMaterial[];
    tn?: CellMaterial[];
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
      ] as const;
      const cellType = updatedCalculation.data.cellConfig?.type;

      console.log('🔍 DEBUG: Original cell type from calculation:', cellType);
      console.log('🔍 DEBUG: Valid cell types:', validCellTypes);

      const validCellType = validCellTypes.includes(cellType as any) ? cellType : '10kv';

      console.log('🔍 DEBUG: Validated cell type:', validCellType);

      const payload = {
        name: updatedCalculation.name,
        data: {
          categories: updatedCalculation.data.categories.map((cat: CalculationCategory) => ({
            name: cat.name,
            items: cat.items.map((item: CalculationMaterial) => ({
              id: item.id || null,
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
          },
        },
      };

      console.log('🔍 DEBUG: Final payload cellConfig:', payload.data.cellConfig);
      console.log('🔍 DEBUG: Full payload:', JSON.stringify(payload, null, 2));

      await updateCalculation(groupSlug, calcSlug, payload, token);
      await fetchCalculation(groupSlug, calcSlug);
      setIsEditing(false);
      setToast({ message: 'Калькуляция успешно обновлена', type: 'success' });
    } catch (error) {
      console.error('❌ Error updating calculation:', error);
      setToast({ message: 'Ошибка при обновлении калькуляции', type: 'error' });
    }
  };

  const handleCancel = () => {
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <CalculationHeader name={selectedCalculation.name} onEdit={handleEdit} />

          {isEditing ? (
            <CalculationEditForm
              calculation={selectedCalculation}
              onSave={handleSave}
              onCancel={handleCancel}
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
                          {selectedCalculation.data.cellConfig.materials.switch &&
                            selectedCalculation.data.cellConfig.materials.switch.length > 0 && (
                              <tr>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  Выключатель
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-900">
                                  {Array.isArray(
                                    selectedCalculation.data.cellConfig.materials.switch
                                  )
                                    ? selectedCalculation.data.cellConfig.materials.switch
                                        .map((item: CellMaterial) => item.name)
                                        .join(', ')
                                    : selectedCalculation.data.cellConfig.materials.switch?.name ||
                                      ''}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                                  {Array.isArray(
                                    selectedCalculation.data.cellConfig.materials.switch
                                  )
                                    ? selectedCalculation.data.cellConfig.materials.switch
                                        .reduce((sum, item) => sum + item.price, 0)
                                        .toLocaleString()
                                    : selectedCalculation.data.cellConfig.materials.switch?.price?.toLocaleString() ||
                                      '0'}{' '}
                                  ₸
                                </td>
                              </tr>
                            )}
                          {selectedCalculation.data.cellConfig.materials.rza &&
                            selectedCalculation.data.cellConfig.materials.rza.length > 0 && (
                              <tr>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  РЗА
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-900">
                                  {Array.isArray(selectedCalculation.data.cellConfig.materials.rza)
                                    ? selectedCalculation.data.cellConfig.materials.rza
                                        .map((item: CellMaterial) => item.name)
                                        .join(', ')
                                    : selectedCalculation.data.cellConfig.materials.rza?.name || ''}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                                  {Array.isArray(selectedCalculation.data.cellConfig.materials.rza)
                                    ? selectedCalculation.data.cellConfig.materials.rza
                                        .reduce((sum, item) => sum + item.price, 0)
                                        .toLocaleString()
                                    : selectedCalculation.data.cellConfig.materials.rza?.price?.toLocaleString() ||
                                      '0'}{' '}
                                  ₸
                                </td>
                              </tr>
                            )}
                          {selectedCalculation.data.cellConfig.materials.counter &&
                            selectedCalculation.data.cellConfig.materials.counter.length > 0 && (
                              <tr>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  Счетчик
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-900">
                                  {Array.isArray(
                                    selectedCalculation.data.cellConfig.materials.counter
                                  )
                                    ? selectedCalculation.data.cellConfig.materials.counter
                                        .map((item: CellMaterial) => item.name)
                                        .join(', ')
                                    : selectedCalculation.data.cellConfig.materials.counter?.name ||
                                      ''}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                                  {Array.isArray(
                                    selectedCalculation.data.cellConfig.materials.counter
                                  )
                                    ? selectedCalculation.data.cellConfig.materials.counter
                                        .reduce((sum, item) => sum + item.price, 0)
                                        .toLocaleString()
                                    : selectedCalculation.data.cellConfig.materials.counter?.price?.toLocaleString() ||
                                      '0'}{' '}
                                  ₸
                                </td>
                              </tr>
                            )}
                          {selectedCalculation.data.cellConfig.materials.sr &&
                            selectedCalculation.data.cellConfig.materials.sr.length > 0 && (
                              <tr>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  СР
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-900">
                                  {Array.isArray(selectedCalculation.data.cellConfig.materials.sr)
                                    ? selectedCalculation.data.cellConfig.materials.sr
                                        .map((item: CellMaterial) => item.name)
                                        .join(', ')
                                    : selectedCalculation.data.cellConfig.materials.sr?.name || ''}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                                  {Array.isArray(selectedCalculation.data.cellConfig.materials.sr)
                                    ? selectedCalculation.data.cellConfig.materials.sr
                                        .reduce((sum, item) => sum + item.price, 0)
                                        .toLocaleString()
                                    : selectedCalculation.data.cellConfig.materials.sr?.price?.toLocaleString() ||
                                      '0'}{' '}
                                  ₸
                                </td>
                              </tr>
                            )}
                          {selectedCalculation.data.cellConfig.materials.tsn &&
                            selectedCalculation.data.cellConfig.materials.tsn.length > 0 && (
                              <tr>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  ТСН
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-900">
                                  {Array.isArray(selectedCalculation.data.cellConfig.materials.tsn)
                                    ? selectedCalculation.data.cellConfig.materials.tsn
                                        .map((item: CellMaterial) => item.name)
                                        .join(', ')
                                    : selectedCalculation.data.cellConfig.materials.tsn?.name || ''}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                                  {Array.isArray(selectedCalculation.data.cellConfig.materials.tsn)
                                    ? selectedCalculation.data.cellConfig.materials.tsn
                                        .reduce((sum, item) => sum + item.price, 0)
                                        .toLocaleString()
                                    : selectedCalculation.data.cellConfig.materials.tsn?.price?.toLocaleString() ||
                                      '0'}{' '}
                                  ₸
                                </td>
                              </tr>
                            )}
                          {selectedCalculation.data.cellConfig.materials.tn &&
                            selectedCalculation.data.cellConfig.materials.tn.length > 0 && (
                              <tr>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  ТН
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-900">
                                  {Array.isArray(selectedCalculation.data.cellConfig.materials.tn)
                                    ? selectedCalculation.data.cellConfig.materials.tn
                                        .map((item: CellMaterial) => item.name)
                                        .join(', ')
                                    : selectedCalculation.data.cellConfig.materials.tn?.name || ''}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                                  {Array.isArray(selectedCalculation.data.cellConfig.materials.tn)
                                    ? selectedCalculation.data.cellConfig.materials.tn
                                        .reduce((sum, item) => sum + item.price, 0)
                                        .toLocaleString()
                                    : selectedCalculation.data.cellConfig.materials.tn?.price?.toLocaleString() ||
                                      '0'}{' '}
                                  ₸
                                </td>
                              </tr>
                            )}
                          {selectedCalculation.data.cellConfig.materials.tt &&
                            selectedCalculation.data.cellConfig.materials.tt.length > 0 && (
                              <tr>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  Трансформатор тока
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-900">
                                  {Array.isArray(selectedCalculation.data.cellConfig.materials.tt)
                                    ? selectedCalculation.data.cellConfig.materials.tt
                                        .map((item: CellMaterial) => item.name)
                                        .join(', ')
                                    : selectedCalculation.data.cellConfig.materials.tt?.name || ''}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                                  {Array.isArray(selectedCalculation.data.cellConfig.materials.tt)
                                    ? selectedCalculation.data.cellConfig.materials.tt
                                        .reduce((sum, item) => sum + item.price, 0)
                                        .toLocaleString()
                                    : selectedCalculation.data.cellConfig.materials.tt?.price?.toLocaleString() ||
                                      '0'}{' '}
                                  ₸
                                </td>
                              </tr>
                            )}
                          {selectedCalculation.data.cellConfig.materials.pu &&
                            selectedCalculation.data.cellConfig.materials.pu.length > 0 && (
                              <tr>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  ПУ
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-900">
                                  {Array.isArray(selectedCalculation.data.cellConfig.materials.pu)
                                    ? selectedCalculation.data.cellConfig.materials.pu
                                        .map((item: CellMaterial) => item.name)
                                        .join(', ')
                                    : selectedCalculation.data.cellConfig.materials.pu?.name || ''}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                                  {Array.isArray(selectedCalculation.data.cellConfig.materials.pu)
                                    ? selectedCalculation.data.cellConfig.materials.pu
                                        .reduce((sum, item) => sum + item.price, 0)
                                        .toLocaleString()
                                    : selectedCalculation.data.cellConfig.materials.pu?.price?.toLocaleString() ||
                                      '0'}{' '}
                                  ₸
                                </td>
                              </tr>
                            )}
                          {selectedCalculation.data.cellConfig.materials.disconnector &&
                            selectedCalculation.data.cellConfig.materials.disconnector.length >
                              0 && (
                              <tr>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  Разъединитель
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-900">
                                  {Array.isArray(
                                    selectedCalculation.data.cellConfig.materials.disconnector
                                  )
                                    ? selectedCalculation.data.cellConfig.materials.disconnector
                                        .map((item: CellMaterial) => item.name)
                                        .join(', ')
                                    : selectedCalculation.data.cellConfig.materials.disconnector
                                        ?.name || ''}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                                  {Array.isArray(
                                    selectedCalculation.data.cellConfig.materials.disconnector
                                  )
                                    ? selectedCalculation.data.cellConfig.materials.disconnector
                                        .reduce((sum, item) => sum + item.price, 0)
                                        .toLocaleString()
                                    : selectedCalculation.data.cellConfig.materials.disconnector?.price?.toLocaleString() ||
                                      '0'}{' '}
                                  ₸
                                </td>
                              </tr>
                            )}
                          {selectedCalculation.data.cellConfig.materials.busbar &&
                            selectedCalculation.data.cellConfig.materials.busbar.length > 0 && (
                              <tr>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  Сборные шины
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-900">
                                  {Array.isArray(
                                    selectedCalculation.data.cellConfig.materials.busbar
                                  )
                                    ? selectedCalculation.data.cellConfig.materials.busbar
                                        .map((item: CellMaterial) => item.name)
                                        .join(', ')
                                    : selectedCalculation.data.cellConfig.materials.busbar?.name ||
                                      ''}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                                  {Array.isArray(
                                    selectedCalculation.data.cellConfig.materials.busbar
                                  )
                                    ? selectedCalculation.data.cellConfig.materials.busbar
                                        .reduce((sum, item) => sum + item.price, 0)
                                        .toLocaleString()
                                    : selectedCalculation.data.cellConfig.materials.busbar?.price?.toLocaleString() ||
                                      '0'}{' '}
                                  ₸
                                </td>
                              </tr>
                            )}
                          {selectedCalculation.data.cellConfig.materials.busbridge &&
                            selectedCalculation.data.cellConfig.materials.busbridge.length > 0 && (
                              <tr>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  Шинный мост
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-900">
                                  {Array.isArray(
                                    selectedCalculation.data.cellConfig.materials.busbridge
                                  )
                                    ? selectedCalculation.data.cellConfig.materials.busbridge
                                        .map((item: CellMaterial) => item.name)
                                        .join(', ')
                                    : selectedCalculation.data.cellConfig.materials.busbridge
                                        ?.name || ''}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                                  {Array.isArray(
                                    selectedCalculation.data.cellConfig.materials.busbridge
                                  )
                                    ? selectedCalculation.data.cellConfig.materials.busbridge
                                        .reduce((sum, item) => sum + item.price, 0)
                                        .toLocaleString()
                                    : selectedCalculation.data.cellConfig.materials.busbridge?.price?.toLocaleString() ||
                                      '0'}{' '}
                                  ₸
                                </td>
                              </tr>
                            )}
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
                initialValues={selectedCalculation.data?.calculation}
              />
            </div>
          )}
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
