'use client';

import { useRouter } from 'next/navigation';
import { useBmzStore } from '@/store/useBmzStore';
import { useBktpStore } from '@/store/useBktpStore';
import Breadcrumbs from '@/components/Breadcrumbs/Breadcrumbs';
import BmzBuildingType from '@/components/BmzConfig/BmzBuildingType';
import BmzDimensions from '@/components/BmzConfig/BmzDimensions';
import BmzOptions from '@/components/BmzConfig/BmzOptions';
import { useEffect } from 'react';
import { bmzApi } from '@/api/bmz';

export default function BmzConfigPage() {
  const router = useRouter();
  const bmz = useBmzStore();
  const { taskNumber, client, date } = useBktpStore();
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

  const handleBuildingTypeChange = (type: 'bmz' | 'tp' | 'none') => {
    bmz.setBuildingType(type);
    if (type === 'bmz') {
      bmz.setThickness(50);
      bmz.setBlockCount(4);
    } else if (type === 'tp') {
      bmz.setThickness(50);
      bmz.setBlockCount(4);
      // Сбрасываем состояние утепленного пола для ТП
      if (bmz.settings) {
        const insulatedFloor = bmz.settings.equipment.find((e) => e.name === 'Утепленный пол');
        if (insulatedFloor) {
          bmz.setEquipmentState(insulatedFloor.name, false);
        }
      }
    } else {
      bmz.reset();
    }
  };

  const handleAddToSpec = () => {
    router.push('/dashboard/bktp/transformers');
  };

  const isFormValid = () => {
    if (bmz.buildingType === 'none') return true;
    return (
      bmz.length > 0 &&
      bmz.width > 0 &&
      bmz.height > 0 &&
      (bmz.buildingType === 'bmz' ? bmz.thickness > 0 && bmz.blockCount > 0 : true)
    );
  };

  const calculateBasePrice = (width: number, length: number, thickness: number): number => {
    if (!bmz.settings) return 0;
    const area = (width / 1000) * (length / 1000);

    // Находим все подходящие диапазоны для текущей толщины
    const matchingRanges = bmz.settings.areaPriceRanges.filter(
      (range) => thickness >= range.minWallThickness && thickness <= range.maxWallThickness
    );

    // Сортируем диапазоны по минимальной площади (от большей к меньшей)
    matchingRanges.sort((a, b) => b.minArea - a.minArea);

    // Находим первый диапазон, где площадь больше или равна минимальной
    const priceRange = matchingRanges.find((range) => area >= range.minArea);

    return priceRange?.pricePerSquareMeter || 0;
  };

  const calculateTotalPrice = () => {
    if (!isFormValid() || bmz.buildingType === 'none' || !bmz.settings) return 0;

    const area = (bmz.width / 1000) * (bmz.length / 1000);
    let total = 0;

    // Считаем стоимость здания только для БМЗ
    if (bmz.buildingType === 'bmz') {
      const basePrice = calculateBasePrice(bmz.width, bmz.length, bmz.thickness);
      total += basePrice * area;
    }

    // Считаем дополнительное оборудование
    bmz.settings.equipment.forEach((equipment) => {
      const stateKey = equipment.name.toLowerCase().replace(/\s+/g, '');
      if (bmz.equipmentState[stateKey]) {
        if (equipment.priceType === 'perSquareMeter') {
          total += area * (equipment.pricePerSquareMeter || 0);
        } else if (equipment.priceType === 'perHalfSquareMeter') {
          total += (area / 2) * (equipment.pricePerSquareMeter || 0);
        } else if (equipment.priceType === 'fixed') {
          total += equipment.fixedPrice || 0;
        }
      }
    });

    return Math.round(total);
  };

  const area = (bmz.width / 1000) * (bmz.length / 1000);
  const roundedArea = Math.round(area * 10) / 10;
  const unitPrice =
    bmz.buildingType === 'bmz' ? calculateBasePrice(bmz.width, bmz.length, bmz.thickness) : 0;
  const totalPrice = calculateTotalPrice();

  return (
    <div className="h-[calc(100vh-110px)] overflow-y-auto px-6 py-6 bg-gray-50">
      <Breadcrumbs />
      <h1 className="text-2xl font-bold mb-4">
        <span className="text-[#3A55DF]">{filename}</span> параметры здания
      </h1>

      <div className="max-w-[1200px] mx-auto space-y-6">
        <BmzBuildingType onChange={handleBuildingTypeChange} selectedType={bmz.buildingType} />

        {bmz.buildingType !== 'none' ? (
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

            {isFormValid() && (
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Расчёт стоимости</h3>
                <table className="w-full table-auto border text-sm">
                  <thead className="bg-[#3A55DF] text-white">
                    <tr>
                      <th className="p-2 text-left">Наименование</th>
                      <th className="p-2">Ед. изм.</th>
                      <th className="p-2">Кол-во</th>
                      <th className="p-2">Цена</th>
                      <th className="p-2">Сумма</th>
                    </tr>
                  </thead>
                  <tbody className="text-center">
                    {bmz.buildingType === 'bmz' && (
                      <tr>
                        <td className="p-2 text-left">
                          Здание БМЗ ({bmz.length}×{bmz.width}×{bmz.height} мм, толщина{' '}
                          {bmz.thickness} мм, {bmz.blockCount} блоков)
                        </td>
                        <td className="p-2">м²</td>
                        <td className="p-2">{roundedArea}</td>
                        <td className="p-2">{unitPrice.toLocaleString()} тг</td>
                        <td className="p-2">{(unitPrice * roundedArea).toLocaleString()} тг</td>
                      </tr>
                    )}
                    {bmz.buildingType === 'tp' && (
                      <tr>
                        <td className="p-2 text-left">
                          Здание ТП ({bmz.length}×{bmz.width}×{bmz.height} мм)
                        </td>
                        <td className="p-2">м²</td>
                        <td className="p-2">{roundedArea}</td>
                        <td className="p-2">—</td>
                        <td className="p-2">—</td>
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
                        quantity = roundedArea / 2;
                        unit = 'м²';
                      } else if (equipment.priceType === 'fixed') {
                        price = equipment.fixedPrice || 0;
                        quantity = 1;
                        unit = 'компл.';
                      }

                      const totalPrice = price * quantity;

                      return (
                        <tr key={equipment.name}>
                          <td className="p-2 text-left">{equipment.name}</td>
                          <td className="p-2">{unit}</td>
                          <td className="p-2">{quantity.toFixed(2)}</td>
                          <td className="p-2">{price.toLocaleString()} тг</td>
                          <td className="p-2">{totalPrice.toLocaleString()} тг</td>
                        </tr>
                      );
                    })}

                    <tr className="bg-[#f3f4f6] font-semibold">
                      <td colSpan={4} className="text-right pr-4">
                        ВСЕГО:
                      </td>
                      <td className="text-right pr-4">{totalPrice.toLocaleString()} тг</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            <BmzOptions
              state={bmz.equipmentState}
              setField={bmz.setEquipmentState}
              disabled={!isFormValid()}
              buildingType={bmz.buildingType}
              length={bmz.length}
              width={bmz.width}
            />
          </>
        ) : (
          <div className="text-center py-8 text-gray-500 bg-white border border-gray-200 rounded-lg shadow-sm">
            Здание не предусмотрено
          </div>
        )}

        <div className="pt-6">
          <button
            onClick={handleAddToSpec}
            disabled={!isFormValid()}
            className={`px-6 py-3 rounded-lg text-lg font-medium transition-colors ${
              isFormValid()
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {bmz.buildingType === 'none' ? 'Далее' : 'Добавить в спецификацию'}
          </button>
        </div>
      </div>
    </div>
  );
}
