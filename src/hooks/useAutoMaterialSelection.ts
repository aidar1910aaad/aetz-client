import { useEffect, useState, useRef } from 'react';
import { useTransformerStore } from '@/store/useTransformerStore';
import { useRunnStore } from '@/store/useRunnStore';
import { Material } from '@/api/material';
import {
  findMaterialByCurrent,
  getVvodCurrentByTransformerPower,
  getSvCurrentByTransformerPower,
} from '@/app/dashboard/bktp/runn/utils/materialFinder';

interface UseAutoMaterialSelectionProps {
  categoryMaterials: Material[];
  categoryName: string;
}

export function useAutoMaterialSelection({
  categoryMaterials,
  categoryName,
}: UseAutoMaterialSelectionProps) {
  const { selectedTransformer } = useTransformerStore();
  const { cellConfigs, updateCell, addCell } = useRunnStore();
  const [autoSelectedMaterial, setAutoSelectedMaterial] = useState<Material | null>(null);
  const [autoSelectedSvMaterial, setAutoSelectedSvMaterial] = useState<Material | null>(null);
  const [isAutoSelectionEnabled, setIsAutoSelectionEnabled] = useState(false);

  // Используем ref для отслеживания предыдущих значений
  const prevValuesRef = useRef({
    transformerPower: 0,
    categoryMaterialsLength: 0,
    categoryName: '',
    cellConfigsLength: 0,
  });

  useEffect(() => {
    // Проверяем, есть ли выбранный трансформатор и материалы категории
    if (!selectedTransformer || !categoryMaterials || categoryMaterials.length === 0) {
      setAutoSelectedMaterial(null);
      setAutoSelectedSvMaterial(null);
      setIsAutoSelectionEnabled(false);
      return;
    }

    const transformerPower = selectedTransformer.power;
    const currentValues = {
      transformerPower,
      categoryMaterialsLength: categoryMaterials.length,
      categoryName,
      cellConfigsLength: cellConfigs.length,
    };

    // Проверяем, изменились ли значения
    const valuesChanged =
      prevValuesRef.current.transformerPower !== transformerPower ||
      prevValuesRef.current.categoryMaterialsLength !== categoryMaterials.length ||
      prevValuesRef.current.categoryName !== categoryName ||
      prevValuesRef.current.cellConfigsLength !== cellConfigs.length;

    if (!valuesChanged) {
      return; // Пропускаем, если ничего не изменилось
    }

    console.log('=== АВТОМАТИЧЕСКИЙ ВЫБОР МАТЕРИАЛА ===');
    console.log('Мощность трансформатора:', transformerPower, 'кВА');

    // Получаем рекомендуемый ток для ввода
    const recommendedCurrent = getVvodCurrentByTransformerPower(transformerPower);
    const recommendedSvCurrent = getSvCurrentByTransformerPower(transformerPower);

    if (!recommendedCurrent) {
      console.log('Рекомендуемый ток не найден для мощности:', transformerPower);
      setAutoSelectedMaterial(null);
      setAutoSelectedSvMaterial(null);
      setIsAutoSelectionEnabled(false);
      prevValuesRef.current = currentValues;
      return;
    }

    console.log('Рекомендуемый ток для ввода:', recommendedCurrent, 'A');
    console.log('Рекомендуемый ток для секционного выключателя:', recommendedSvCurrent, 'A');

    // Ищем подходящий материал для ввода
    const foundMaterial = findMaterialByCurrent(categoryMaterials, recommendedCurrent);

    // Ищем подходящий материал для секционного выключателя
    const foundSvMaterial = recommendedSvCurrent
      ? findMaterialByCurrent(categoryMaterials, recommendedSvCurrent)
      : null;

    // Добавляем небольшую задержку для создания ячеек
    setTimeout(() => {
      if (foundMaterial) {
        console.log('✅ Найден автоматически материал для ввода:', foundMaterial.name);
        setAutoSelectedMaterial(foundMaterial);

        // Находим или создаем ячейку "Ввод"
        let vvodCell = cellConfigs.find((cell) => cell.purpose === 'Ввод');

        if (!vvodCell) {
          // Создаем ячейку "Ввод" если её нет
          console.log('Создаем ячейку Ввод автоматически');
          const newCellId = crypto.randomUUID();
          addCell({
            id: newCellId,
            purpose: 'Ввод',
            breaker: foundMaterial.name,
            quantity: 1,
          });
          vvodCell = { id: newCellId, purpose: 'Ввод', breaker: foundMaterial.name, quantity: 1 };
        } else {
          // Обновляем существующую ячейку только если материал отличается
          if (vvodCell.breaker !== foundMaterial.name) {
            console.log('Обновляем существующую ячейку Ввод с материалом:', foundMaterial.name);
            updateCell(vvodCell.id, 'breaker', foundMaterial.name);
          }
        }

        setIsAutoSelectionEnabled(true);
      } else {
        console.log(
          '❌ Подходящий материал для ввода не найден для тока:',
          recommendedCurrent,
          'A'
        );
        setAutoSelectedMaterial(null);
      }

      // Обрабатываем материал для секционного выключателя
      if (foundSvMaterial) {
        console.log(
          '✅ Найден автоматически материал для секционного выключателя:',
          foundSvMaterial.name
        );
        setAutoSelectedSvMaterial(foundSvMaterial);

        // Находим или создаем ячейку "Секционный выключатель"
        let svCell = cellConfigs.find((cell) => cell.purpose === 'Секционный выключатель');

        if (!svCell) {
          // Создаем ячейку "Секционный выключатель" если её нет
          console.log('Создаем ячейку Секционный выключатель автоматически');
          const newCellId = crypto.randomUUID();
          addCell({
            id: newCellId,
            purpose: 'Секционный выключатель',
            breaker: foundSvMaterial.name,
            quantity: 1,
          });
          svCell = {
            id: newCellId,
            purpose: 'Секционный выключатель',
            breaker: foundSvMaterial.name,
            quantity: 1,
          };
        } else {
          // Обновляем существующую ячейку только если материал отличается
          if (svCell.breaker !== foundSvMaterial.name) {
            console.log(
              'Обновляем существующую ячейку Секционный выключатель с материалом:',
              foundSvMaterial.name
            );
            updateCell(svCell.id, 'breaker', foundSvMaterial.name);
          }
        }
      } else {
        console.log(
          '❌ Подходящий материал для секционного выключателя не найден для тока:',
          recommendedSvCurrent,
          'A'
        );
        setAutoSelectedSvMaterial(null);
      }

      // Дополнительная проверка и обновление ячеек
      setTimeout(() => {
        const updatedCellConfigs = cellConfigs;

        // Проверяем и обновляем ячейку "Ввод"
        const vvodCell = updatedCellConfigs.find((cell) => cell.purpose === 'Ввод');
        if (vvodCell && foundMaterial && vvodCell.breaker !== foundMaterial.name) {
          console.log('Принудительно обновляем ячейку Ввод с материалом:', foundMaterial.name);
          updateCell(vvodCell.id, 'breaker', foundMaterial.name);
        }

        // Проверяем и обновляем ячейку "Секционный выключатель"
        const svCell = updatedCellConfigs.find((cell) => cell.purpose === 'Секционный выключатель');
        if (svCell && foundSvMaterial && svCell.breaker !== foundSvMaterial.name) {
          console.log(
            'Принудительно обновляем ячейку Секционный выключатель с материалом:',
            foundSvMaterial.name
          );
          updateCell(svCell.id, 'breaker', foundSvMaterial.name);
        }
      }, 200); // Дополнительная задержка для обновления
    }, 100); // Небольшая задержка в 100мс

    // Обновляем предыдущие значения
    prevValuesRef.current = currentValues;
  }, [selectedTransformer, categoryMaterials, categoryName, cellConfigs, updateCell, addCell]);

  return {
    autoSelectedMaterial,
    autoSelectedSvMaterial,
    isAutoSelectionEnabled,
    transformerPower: selectedTransformer?.power || null,
    recommendedCurrent: selectedTransformer
      ? getVvodCurrentByTransformerPower(selectedTransformer.power)
      : null,
    recommendedSvCurrent: selectedTransformer
      ? getSvCurrentByTransformerPower(selectedTransformer.power)
      : null,
  };
}
