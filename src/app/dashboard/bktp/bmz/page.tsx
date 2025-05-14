'use client';

import { useRouter } from 'next/navigation';
import { useBmzStore } from '@/store/useBmzStore';
import { useBktpStore } from '@/store/useBktpStore';
import Breadcrumbs from '@/components/Breadcrumbs/Breadcrumbs';
import { BmzBuildingType } from '@/components/BmzConfig/BmzBuildingType';
import { BmzDimensions } from '@/components/BmzConfig/BmzDimensions';
import { BmzOptions } from '@/components/BmzConfig/BmzOptions';

export default function BmzConfigPage() {
  const router = useRouter();

  const {
    width,
    length,
    height,
    thickness,
    lighting,
    heatedFloor,
    heating,
    fireAlarm,
    cableTrays,
    conditioning,
    ventilationShaft,
    buildingType,
    blockCount,
    setField,
  } = useBmzStore();

  const { taskNumber, client, date } = useBktpStore();
  const filename = `${taskNumber}-БКТП-${client}-${date}`;

  const isDisabled = buildingType === 'none';

  const handleBuildingTypeChange = (type: 'bmz' | 'tp' | 'none') => {
    setField('buildingType', type);
    setField('isBuildingCounted', type === 'bmz');

    if (type === 'bmz') {
      setField('lighting', true);
      setField('heating', true);
      setField('fireAlarm', true);
      setField('height', 3150);
      setField('thickness', 50);
    }
  };

  const handleNext = () => {
    if (buildingType === 'bmz') {
      if (!width || !length || !height || !thickness) {
        alert('Заполните все размеры (ширина, длина, высота, толщина) перед продолжением!');
        return;
      }
    }

    router.push('/dashboard/bktp/transformers');
  };

  const calculatePrice = (width: number, length: number, thickness: number | null): number => {
    if (!width || !length || !thickness) return 0;
    const area = (width / 1000) * (length / 1000);

    if (thickness === 50) {
      if (area > 50) return 173500;
      if (area > 20) return 200500;
      return 243000;
    } else if (thickness === 100) {
      if (area > 50) return 190500;
      if (area > 20) return 225000;
      return 270000;
    }
    return 0;
  };

  const unitPrice = calculatePrice(width, length, thickness);
  const area = (width / 1000) * (length / 1000);
  const roundedArea = Math.round(area * 10) / 10;
  const totalPrice = Math.round(unitPrice * area);

  return (
    <div className="h-[calc(100vh-110px)] overflow-y-auto px-6 py-6 bg-gray-50">
      <Breadcrumbs />
      <h1 className="text-2xl font-bold mb-4">
        <span className="text-[#3A55DF]">{filename}</span> параметры БМЗ
      </h1>

      <BmzBuildingType buildingType={buildingType} onChange={handleBuildingTypeChange} />

      <BmzDimensions
        width={width}
        length={length}
        height={height}
        thickness={thickness}
        blockCount={blockCount}
        isDisabled={isDisabled}
        setField={setField}
      />

      <div className="bg-white border border-gray-200 rounded-md p-5 shadow-sm mt-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Расчёт стоимости</h3>
        <div className="space-y-2 text-sm text-gray-800">
          <p>
            Площадь:{' '}
            <span className="font-semibold text-black">
              {isNaN(roundedArea) ? 0 : roundedArea} м²
            </span>
          </p>
          <p>
            Стоимость за м²:{' '}
            <span className="font-semibold text-black">{unitPrice.toLocaleString()} тг</span>
          </p>
          <p>
            Общая стоимость:{' '}
            <span className="text-lg font-bold text-[#3A55DF]">
              {isNaN(totalPrice) ? 0 : totalPrice.toLocaleString()} тг
            </span>
          </p>
        </div>
      </div>

      <BmzOptions
        lighting={lighting}
        heatedFloor={heatedFloor}
        heating={heating}
        fireAlarm={fireAlarm}
        cableTrays={cableTrays}
        conditioning={conditioning}
        ventilationShaft={ventilationShaft}
        isDisabled={isDisabled}
        setField={setField}
      />

      <div className="pt-6">
        <button
          onClick={handleNext}
          className="bg-[#3A55DF] text-white px-6 py-2 rounded hover:bg-[#2e46c5]"
        >
          Далее
        </button>
      </div>
    </div>
  );
}
