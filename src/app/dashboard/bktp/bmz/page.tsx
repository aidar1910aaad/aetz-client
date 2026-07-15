'use client';

import { useRouter } from 'next/navigation';
import { Building2, Calculator, ArrowRight } from 'lucide-react';
import { useBmzStore } from '@/store/useBmzStore';
import { useBktpStore } from '@/store/useBktpStore';
import Breadcrumbs from '@/components/Breadcrumbs/Breadcrumbs';
import BmzBuildingType from '@/components/BmzConfig/BmzBuildingType';
import BmzDimensions from '@/components/BmzConfig/BmzDimensions';
import BmzOptions from '@/components/BmzConfig/BmzOptions';
import { useEffect } from 'react';
import { bmzApi } from '@/api/bmz';
import { useRealtimeCalculationStore } from '@/store/useRealtimeCalculationStore';
import { findMatchingAreaPriceRange } from '@/utils/bmzAreaPriceRange';
import {
  calculateArea,
  formatAreaQuantity,
  formatPrice,
  roundArea,
} from '@/utils/bmzCalculations';

export default function BmzConfigPage() {
  const router = useRouter();
  const bmz = useBmzStore();
  const { taskNumber, client, date } = useBktpStore();
  const { data: realtimeData, isCalculating } = useRealtimeCalculationStore();
  const filename = `${taskNumber}-БКТП-${client}-${date}`;

  useEffect(() => {
    const loadSettings = async () => {
      try {
        console.log('Starting to load BMZ settings...');
        const settings = await bmzApi.getSettings();
        console.log('API Response:', settings);

        if (!settings) {
          console.error('No settings received from API');
          return;
        }

        console.log('Setting BMZ settings in store...');
        bmz.setSettings(settings);
        console.log('Settings set in store:', bmz.settings);
        
        // Инициализируем дефолтные значения оборудования
        bmz.initializeDefaultEquipment();
      } catch (error) {
        console.error('Error loading BMZ settings:', error);
      }
    };

    loadSettings();
  }, []);

  useEffect(() => {
    console.log('BMZ Store State:', {
      settings: bmz.settings,
      buildingType: bmz.buildingType,
      length: bmz.length,
      width: bmz.width,
      height: bmz.height,
      thickness: bmz.thickness,
      blockCount: bmz.blockCount,
      equipmentState: bmz.equipmentState,
    });
  }, [
    bmz.settings,
    bmz.buildingType,
    bmz.length,
    bmz.width,
    bmz.height,
    bmz.thickness,
    bmz.blockCount,
    bmz.equipmentState,
  ]);

  useEffect(() => {
    if (bmz.settings && bmz.buildingType && bmz.buildingType !== 'none') {
      bmz.initializeDefaultEquipment();
    }
  }, [bmz.settings, bmz.buildingType]);

  const handleBuildingTypeChange = (type: 'bmz' | 'tp' | 'none') => {
    bmz.setBuildingType(type);
    if (type === 'bmz') {
      bmz.setThickness(50);
      bmz.setBlockCount(4);
      // Инициализируем дефолтные значения оборудования для БМЗ
      if (bmz.settings) {
        bmz.initializeDefaultEquipment();
      }
    } else if (type === 'tp') {
      bmz.setThickness(50);
      bmz.setBlockCount(4);
      // Сбрасываем состояние утепленного пола для ТП
      if (bmz.settings) {
        const insulatedFloor = bmz.settings.equipment.find((e) => e.name === 'Утепленный пол');
        if (insulatedFloor) {
          bmz.setEquipmentState(insulatedFloor.name, false);
        }
        // Инициализируем дефолтные значения оборудования для ТП
        bmz.initializeDefaultEquipment();
      }
    } else {
      bmz.setBuildingType('none');
    }
  };

  const handleAddToSpec = () => {
    router.push('/dashboard/bktp/transformers');
  };

  const isFormValid = () => {
    if (!bmz.buildingType) return false;
    if (bmz.buildingType === 'none') return true;
    return (
      bmz.length > 0 &&
      bmz.width > 0 &&
      bmz.height > 0 &&
      (bmz.buildingType === 'bmz' ? bmz.thickness > 0 && bmz.blockCount > 0 : true)
    );
  };

  const calculateBasePrice = (
    width: number,
    length: number,
    thickness: number,
    height: number,
  ): number => {
    if (!bmz.settings) return 0;
    const area = calculateArea(width, length);
    const priceRange = findMatchingAreaPriceRange(bmz.settings.areaPriceRanges, {
      area,
      thickness,
      height,
    });
    return priceRange?.pricePerSquareMeter || 0;
  };

  const calculateTotalPrice = () => {
    if (!isFormValid() || bmz.buildingType === 'none' || !bmz.settings) return 0;

    const area = roundArea(calculateArea(bmz.width, bmz.length));
    let total = 0;

    // Считаем стоимость здания только для БМЗ
    if (bmz.buildingType === 'bmz') {
      const basePrice = calculateBasePrice(bmz.width, bmz.length, bmz.thickness, bmz.height);
      total += Math.round(basePrice * area);
    }

    // Считаем дополнительное оборудование
    bmz.settings.equipment.forEach((equipment) => {
      const stateKey = equipment.name.toLowerCase().replace(/\s+/g, '');
      if (bmz.equipmentState[stateKey]) {
        if (equipment.priceType === 'perSquareMeter') {
          total += Math.round(area * (equipment.pricePerSquareMeter || 0));
        } else if (equipment.priceType === 'perHalfSquareMeter') {
          total += Math.round(roundArea(area / 2) * (equipment.pricePerSquareMeter || 0));
        } else if (equipment.priceType === 'fixed') {
          total += equipment.fixedPrice || 0;
        }
      }
    });

    return Math.round(total);
  };

  const roundedArea = roundArea(calculateArea(bmz.width, bmz.length));
  const unitPrice =
    bmz.buildingType === 'bmz'
      ? calculateBasePrice(bmz.width, bmz.length, bmz.thickness, bmz.height)
      : 0;
  const totalPrice = calculateTotalPrice();
  const onlineBmzTotal = Number(realtimeData?.snapshot?.totals?.bmzTotal || 0);
  const displayedBmzTotal = onlineBmzTotal > 0 ? onlineBmzTotal : totalPrice;
  const hasSelectedBuildingType = Boolean(bmz.buildingType);

  return (
    <div className="h-[calc(100vh-64px)] bg-white overflow-y-auto relative z-0">
      <div className="p-6 pb-20 relative z-10">
        <Breadcrumbs />

        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-gray-100 rounded-xl">
              <Building2 className="w-6 h-6 text-[#8eba1e]" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Параметры здания</h1>
              <p className="text-gray-600">Настройте параметры здания подстанции</p>
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#8eba1e] rounded-lg">
                <Calculator className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Заявка</p>
                <p className="text-sm text-[#8eba1e] font-semibold">{filename}</p>
              </div>
            </div>
          </div>
        </div>

        <div className=" mx-auto space-y-6">
          <BmzBuildingType onChange={handleBuildingTypeChange} selectedType={bmz.buildingType} />

          {!hasSelectedBuildingType ? (
            <div className="text-center py-12 bg-white border border-dashed border-gray-300 rounded-2xl shadow-sm">
              <div className="w-16 h-16 bg-[#8eba1e]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-8 h-8 text-[#8eba1e]" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Выберите тип здания</h3>
              <p className="text-gray-600">
                Параметры, оборудование и расчёт появятся после выбора БМЗ, ТП или «Нет».
              </p>
            </div>
          ) : bmz.buildingType !== 'none' ? (
            <>
              <BmzDimensions
                width={bmz.width}
                length={bmz.length}
                height={bmz.buildingType !== 'tp' ? bmz.height : undefined}
                thickness={bmz.thickness}
                blockCount={bmz.blockCount}
                onLengthChange={bmz.setLength}
                onWidthChange={bmz.setWidth}
                onHeightChange={bmz.setHeight}
                onThicknessChange={bmz.setThickness}
                onBlockCountChange={bmz.setBlockCount}
                buildingType={bmz.buildingType}
              />

              <BmzOptions
                state={bmz.equipmentState}
                setField={bmz.setEquipmentState}
                disabled={false}
                buildingType={bmz.buildingType}
                length={bmz.length}
                width={bmz.width}
              />

              {isFormValid() && (
                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-lg">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <Calculator className="w-5 h-5 text-[#8eba1e]" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Расчёт стоимости</h3>
                    <span className={`ml-auto text-xs font-semibold ${isCalculating ? 'text-amber-600' : 'text-green-600'}`}>
                      {isCalculating ? 'Онлайн пересчет...' : 'Онлайн расчет актуален'}
                    </span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full table-auto border border-gray-200 rounded-lg overflow-hidden">
                      <thead className="bg-[#8eba1e] text-white">
                        <tr>
                          <th className="p-4 text-left font-semibold">Наименование</th>
                          <th className="p-4 text-center font-semibold">Ед. изм.</th>
                          <th className="p-4 text-center font-semibold">Кол-во</th>
                          <th className="p-4 text-right font-semibold">Цена</th>
                          <th className="p-4 text-right font-semibold">Сумма</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white">
                        {bmz.buildingType === 'bmz' && (
                          <tr className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="p-4 text-left font-medium">
                              Здание БМЗ ({bmz.length}×{bmz.width}×{bmz.height} мм, толщина{' '}
                              {bmz.thickness} мм, {bmz.blockCount} блоков)
                            </td>
                            <td className="p-4 text-center text-gray-600">м²</td>
                            <td className="p-4 text-center font-semibold">{formatAreaQuantity(roundedArea)}</td>
                            <td className="p-4 text-right text-[#8eba1e] font-semibold">{formatPrice(unitPrice)}</td>
                            <td className="p-4 text-right text-[#8eba1e] font-bold">{formatPrice(Math.round(unitPrice * roundedArea))}</td>
                          </tr>
                        )}
                        {bmz.buildingType === 'tp' && (
                          <tr className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="p-4 text-left font-medium">
                              Здание ТП ({bmz.length}×{bmz.width}×{bmz.height} мм)
                            </td>
                            <td className="p-4 text-center text-gray-600">м²</td>
                            <td className="p-4 text-center font-semibold">{formatAreaQuantity(roundedArea)}</td>
                            <td className="p-4 text-right text-gray-400">—</td>
                            <td className="p-4 text-right text-gray-400">—</td>
                          </tr>
                        )}

                        {bmz.settings?.equipment.map((equipment) => {
                          const stateKey = equipment.name.toLowerCase().replace(/\s+/g, '');
                          if (!bmz.equipmentState[stateKey]) return null;

                          let price = 0;
                          let quantity = 0;
                          let unit = '';

                          if (equipment.priceType === 'perSquareMeter') {
                            price = equipment.pricePerSquareMeter || 0;
                            quantity = roundedArea;
                            unit = 'м²';
                          } else if (equipment.priceType === 'perHalfSquareMeter') {
                            price = equipment.pricePerSquareMeter || 0;
                            quantity = roundArea(roundedArea / 2);
                            unit = 'м²';
                          } else if (equipment.priceType === 'fixed') {
                            price = equipment.fixedPrice || 0;
                            quantity = 1;
                            unit = 'компл.';
                          }

                          const rowTotal = Math.round(price * quantity);
                          const quantityLabel =
                            unit === 'м²' ? formatAreaQuantity(quantity) : String(quantity);

                          return (
                            <tr key={equipment.name} className="border-b border-gray-100 hover:bg-gray-50">
                              <td className="p-4 text-left font-medium">{equipment.name}</td>
                              <td className="p-4 text-center text-gray-600">{unit}</td>
                              <td className="p-4 text-center font-semibold">{quantityLabel}</td>
                              <td className="p-4 text-right text-[#8eba1e] font-semibold">{formatPrice(price)}</td>
                              <td className="p-4 text-right text-[#8eba1e] font-bold">{formatPrice(rowTotal)}</td>
                            </tr>
                          );
                        })}

                        <tr className="bg-[#8eba1e]/10 font-bold border-t-2 border-[#8eba1e]">
                          <td colSpan={4} className="text-right pr-2 p-4 text-lg">
                            ВСЕГО:
                          </td>
                          <td className="text-right pl-2 p-4 text-lg text-[#8eba1e]">{formatPrice(displayedBmzTotal)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12 bg-white border border-gray-200 rounded-2xl shadow-lg">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Здание не предусмотрено</h3>
              <p className="text-gray-600">Для данной заявки здание не требуется</p>
            </div>
          )}

          <div className="pt-6 pb-8">
            <button
              onClick={handleAddToSpec}
              disabled={!isFormValid()}
              className={`flex items-center gap-2 px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-200 ${
                isFormValid()
                  ? 'bg-[#8eba1e] hover:bg-[#7aa31a] text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <ArrowRight className="w-5 h-5" />
              {bmz.buildingType === 'none' ? 'Далее' : 'Добавить в спецификацию'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}