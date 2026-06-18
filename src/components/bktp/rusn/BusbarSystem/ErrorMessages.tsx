import React from 'react';
import { BusMaterial } from '@/types/rusn';
import { BusAlert } from '@/components/shared/busUi';

interface ErrorMessagesProps {
  selectedMaterial: BusMaterial | null;
  hasMatchingConfig: boolean;
}

export const ErrorMessages: React.FC<ErrorMessagesProps> = ({
  selectedMaterial,
  hasMatchingConfig,
}) => {
  return (
    <>
      {!selectedMaterial && (
        <BusAlert variant="warning" title="Выберите материал">
          Укажите материал шины (алюминий или медь), чтобы подобрать конфигурацию и выполнить расчёт.
        </BusAlert>
      )}

      {selectedMaterial && !hasMatchingConfig && (
        <BusAlert variant="error" title="Конфигурация не найдена">
          Не найдена подходящая конфигурация для выбранного выключателя и материала. Проверьте
          настройки ячеек РУСН или выберите другой материал.
        </BusAlert>
      )}
    </>
  );
};
