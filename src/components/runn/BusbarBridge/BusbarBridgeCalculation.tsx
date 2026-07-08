import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Settings } from 'lucide-react';
import { BusAlert, BusAccentButton, BusEmptyState } from '@/components/shared/busUi';
import { useTransformerStore } from '@/store/useTransformerStore';
import { useRunnStore } from '@/store/useRunnStore';
import { useRunnBusbarCalculation } from '@/hooks/useRunnBusbarCalculation';
import { useZeroBusbarCalculation } from '@/hooks/useZeroBusbarCalculation';
import { switchgearApi, Switchgear } from '@/api/switchgear';
import { Material } from '@/api/material';
import { api } from '@/api/baseUrl';

interface BusbarBridge {
  id: string;
  name: string;
  length: number;
  quantity: number; // количество мостов
  width: number; // ширина
  pairedId?: string; // ID связанного моста (для связи 0.4 с N)
}

export const BusbarBridgeCalculation: React.FC = () => {
  const { selectedTransformer } = useTransformerStore();
  const runn = useRunnStore();
  const { matchingConfig } = useRunnBusbarCalculation();
  const { matchingConfig: zeroMatchingConfig } = useZeroBusbarCalculation();
  const [bridges, setBridges] = useState<BusbarBridge[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [switchgearConfigs, setSwitchgearConfigs] = useState<Switchgear[]>([]);
  const [materialPrices, setMaterialPrices] = useState<{
    aluminum: number;
    copper: number;
  }>({ aluminum: 2800, copper: 5600 }); // Значения по умолчанию
  const [busbarCalculationFromApi, setBusbarCalculationFromApi] = useState<any>(null);

  // Получаем расход в кг/шт из конфигурации для обычных мостов
  const bridgeCell = matchingConfig?.cells?.find(cell => cell.name === 'Шинный мост');
  const bridgeWeightPerPiece = bridgeCell?.quantity || 0;
  
  // Получаем расход в кг/шт для нулевых мостов
  const zeroBridgeCell = zeroMatchingConfig?.cells?.find(cell => cell.name === 'Шинный мост');
  const zeroBridgeWeightPerPiece = zeroBridgeCell?.quantity || 0;
  
  // Получаем цену за кг из API материалов
  // Определяем материал на основе конфигурации, а не трансформатора
  const getMaterialType = () => {
    if (matchingConfig?.group === 'МТ' || matchingConfig?.group === 'МТ2') {
      return 'Медь';
    }
    if (matchingConfig?.group === 'АД' || matchingConfig?.group === 'АД2') {
      return 'Алюминий';
    }
    // Fallback на трансформатор, если конфигурация не найдена
    return selectedTransformer?.busbars || 'Алюминий';
  };

  const materialType = getMaterialType();
  const pricePerKg = materialType === 'Медь' 
    ? materialPrices.copper 
    : materialPrices.aluminum;

  // Загружаем конфигурации коммутационных аппаратов
  useEffect(() => {
    const fetchSwitchgearConfigs = async () => {
      try {
        const configs = await switchgearApi.getAll();
        setSwitchgearConfigs(configs);
      } catch (error) {
        console.error('Error fetching switchgear configs:', error);
      }
    };

    fetchSwitchgearConfigs();
  }, []);

  // Функция для получения материала по ID
  const getMaterialById = async (id: number, token: string): Promise<Material> => {
    const response = await fetch(`${api}/materials/${id}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Ошибка при получении материала');
    }

    return await response.json();
  };

  // Функция для загрузки калькуляции шинного моста
  const fetchBusbarCalculation = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${api}/calculations/panel-sho-70/для-шинного-моста-рунн`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Ошибка при получении калькуляции');
      }

      const calculation = await response.json();
      setBusbarCalculationFromApi(calculation);
    } catch (error) {
      console.error('Error fetching busbar bridge calculation:', error);
    }
  };

  // Загружаем цены материалов из API
  useEffect(() => {
    const fetchMaterialPrices = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        // Загружаем алюминий (ID: 3489) и медь (ID: 3490)
        const [aluminumMaterial, copperMaterial] = await Promise.all([
          getMaterialById(3489, token),
          getMaterialById(3490, token)
        ]);

        setMaterialPrices({
          aluminum: typeof aluminumMaterial.price === 'string' 
            ? parseFloat(aluminumMaterial.price) 
            : aluminumMaterial.price,
          copper: typeof copperMaterial.price === 'string' 
            ? parseFloat(copperMaterial.price) 
            : copperMaterial.price
        });
      } catch (error) {
        console.error('Error fetching material prices:', error);
        // Оставляем значения по умолчанию при ошибке
      }
    };

    fetchMaterialPrices();
  }, []);

  // Загружаем калькуляцию шинного моста
  useEffect(() => {
    fetchBusbarCalculation();
  }, []);

  // Загружаем сохраненные шинные мосты при инициализации
  useEffect(() => {
    // Сначала проверяем store
    if (runn.busBridges && runn.busBridges.length > 0) {
      // Преобразуем данные из store в формат компонента, сохраняя все поля
      const storeBridges: BusbarBridge[] = runn.busBridges.map((bridge, index) => ({
        id: bridge.id || `bridge-${Date.now()}-${index}`,
        name: bridge.name || `Шинный мост 0.4 #${index + 1}`,
        length: bridge.length,
        quantity: bridge.quantity,
        width: bridge.width,
        pairedId: bridge.pairedId
      }));
      setBridges(storeBridges);
    } else {
      // Если в store нет данных, загружаем из localStorage
      const savedBridges = localStorage.getItem('busbar-bridges');
      if (savedBridges) {
        try {
          const parsedBridges = JSON.parse(savedBridges);
          setBridges(parsedBridges);
          runn.setBusBridges(parsedBridges);
        } catch (error) {
          console.error('Error loading saved bridges:', error);
        }
      }
    }
  }, []);

  // Сохраняем шинные мосты в localStorage при изменении
  useEffect(() => {
    if (bridges.length > 0) {
      localStorage.setItem('busbar-bridges', JSON.stringify(bridges));
    }
  }, [bridges]);

  // Убираем автоматическую синхронизацию - будем обновлять store только при изменении мостов

  const getWeightPerPiece = (bridge: BusbarBridge) =>
    bridge.name.includes('Шинный мост N') ? zeroBridgeWeightPerPiece : bridgeWeightPerPiece;

  // Добавить новый шинный мост
  const addBridge = () => {
    const timestamp = Date.now();
    const bridgePairNumber = Math.floor(bridges.filter(b => b.name.includes('Шинный мост 0.4')).length / 2) + 1;
    
    // Создаем пару: обычный мост и мост N
    const newBridge04: BusbarBridge = {
      id: `bridge-${timestamp}`,
      name: `Шинный мост 0.4 #${bridgePairNumber}`,
      length: 0,
      quantity: 1,
      width: 0,
      pairedId: `bridge-n-${timestamp}` // Связываем с мостом N
    };
    
    const newBridgeN: BusbarBridge = {
      id: `bridge-n-${timestamp}`,
      name: `Шинный мост N #${bridgePairNumber}`,
      length: 0,
      quantity: 1,
      width: 0,
      pairedId: `bridge-${timestamp}` // Связываем с мостом 0.4
    };
    
    const updatedBridges = [...bridges, newBridge04, newBridgeN];
    setBridges(updatedBridges);
    runn.setBusBridges(updatedBridges);
  };

  // Добавить новый шинный мост N (отдельно, если нужно)
  const addBridgeN = () => {
    const bridgePairNumber = Math.floor(bridges.filter(b => b.name.includes('Шинный мост N')).length / 2) + 1;
    const newBridge: BusbarBridge = {
      id: `bridge-n-${Date.now()}`,
      name: `Шинный мост N #${bridgePairNumber}`,
      length: 0,
      quantity: 1,
      width: 0
    };
    const updatedBridges = [...bridges, newBridge];
    setBridges(updatedBridges);
    runn.setBusBridges(updatedBridges);
  };

  // Удалить шинный мост
  const removeBridge = (id: string) => {
    // Находим мост, который нужно удалить
    const bridgeToRemove = bridges.find(b => b.id === id);
    
    // Если у моста есть связанный мост (pairedId), удаляем оба
    let bridgeIdsToRemove = [id];
    if (bridgeToRemove?.pairedId) {
      bridgeIdsToRemove.push(bridgeToRemove.pairedId);
    }
    
    // Удаляем мосты
    const updatedBridges = bridges.filter(bridge => !bridgeIdsToRemove.includes(bridge.id));
    
    // Обновляем нумерацию после удаления
    const bridge04Count = updatedBridges.filter(b => b.name.includes('Шинный мост 0.4')).length;
    const bridgeNCount = updatedBridges.filter(b => b.name.includes('Шинный мост N')).length;
    
    let bridge04Counter = 1;
    let bridgeNCounter = 1;
    
    const renumberedBridges = updatedBridges.map((bridge) => {
      if (bridge.name.includes('Шинный мост 0.4')) {
        return {
          ...bridge,
          name: `Шинный мост 0.4 #${bridge04Counter++}`
        };
      } else if (bridge.name.includes('Шинный мост N')) {
        return {
          ...bridge,
          name: `Шинный мост N #${bridgeNCounter++}`
        };
      }
      return bridge;
    });
    
    setBridges(renumberedBridges);
    runn.setBusBridges(renumberedBridges);
  };

  // Обновить количество мостов
  const updateBridgeQuantity = (id: string, quantity: number) => {
    const bridge = bridges.find(b => b.id === id);
    
    const updatedBridges = bridges.map(b => {
      // Обновляем текущий мост
      if (b.id === id) {
        return { ...b, quantity };
      }
      // Если у моста есть связанный мост, синхронизируем количество
      if (bridge?.pairedId && b.id === bridge.pairedId) {
        return { ...b, quantity };
      }
      return b;
    });
    
    setBridges(updatedBridges);
    runn.setBusBridges(updatedBridges);
  };

  // Очистить все шинные мосты
  const clearAllBridges = () => {
    setBridges([]);
    runn.setBusBridges([]);
    localStorage.removeItem('busbar-bridges');
  };

  // Рассчитать общий вес и стоимость
  const calculateTotalWeight = () => {
    return bridges.reduce((total, bridge) => {
      return total + getWeightPerPiece(bridge) * bridge.quantity;
    }, 0);
  };

  const calculateMaterialCost = () => {
    return calculateTotalWeight() * pricePerKg;
  };

  // Рассчитываем данные для каждого типа моста отдельно
  const calculateBridgePrice = (bridge) => {
    if (!busbarCalculationFromApi) return { totalWithNds: calculateMaterialCost() };

    const calculationData = busbarCalculationFromApi.data.calculation;
    if (!calculationData) return { totalWithNds: calculateMaterialCost() };

    // Рассчитываем стоимость дополнительных материалов из калькуляции
    const additionalMaterialsCost = busbarCalculationFromApi.data.categories.reduce(
      (total, category) => {
        return total + category.items.reduce(
          (itemSum, item) => itemSum + (parseFloat(item.price) * item.quantity),
          0
        );
      },
      0
    );

    // Рассчитываем стоимость конкретного моста
    const calculatedWeight = getWeightPerPiece(bridge);
    const bridgeMaterialCost = calculatedWeight * bridge.quantity * pricePerKg;

    // Общая стоимость материалов = стоимость моста + дополнительные материалы
    const totalMaterialsCost = bridgeMaterialCost + (additionalMaterialsCost * bridge.quantity);

    // Используем ту же логику, что и в useRusnCalculation
    const totalSalary = calculationData.manufacturingHours * calculationData.hourlyRate * bridge.quantity;
    const overheadCost = (totalMaterialsCost * calculationData.overheadPercentage) / 100;
    const productionCost = totalMaterialsCost + totalSalary + overheadCost;
    const adminCost = (totalMaterialsCost * calculationData.adminPercentage) / 100;
    const fullCost = productionCost + adminCost;
    const plannedProfit = (fullCost * calculationData.plannedProfitPercentage) / 100;
    const wholesalePrice = fullCost + plannedProfit;
    const ndsAmount = (wholesalePrice * calculationData.ndsPercentage) / 100;
    const finalPrice = wholesalePrice + ndsAmount;

    return {
      materialsTotal: bridgeMaterialCost,
      additionalMaterialsCost,
      totalMaterialsCost,
      salary: totalSalary,
      overheadCost,
      productionCost,
      adminCost,
      fullCost,
      plannedProfit,
      wholesalePrice,
      ndsAmount,
      totalWithNds: finalPrice
    };
  };

  // Рассчитываем данные для пары мостов как одной калькуляции
  const calculateBridgePairPrice = (primaryBridge, pairedBridge) => {
    if (!busbarCalculationFromApi) {
      const primaryWeight = getWeightPerPiece(primaryBridge);
      const pairedWeight = getWeightPerPiece(pairedBridge);
      const totalCost = (primaryWeight + pairedWeight) * pricePerKg;
      return { totalWithNds: totalCost };
    }

    const calculationData = busbarCalculationFromApi.data.calculation;
    if (!calculationData) {
      const primaryWeight = getWeightPerPiece(primaryBridge);
      const pairedWeight = getWeightPerPiece(pairedBridge);
      const totalCost = (primaryWeight + pairedWeight) * pricePerKg;
      return { totalWithNds: totalCost };
    }

    // Рассчитываем стоимость дополнительных материалов из калькуляции
    const additionalMaterialsCost = busbarCalculationFromApi.data.categories.reduce(
      (total, category) => {
        return total + category.items.reduce(
          (itemSum, item) => itemSum + (parseFloat(item.price) * item.quantity),
          0
        );
      },
      0
    );

    // Материалы для обоих мостов
    const primaryWeight = getWeightPerPiece(primaryBridge);
    const pairedWeight = getWeightPerPiece(pairedBridge);
    const primaryMaterialCost = primaryWeight * primaryBridge.quantity * pricePerKg;
    const pairedMaterialCost = pairedWeight * pairedBridge.quantity * pricePerKg;
    const totalBridgeMaterialCost = primaryMaterialCost + pairedMaterialCost;

    // Общая стоимость материалов (мосты + дополнительные материалы только один раз)
    const totalMaterialsCost = totalBridgeMaterialCost + (additionalMaterialsCost * primaryBridge.quantity);

    // Используем ту же логику, что и в useRusnCalculation
    const totalSalary = calculationData.manufacturingHours * calculationData.hourlyRate * primaryBridge.quantity;
    const overheadCost = (totalMaterialsCost * calculationData.overheadPercentage) / 100;
    const productionCost = totalMaterialsCost + totalSalary + overheadCost;
    const adminCost = (totalMaterialsCost * calculationData.adminPercentage) / 100;
    const fullCost = productionCost + adminCost;
    const plannedProfit = (fullCost * calculationData.plannedProfitPercentage) / 100;
    const wholesalePrice = fullCost + plannedProfit;
    const ndsAmount = (wholesalePrice * calculationData.ndsPercentage) / 100;
    const finalPrice = wholesalePrice + ndsAmount;

    return {
      primaryMaterialsTotal: primaryMaterialCost,
      pairedMaterialsTotal: pairedMaterialCost,
      primaryWeight,
      pairedWeight,
      additionalMaterialsCost,
      totalMaterialsCost,
      salary: totalSalary,
      overheadCost,
      productionCost,
      adminCost,
      fullCost,
      plannedProfit,
      wholesalePrice,
      ndsAmount,
      totalWithNds: finalPrice
    };
  };

  const calculateTotalPrice = () => {
    if (!busbarCalculationFromApi) return calculateMaterialCost();
    
    // Суммируем стоимость всех мостов с их индивидуальными расчетами
    return bridges.reduce((total, bridge) => {
      const bridgeCalculation = calculateBridgePrice(bridge);
      return total + (bridgeCalculation.totalWithNds || 0);
    }, 0);
  };

  const totalWeight = calculateTotalWeight();
  const totalPrice = calculateTotalPrice();

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 px-5 py-4">
        <div className="flex min-w-0 items-center gap-3">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white"
            style={{ backgroundColor: '#8eba1e' }}
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-900">Шинные мосты</h3>
            <p className="text-sm text-gray-500">Пары 0,4 кВ + N, расчёт по количеству и кг/шт</p>
          </div>
          {matchingConfig && (
            <span className="hidden rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600 sm:inline">
              Группа {matchingConfig.group}
            </span>
          )}
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-[#8eba1e]/40 hover:bg-[#8eba1e]/5"
          >
            <Settings className="h-4 w-4" />
            {isEditing ? 'Готово' : 'Редактировать'}
          </button>
          {bridges.length > 0 && (
            <button
              type="button"
              onClick={clearAllBridges}
              className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
              Очистить
            </button>
          )}
        </div>
      </div>

      <div className="space-y-5 p-5">
        <div className="rounded-xl border border-[#8eba1e]/20 bg-[#8eba1e]/5 px-4 py-3 text-sm text-gray-700">
          <span className="font-medium text-gray-900">Материал:</span> {materialType}
          {matchingConfig ? (
            <span className="text-gray-500">
              {' '}
              · из «{matchingConfig.type}» (группа {matchingConfig.group})
            </span>
          ) : (
            <span className="text-gray-500"> · по настройкам трансформатора</span>
          )}
        </div>

        <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4">
          <h4 className="mb-3 text-sm font-semibold text-gray-800">Параметры расчёта</h4>

          {!matchingConfig ? (
            <BusAlert variant="warning" title="Конфигурация не найдена">
              Не найдена подходящая конфигурация для выбранного выключателя и материала. Сначала
              настройте сборные шины и ячейки РУНН.
            </BusAlert>
          ) : (
            <div className="space-y-3">
              <div className="rounded-xl border border-gray-200 bg-white p-3">
                <h5 className="mb-2 text-sm font-medium text-gray-800">Расход из таблицы</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-600">Группа:</span>
                    <div className="font-semibold text-gray-900">{matchingConfig?.group || 'Не указана'}</div>
                    <div className="text-xs text-gray-500">Из конфигурации {matchingConfig?.type}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Шинный мост 0,4 кВ:</span>
                    <div className="font-semibold text-gray-900">{bridgeWeightPerPiece} кг/шт</div>
                    <div className="text-xs text-gray-500">Берётся напрямую из таблицы конфигурации</div>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-3">
                <h5 className="mb-2 text-sm font-medium text-gray-800">Шинные мосты 0,4 кВ</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-600">Расход:</span>
                    <div className="font-semibold text-gray-900">{bridgeWeightPerPiece} кг/шт</div>
                    <div className="text-xs text-gray-500">Из конфигурации API</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Цена за кг:</span>
                    <div className="font-semibold text-gray-900">{pricePerKg.toLocaleString()} тг</div>
                    <div className="text-xs text-gray-500">
                      {materialType === 'Медь' ? 'Медь (ID: 3490)' : 'Алюминий (ID: 3489)'}
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-3">
                <h5 className="mb-2 text-sm font-medium text-gray-800">Шинные мосты N</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-600">Расход:</span>
                    <div className="font-semibold text-gray-900">{zeroBridgeWeightPerPiece} кг/шт</div>
                    <div className="text-xs text-gray-500">Из конфигурации API</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Цена за кг:</span>
                    <div className="font-semibold text-gray-900">{pricePerKg.toLocaleString()} тг</div>
                    <div className="text-xs text-gray-500">
                      {materialType === 'Медь' ? 'Медь (ID: 3490)' : 'Алюминий (ID: 3489)'}
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-sm">
                <span className="text-gray-600">Общее количество мостов:</span>
                <div className="font-semibold text-gray-900">{bridges.length}</div>
              </div>
            </div>
          )}
        </div>

        {/* Кнопки добавления */}
        {isEditing && matchingConfig && (
          <div className="flex justify-center">
            <BusAccentButton onClick={addBridge}>
              <Plus className="h-4 w-4" />
              Добавить мост (0,4 + N)
            </BusAccentButton>
          </div>
        )}

        {/* Список шинных мостов */}
        {bridges.length > 0 && matchingConfig && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-700">Настроенные шинные мосты</h4>
            {(() => {
              // Группируем мосты: обрабатываем пары только один раз
              const processedIds = new Set<string>();
              const displayBridges: Array<{ primary: any; paired?: any }> = [];
              
              for (const bridge of bridges) {
                if (processedIds.has(bridge.id)) continue;
                
                if (bridge.pairedId) {
                  // Это парный мост - находим пару
                  const pairedBridge = bridges.find(b => b.id === bridge.pairedId);
                  if (pairedBridge) {
                    displayBridges.push({ 
                      primary: bridge, 
                      paired: pairedBridge 
                    });
                    processedIds.add(bridge.id);
                    processedIds.add(pairedBridge.id);
                  }
                } else {
                  // Обычный мост без пары
                  displayBridges.push({ primary: bridge });
                  processedIds.add(bridge.id);
                }
              }
              
              return displayBridges.map(({ primary, paired }) => (
                <div
                  key={primary.id}
                  className="rounded-xl border border-gray-200 bg-gray-50/50 p-4"
                >
                  {/* Заголовок блока с парой */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <h5 className="font-medium text-gray-900">
                        Шинный мост #{primary.name.match(/#(\d+)/)?.[1] || '?'} (0.4 + N)
                      </h5>
                    </div>
                    {isEditing && (
                      <button
                        onClick={() => removeBridge(primary.id)}
                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-200"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  
                  {/* Параметры количества */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Расход из таблицы</label>
                      <div className="w-full rounded-lg border border-gray-200 bg-gray-100 px-3 py-2 text-gray-900">
                        0,4 кВ: {getWeightPerPiece(primary)} кг/шт{paired ? `, N: ${getWeightPerPiece(paired)} кг/шт` : ''}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Количество</label>
                      <input
                        type="number"
                        min="1"
                        value={primary.quantity}
                        onChange={(e) => updateBridgeQuantity(primary.id, parseInt(e.target.value) || 1)}
                        disabled={!isEditing}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-[#8eba1e] focus:ring-2 focus:ring-[#8eba1e]/20 disabled:bg-gray-100"
                      />
                    </div>
                  </div>
                  
                  {/* Два моста в ряд */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {/* Мост 0.4 */}
                    <div className="rounded-lg border border-gray-200 bg-white p-3">
                      <h6 className="mb-2 text-sm font-semibold text-gray-900">Мост 0,4 кВ</h6>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div className="flex justify-between">
                            <span>Расход:</span>
                            <span className="font-medium">{getWeightPerPiece(primary).toFixed(2)} кг/шт</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Количество:</span>
                            <span className="font-medium">{primary.quantity} шт</span>
                        </div>
                        <div className="flex justify-between border-t border-gray-100 pt-1">
                            <span>Итого (кг):</span>
                            <span className="font-bold text-[#8eba1e]">
                              {(getWeightPerPiece(primary) * primary.quantity).toFixed(2)} кг
                            </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Мост N */}
                    {paired && (
                      <div className="rounded-lg border border-gray-200 bg-white p-3">
                        <h6 className="mb-2 text-sm font-semibold text-gray-900">Мост N</h6>
                        <div className="text-sm text-gray-600 space-y-1">
                          <div className="flex justify-between">
                            <span>Расход:</span>
                            <span className="font-medium">{getWeightPerPiece(paired).toFixed(2)} кг/шт</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Количество:</span>
                            <span className="font-medium">{paired.quantity} шт</span>
                          </div>
                          <div className="flex justify-between border-t border-gray-100 pt-1">
                            <span>Итого (кг):</span>
                            <span className="font-bold text-[#8eba1e]">
                              {(getWeightPerPiece(paired) * paired.quantity).toFixed(2)} кг
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Итоговая стоимость с детализацией */}
                  {paired ? (
                    <div className="mt-3 rounded-xl border border-[#8eba1e]/25 bg-[#8eba1e]/5 p-3">
                      <details>
                        <summary className="cursor-pointer text-sm font-semibold text-gray-700 mb-2 flex justify-between items-center">
                          <span>Общая стоимость пары:</span>
                          <span className="text-lg font-bold text-[#8eba1e]">
                            {(() => {
                              const pairCalc = calculateBridgePairPrice(primary, paired);
                              return pairCalc.totalWithNds.toLocaleString();
                            })()} тг
                          </span>
                        </summary>
                        
                        {/* Детализация расчета */}
                        <div className="mt-3 pt-3 border-t border-green-200 space-y-2 text-xs">
                          {(() => {
                            const pairCalc = calculateBridgePairPrice(primary, paired);
                            
                            return (
                              <>
                                <div className="grid grid-cols-2 gap-2">
                                  <div className="text-gray-600">Материалы (0.4):</div>
                                  <div className="font-medium text-right">
                                    <div>{pairCalc.primaryMaterialsTotal.toLocaleString()} тг</div>
                                    <div className="text-xs text-gray-500 font-normal mt-0.5">
                                      {pairCalc.primaryWeight.toFixed(2)} кг × {pricePerKg.toLocaleString()} тг/кг × {primary.quantity} шт
                                    </div>
                                  </div>
                                  
                                  <div className="text-gray-600">Материалы (N):</div>
                                  <div className="font-medium text-right">
                                    <div>{pairCalc.pairedMaterialsTotal.toLocaleString()} тг</div>
                                    <div className="text-xs text-gray-500 font-normal mt-0.5">
                                      {pairCalc.pairedWeight.toFixed(2)} кг × {pricePerKg.toLocaleString()} тг/кг × {paired.quantity} шт
                                    </div>
                                  </div>
                                  
                                  <div className="text-gray-600">Доп. материалы:</div>
                                  <div className="font-medium text-right">{pairCalc.additionalMaterialsCost.toLocaleString()} тг</div>
                                  
                                  <div className="text-gray-600 font-semibold border-t border-green-200 pt-1">Всего материалов:</div>
                                  <div className="font-bold text-right border-t border-green-200 pt-1">
                                    {pairCalc.totalMaterialsCost.toLocaleString()} тг
                                  </div>
                                  
                                  <div className="text-gray-600">Зарплата:</div>
                                  <div className="font-medium text-right">{pairCalc.salary.toLocaleString()} тг</div>
                                  
                                  <div className="text-gray-600">Накладные:</div>
                                  <div className="font-medium text-right">{pairCalc.overheadCost.toLocaleString()} тг</div>
                                  
                                  <div className="text-gray-600">Админ. расходы:</div>
                                  <div className="font-medium text-right">{pairCalc.adminCost.toLocaleString()} тг</div>
                                  
                                  <div className="text-gray-600">Прибыль:</div>
                                  <div className="font-medium text-right">{pairCalc.plannedProfit.toLocaleString()} тг</div>
                                  
                                  <div className="text-gray-600">НДС:</div>
                                  <div className="font-medium text-right">{pairCalc.ndsAmount.toLocaleString()} тг</div>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-2 pt-2 border-t-2 border-green-300 mt-2">
                                  <div className="text-gray-900 font-bold text-sm">ИТОГО С НДС:</div>
                                  <div className="font-bold text-right text-green-700">
                                    {pairCalc.totalWithNds.toLocaleString()} тг
                                  </div>
                                </div>
                              </>
                            );
                          })()}
                        </div>
                      </details>
                    </div>
                  ) : (
                    <div className="mt-3 rounded-xl border border-[#8eba1e]/25 bg-[#8eba1e]/5 p-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-semibold text-gray-700">Стоимость:</span>
                        <span className="text-lg font-bold text-green-700">
                          {(() => {
                            const calc = calculateBridgePrice(primary);
                            return calc.totalWithNds.toLocaleString();
                          })()} тг
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ));
            })()}
          </div>
        )}

        {/* Результаты расчета */}
        {bridges.length > 0 && (
          <div className="rounded-xl border border-gray-200 bg-gray-50/80 p-4">
            <h4 className="mb-3 text-sm font-semibold text-gray-800">Итоги по всем мостам</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Общий вес:</span>
                <div className="font-semibold text-gray-900">{totalWeight.toFixed(2)} кг</div>
              </div>
              <div>
                <span className="text-gray-600">Цена за кг:</span>
                <div className="font-semibold text-gray-900">{pricePerKg.toLocaleString()} тг</div>
                <div className="text-xs text-gray-500">
                  {selectedTransformer?.busbars === 'Медь' ? 'Медь (ID: 3490)' : 'Алюминий (ID: 3489)'}
                </div>
              </div>
              <div>
                <span className="text-gray-600">Общая стоимость:</span>
                <div className="font-semibold text-gray-900">{totalPrice.toLocaleString()} тг</div>
              </div>
            </div>

          </div>
        )}

        {/* Сообщение, если нет мостов */}
        {bridges.length === 0 && matchingConfig && (
          <BusEmptyState
            title="Нет добавленных шинных мостов"
            description='Включите «Редактировать» и нажмите «Добавить мост»'
          />
        )}

        <details className="rounded-xl border border-gray-200 bg-white">
          <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-gray-700 hover:text-gray-900">
            Справочная таблица весов ошиновки
          </summary>
          <div className="overflow-x-auto border-t border-gray-100 p-4">
          <table className="w-full min-w-[900px] border-collapse text-sm">
            <thead>
              <tr className="bg-[#8eba1e] font-bold text-white">
                <th colSpan={4} className="px-3 py-2 border-r border-gray-400">ABC</th>
                <th className="px-3 py-2 border-r border-gray-400 bg-white text-gray-900">ошиновка</th>
                <th colSpan={4} className="px-3 py-2">N</th>
              </tr>
              <tr className="bg-white text-gray-900 font-semibold">
                <th className="px-2 py-1 border-r border-gray-300">ошин.1</th>
                <th className="px-2 py-1 border-r border-gray-300">ошин.2</th>
                <th className="px-2 py-1 border-r border-gray-300">ошин.3</th>
                <th className="px-2 py-1 border-r border-gray-400">ошин.4</th>
                <th className="px-3 py-1 border-r border-gray-400"></th>
                <th className="px-2 py-1 border-r border-gray-300">ошин.1</th>
                <th className="px-2 py-1 border-r border-gray-300">ошин.2</th>
                <th className="px-2 py-1 border-r border-gray-300">ошин.3</th>
                <th className="px-2 py-1">ошин.4</th>
              </tr>
            </thead>
            <tbody>
              {/* MT Series */}
              {['30x3', '40x4', '50x5', '60x6', '80x8', '100x10', '120x10', '160x10'].map((size, index) => {
                const mtData = {
                  '30x3': { abc: [12.48, 24.96, 37.44, 49.92], n: [6.2, 12.40, 18.60, 24.80] },
                  '40x4': { abc: [18.72, 37.44, 56.16, 74.88], n: [9.3, 18.60, 27.90, 37.20] },
                  '50x5': { abc: [27.46, 54.912, 82.368, 109.824], n: [13.64, 27.28, 40.92, 54.56] },
                  '60x6': { abc: [39.94, 79.872, 119.808, 159.744], n: [19.84, 39.68, 59.52, 79.36] },
                  '80x8': { abc: [71.14, 142.272, 213.408, 284.544], n: [35.34, 70.68, 106.02, 141.36] },
                  '100x10': { abc: [112.3, 224.64, 336.96, 449.28], n: [55.8, 111.60, 167.40, 223.20] },
                  '120x10': { abc: [133.5, 267.072, 400.608, 534.144], n: [66.34, 132.68, 199.02, 265.36] },
                  '160x10': { abc: [177.47, 354.93, 532.40, 709.86], n: [88.16, 176.33, 264.49, 352.66] }
                };
                const data = mtData[size as keyof typeof mtData];
                const bgColor = index % 2 === 0 ? 'bg-white' : 'bg-gray-50';
                
                return (
                  <tr key={`mt-${size}`} className={bgColor}>
                    <td className="px-2 py-1 border-r border-gray-300 text-right">{data.abc[0]}</td>
                    <td className="px-2 py-1 border-r border-gray-300 text-right">{data.abc[1]}</td>
                    <td className="px-2 py-1 border-r border-gray-300 text-right">{data.abc[2]}</td>
                    <td className="px-2 py-1 border-r border-gray-400 text-right">{data.abc[3]}</td>
                    <td className="px-3 py-1 border-r border-gray-400 font-semibold text-center">MT {size}</td>
                    <td className="px-2 py-1 border-r border-gray-300 text-right">{data.n[0]}</td>
                    <td className="px-2 py-1 border-r border-gray-300 text-right">{data.n[1]}</td>
                    <td className="px-2 py-1 border-r border-gray-300 text-right">{data.n[2]}</td>
                    <td className="px-2 py-1 text-right">{data.n[3]}</td>
                  </tr>
                );
              })}
              
              {/* АД Series */}
              {['30х3', '40х4', '50х5', '60х6', '80х8', '100х10', '120х10', '160х10'].map((size, index) => {
                const adData = {
                  '30х3': { abc: [3.74, 7.49, 11.23, 14.98], n: [1.86, 3.72, 5.58, 7.44] },
                  '40х4': { abc: [6.24, 12.48, 18.72, 24.96], n: [3.10, 6.20, 9.30, 12.40] },
                  '50х5': { abc: [8.74, 17.47, 26.21, 34.94], n: [4.34, 8.68, 13.02, 17.36] },
                  '60х6': { abc: [12.48, 24.96, 37.44, 49.92], n: [6.20, 12.40, 0.00, 24.80] },
                  '80х8': { abc: [22.46, 44.93, 67.39, 89.86], n: [11.16, 22.32, 33.48, 44.64] },
                  '100х10': { abc: [37.44, 74.88, 112.32, 149.76], n: [18.60, 37.20, 55.80, 74.40] },
                  '120х10': { abc: [42.43, 84.86, 127.30, 169.73], n: [21.08, 42.16, 63.24, 84.32] },
                  '160х10': { abc: [56.16, 112.32, 168.48, 224.64], n: [27.90, 55.80, 83.70, 111.60] }
                };
                const data = adData[size as keyof typeof adData];
                const bgColor = index % 2 === 0 ? 'bg-white' : 'bg-gray-50';
                
                return (
                  <tr key={`ad-${size}`} className={bgColor}>
                    <td className="px-2 py-1 border-r border-gray-300 text-right">{data.abc[0]}</td>
                    <td className="px-2 py-1 border-r border-gray-300 text-right">{data.abc[1]}</td>
                    <td className="px-2 py-1 border-r border-gray-300 text-right">{data.abc[2]}</td>
                    <td className="px-2 py-1 border-r border-gray-400 text-right">{data.abc[3]}</td>
                    <td className="px-3 py-1 border-r border-gray-400 font-semibold text-center">АД {size}</td>
                    <td className="px-2 py-1 border-r border-gray-300 text-right">{data.n[0]}</td>
                    <td className="px-2 py-1 border-r border-gray-300 text-right">{data.n[1]}</td>
                    <td className="px-2 py-1 border-r border-gray-300 text-right">{data.n[2]}</td>
                    <td className="px-2 py-1 text-right">{data.n[3]}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>
        </details>
      </div>
    </div>
  );
};