'use client';

import { useRunnStore } from '@/store/useRunnStore';
import TogglerWithInput from './TogglerWithInput';
import RunnDguSection from './components/RunnDguSection';
import OutgoingCellSection from './components/OutgoingCellSection';
import { useState, useEffect, useRef } from 'react';
import type { RunnCell } from '@/store/useRunnStore';
import { Material } from '@/api/material';

const cellTypes = ['Ввод', 'Секционный выключатель'];

interface RunnCellTableProps {
  categoryMaterials?: Material[];
  autoSelectedMaterial?: Material | null;
  autoSelectedSvMaterial?: Material | null;
  meterMaterials?: Material[];
  meterMaterialsLoading?: boolean;
}

export default function RunnCellTable({
  categoryMaterials = [],
  autoSelectedMaterial,
  autoSelectedSvMaterial,
  meterMaterials = [],
  meterMaterialsLoading = false,
}: RunnCellTableProps = {}) {
  const { cellConfigs, addCell, updateCell, removeCell } = useRunnStore();
  const [openCellMap, setOpenCellMap] = useState<Record<string, string>>({});

  const prevCellConfigsRef = useRef<RunnCell[]>([]);
  const processedMaterialsRef = useRef<{
    vvodMaterial: string | null;
    svMaterial: string | null;
  }>({ vvodMaterial: null, svMaterial: null });

  // Получаем автоматически выбранные материалы из пропсов вместо хука
  // const { autoSelectedMaterial, autoSelectedSvMaterial } = useAutoMaterialSelection({
  //   categoryMaterials,
  //   categoryName,
  // });

  // Создаем опции автоматов из реальных материалов
  const breakerOptions = categoryMaterials.map((material) => material.name);

  // Создаем опции для ПУ из материалов счетчика
  const meterOptions = meterMaterials.map((material) => material.name);

  // Отладочная информация
  useEffect(() => {
    console.log('=== ОТЛАДКА RunnCellTable ===');
    console.log('meterMaterials:', meterMaterials);
    console.log('meterOptions:', meterOptions);
    console.log('meterMaterialsLoading:', meterMaterialsLoading);
  }, [meterMaterials, meterOptions, meterMaterialsLoading]);

  // Компонент для отображения сводки материалов
  const MaterialSummaryTable = ({ cell }: { cell: RunnCell }) => {
    const selectedMaterials = [];

    // Добавляем автомат выкатной
    if (cell.breaker) {
      const breakerMaterial = categoryMaterials.find((m) => m.name === cell.breaker);
      if (breakerMaterial) {
        selectedMaterials.push({
          name: cell.breaker,
          price:
            typeof breakerMaterial.price === 'string'
              ? parseFloat(breakerMaterial.price)
              : breakerMaterial.price,
          quantity: cell.quantity || 1,
          unit: breakerMaterial.unit,
          type: 'Автомат выкатной',
        });
      }
    }

    // Добавляем ПУ
    if (cell.meterType) {
      const meterMaterial = meterMaterials.find((m) => m.name === cell.meterType);
      if (meterMaterial) {
        selectedMaterials.push({
          name: cell.meterType,
          price:
            typeof meterMaterial.price === 'string'
              ? parseFloat(meterMaterial.price)
              : meterMaterial.price,
          quantity: cell.quantity || 1,
          unit: meterMaterial.unit,
          type: 'ПУ',
        });
      }
    }

    if (selectedMaterials.length === 0) {
      return null;
    }

    const totalSum = selectedMaterials.reduce(
      (sum, material) => sum + material.price * material.quantity,
      0
    );

    return (
      <div className="mt-3 p-3 bg-gray-50 rounded border">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Выбранные материалы:</h4>
        <div className="overflow-x-auto">
          <table className="min-w-full text-xs">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-1 px-2">Тип</th>
                <th className="text-left py-1 px-2">Наименование</th>
                <th className="text-right py-1 px-2">Цена (₸)</th>
                <th className="text-center py-1 px-2">Кол-во</th>
                <th className="text-right py-1 px-2">Сумма (₸)</th>
              </tr>
            </thead>
            <tbody>
              {selectedMaterials.map((material, index) => (
                <tr key={index} className="border-b border-gray-100">
                  <td className="py-1 px-2 text-gray-600">{material.type}</td>
                  <td className="py-1 px-2 font-medium">{material.name}</td>
                  <td className="py-1 px-2 text-right">{material.price.toLocaleString()}</td>
                  <td className="py-1 px-2 text-center">{material.quantity}</td>
                  <td className="py-1 px-2 text-right font-medium">
                    {(material.price * material.quantity).toLocaleString()}
                  </td>
                </tr>
              ))}
              <tr className="bg-gray-100 font-medium">
                <td colSpan={4} className="py-1 px-2 text-right">
                  Итого:
                </td>
                <td className="py-1 px-2 text-right">{totalSum.toLocaleString()} ₸</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Инициализируем openCellMap на основе существующих ячеек
  useEffect(() => {
    // Проверяем, изменились ли cellConfigs
    const cellConfigsChanged =
      JSON.stringify(cellConfigs) !== JSON.stringify(prevCellConfigsRef.current);

    if (cellConfigsChanged) {
      // Обновляем openCellMap на основе существующих ячеек
      const newOpenCellMap: Record<string, string> = {};
      cellConfigs.forEach((cell) => {
        if (cell.purpose === 'Ввод' || cell.purpose === 'Секционный выключатель') {
          newOpenCellMap[cell.purpose] = cell.id;
        }
      });
      setOpenCellMap(newOpenCellMap);
      prevCellConfigsRef.current = cellConfigs;
    }
  }, [cellConfigs]);

  // Автоматически создаем ячейку "Ввод" при наличии autoSelectedMaterial
  useEffect(() => {
    if (autoSelectedMaterial && !cellConfigs.find((c) => c.purpose === 'Ввод')) {
      const vvodId = crypto.randomUUID();
      addCell({
        id: vvodId,
        purpose: 'Ввод',
        breaker: autoSelectedMaterial.name,
        quantity: 1,
      });
      setOpenCellMap((prev) => ({ ...prev, Ввод: vvodId }));
    }
  }, [autoSelectedMaterial, addCell]);

  // Автоматически создаем ячейку "Секционный выключатель" при наличии autoSelectedSvMaterial
  useEffect(() => {
    if (
      autoSelectedSvMaterial &&
      !cellConfigs.find((c) => c.purpose === 'Секционный выключатель')
    ) {
      const svId = crypto.randomUUID();
      addCell({
        id: svId,
        purpose: 'Секционный выключатель',
        breaker: autoSelectedSvMaterial.name,
        quantity: 1,
      });
      setOpenCellMap((prev) => ({ ...prev, 'Секционный выключатель': svId }));
    }
  }, [autoSelectedSvMaterial, addCell]);

  // Обработка изменений в материалах
  useEffect(() => {
    // Проверяем, изменились ли обработанные материалы
    const currentVvodMaterial = autoSelectedMaterial?.name || null;
    const currentSvMaterial = autoSelectedSvMaterial?.name || null;

    const materialsChanged =
      currentVvodMaterial !== processedMaterialsRef.current.vvodMaterial ||
      currentSvMaterial !== processedMaterialsRef.current.svMaterial;

    if (materialsChanged) {
      // Обновляем ячейку "Ввод"
      const vvodCell = cellConfigs.find((c) => c.purpose === 'Ввод');
      if (vvodCell && currentVvodMaterial) {
        updateCell(vvodCell.id, 'breaker', currentVvodMaterial);
      }

      // Обновляем ячейку "Секционный выключатель"
      const svCell = cellConfigs.find((c) => c.purpose === 'Секционный выключатель');
      if (svCell && currentSvMaterial) {
        updateCell(svCell.id, 'breaker', currentSvMaterial);
      }

      // Обновляем ссылки на обработанные материалы
      processedMaterialsRef.current = {
        vvodMaterial: currentVvodMaterial,
        svMaterial: currentSvMaterial,
      };
    }
  }, [autoSelectedMaterial, autoSelectedSvMaterial, cellConfigs, updateCell]);

  const renderSelectBlock = (
    label: string,
    value: string,
    onChange: (v: string) => void,
    options: string[],
    isLoading: boolean = false
  ) => (
    <div className="flex flex-col gap-1 min-w-[120px]">
      <span className="text-xs font-medium text-[#3A55DF]">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#3A55DF]"
        disabled={isLoading}
      >
        <option value="">—</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );

  const renderCellConfig = (
    cell: RunnCell & {
      update: (field: keyof RunnCell, val: string | number) => void;
      remove: () => void;
    },
    title: string,
    isRunnDgu: boolean = false
  ) => {
    // Добавляем отладочную информацию
    if (title === 'Ввод' || title === 'Секционный выключатель') {
      console.log(`=== ОТЛАДКА ЯЧЕЙКИ ${title} ===`);
      console.log('Текущий материал в ячейке:', cell.breaker);
      console.log('autoSelectedMaterial:', autoSelectedMaterial?.name);
      console.log('autoSelectedSvMaterial:', autoSelectedSvMaterial?.name);
    }

    return (
      <div className="flex flex-wrap gap-4 items-end p-4 rounded bg-white border border-gray-100">
        {/* Для ячеек "Ввод" и "Секционный выключатель" показываем автомат выкатной как фиксированное значение */}
        {title === 'Ввод' || title === 'Секционный выключатель' ? (
          <div className="flex flex-col gap-1 min-w-[200px]">
            <span className="text-xs font-medium text-[#3A55DF]">Автомат выкатной</span>
            <div className="border border-gray-300 rounded px-2 py-1 text-sm bg-gray-50 text-gray-700">
              {cell.breaker || 'Не выбран'}
            </div>
          </div>
        ) : (
          renderSelectBlock(
            'Автомат выкатной',
            cell.breaker,
            (val) => cell.update('breaker', val),
            breakerOptions
          )
        )}

        {/* ПУ показываем только для ячеек Ввод и Отходящая, но не для Секционного выключателя */}
        {title !== 'Секционный выключатель' &&
          renderSelectBlock(
            'ПУ',
            cell.meterType ?? '',
            (val) => cell.update('meterType', val),
            meterOptions,
            meterMaterialsLoading
          )}

        {/* Дополнительные поля для РУНН-ДГУ */}
        {isRunnDgu && (
          <>
            <div className="flex flex-col gap-1 min-w-[120px]">
              <span className="text-xs font-medium text-[#3A55DF]">Номинальная мощность (кВт)</span>
              <input
                type="number"
                min={0}
                step={0.1}
                value={cell.nominalPower || ''}
                onChange={(e) => cell.update('nominalPower', Number(e.target.value) || 0)}
                className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#3A55DF]"
                placeholder="0"
              />
            </div>

            <div className="flex flex-col gap-1 min-w-[120px]">
              <span className="text-xs font-medium text-[#3A55DF]">Цена (₸)</span>
              <input
                type="number"
                min={0}
                value={cell.price || ''}
                onChange={(e) => cell.update('price', Number(e.target.value) || 0)}
                className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#3A55DF]"
                placeholder="0"
              />
            </div>
          </>
        )}

        <div className="flex flex-col gap-1 min-w-[100px]">
          <span className="text-xs font-medium text-[#3A55DF]">Кол-во</span>
          <input
            type="number"
            min={1}
            value={cell.quantity || 1}
            onChange={(e) => cell.update('quantity', Number(e.target.value))}
            className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#3A55DF]"
          />
        </div>

        <button
          onClick={cell.remove}
          className="text-red-600 hover:text-red-800 text-sm font-bold ml-auto"
          title="Удалить ячейку"
        >
          ✕
        </button>
      </div>
    );
  };

  const handleToggle = (type: string) => {
    const isOpen = !!openCellMap[type];

    if (isOpen) {
      const id = openCellMap[type];
      removeCell(id);
      setOpenCellMap((prev) => {
        const copy = { ...prev };
        delete copy[type];
        return copy;
      });
    } else {
      // Ячейка "Ввод" создается только автоматически, не позволяем создавать её вручную
      if (type === 'Ввод') {
        console.log('Ячейка "Ввод" создается только автоматически');
        return;
      }

      const newId = crypto.randomUUID();
      setOpenCellMap((prev) => ({ ...prev, [type]: newId }));

      // Определяем правильный материал для ячейки
      let defaultBreaker = '';
      if (type === 'Секционный выключатель' && autoSelectedSvMaterial) {
        defaultBreaker = autoSelectedSvMaterial.name;
      }

      addCell({ id: newId, purpose: type, breaker: defaultBreaker, quantity: 1 });
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {cellTypes.map((type) => {
        // Проверяем, есть ли ячейка этого типа в cellConfigs
        const existingCell = cellConfigs.find((c) => c.purpose === type);
        const id = openCellMap[type] || (existingCell ? existingCell.id : null);
        const cell = cellConfigs.find((c) => c.id === id);

        // Если ячейка существует, но не в openCellMap, добавляем её
        if (existingCell && !openCellMap[type]) {
          setOpenCellMap((prev) => ({ ...prev, [type]: existingCell.id }));
        }

        // Для ячеек "Ввод" и "Секционный выключатель" проверяем наличие автоматически выбранных материалов
        const shouldShowVvod = type === 'Ввод' && !!autoSelectedMaterial;
        const shouldShowSv = type === 'Секционный выключатель' && !!autoSelectedSvMaterial;
        const isToggled =
          type === 'Ввод'
            ? shouldShowVvod
            : type === 'Секционный выключатель'
            ? shouldShowSv
            : !!id;

        return (
          <TogglerWithInput
            key={type}
            label={`Ячейка: ${type}`}
            toggled={isToggled}
            onToggle={() => handleToggle(type)}
          >
            {cell &&
              renderCellConfig(
                {
                  ...cell,
                  update: (field: keyof RunnCell, val: string | number) =>
                    updateCell(cell.id, field, val),
                  remove: () => removeCell(cell.id),
                },
                type,
                type === 'РУНН-ДГУ Ввод' || type === 'РУНН-ДГУ Отходящая 1'
              )}
            <MaterialSummaryTable cell={cell} />
          </TogglerWithInput>
        );
      })}

      <OutgoingCellSection
        categoryMaterials={categoryMaterials}
        meterMaterials={meterMaterials}
        meterMaterialsLoading={meterMaterialsLoading}
      />

      <RunnDguSection categoryMaterials={categoryMaterials} meterMaterials={meterMaterials} />
    </div>
  );
}
