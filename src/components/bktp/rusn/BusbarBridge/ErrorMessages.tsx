import React from 'react';
import { BusMaterial } from '@/types/rusn';
import { BusAlert } from '@/components/shared/busUi';

interface ErrorMessagesProps {
  selectedMaterial: BusMaterial | null;
  hasMatchingConfig: boolean;
  length?: number;
}

export const ErrorMessages: React.FC<ErrorMessagesProps> = ({
  selectedMaterial,
  hasMatchingConfig,
  length = 0,
}) => {
  return (
    <>
      {!selectedMaterial && (
        <BusAlert variant="warning" title="Выберите материал">
          Укажите материал шины для расчёта шинных мостов.
        </BusAlert>
      )}

      {selectedMaterial && !hasMatchingConfig && (
        <BusAlert variant="error" title="Конфигурация не найдена">
          Не найдена подходящая конфигурация для выбранного выключателя и материала.
        </BusAlert>
      )}

      {selectedMaterial && hasMatchingConfig && length <= 0 && (
        <BusAlert variant="info" title="Укажите длину моста">
          Добавьте шинный мост и задайте длину больше 0 для расчёта стоимости.
        </BusAlert>
      )}
    </>
  );
};
