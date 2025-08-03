'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { switchgearApi, Switchgear } from '@/api/switchgear';
import { BusbarTable, TableRow, TableColumnHeader } from './components/BusbarTable';
import { SwitchgearFilters } from './components/SwitchgearFilters';
import { showToast } from '@/shared/modals/ToastProvider';
import { BusbarLoader } from '@/components/Busbar/BusbarLoader';
import { BusbarError } from '@/components/Busbar/BusbarError';
import { BusbarEmpty } from '@/components/Busbar/BusbarEmpty';
import { BusbarSaveButton } from '@/components/Busbar/BusbarSaveButton';
import { AddSwitchgearModal } from './components/AddSwitchgearModal';
import { getAllCalculationGroups } from '@/api/calculations';

interface NewSwitchgearConfig {
  type: string;
  breaker: string;
  amperage: string;
  group: string;
  busbar: string;
  cells: {
    name: string;
    quantity: number;
  }[];
}

interface UpdateSwitchgearData {
  type: string;
  breaker: string;
  amperage: number;
  group: string;
  busbar: string;
  cells: {
    name: string;
    quantity: number;
  }[];
}

export default function BusbarSettingsPage() {
  const [tableData, setTableData] = useState<TableRow[]>([]);
  const [columnHeaders, setColumnHeaders] = useState<TableColumnHeader[]>([]);
  const [allSwitchgearConfigs, setAllSwitchgearConfigs] = useState<Switchgear[]>([]); // Для фильтров
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    type: '',
    amperage: '',
    group: '',
  });
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [allTypes, setAllTypes] = useState<string[]>([]);

  // Выносим fetchData за пределы useEffect
  const fetchData = useCallback(async () => {
    try {
      const configs = await switchgearApi.getAll();
      setAllSwitchgearConfigs(configs);

      if (!configs || configs.length === 0) {
        setTableData([]);
        setColumnHeaders([]);
        return;
      }

      // Создаем уникальные заголовки столбцов
      const uniqueHeadersMap = new Map<string, TableColumnHeader>();
      configs.forEach((config) => {
        const id = `${config.breaker}_${config.amperage}_${config.group}_${config.busbar}`;
        if (!uniqueHeadersMap.has(id)) {
          uniqueHeadersMap.set(id, {
            id,
            breaker: config.breaker,
            amperage: String(config.amperage),
            group: config.group,
            busbar: config.busbar,
            type: config.type,
          });
        }
      });
      const headers = Array.from(uniqueHeadersMap.values());
      setColumnHeaders(headers);

      // Группируем данные по типу (КСО 12-10, КСО 17-20 и т.д.)
      const groupedByType = configs.reduce((acc, config) => {
        if (!acc[config.type]) {
          acc[config.type] = [];
        }
        acc[config.type].push(config);
        return acc;
      }, {} as { [key: string]: Switchgear[] });

      const cellTypes = ['Ввод', 'СВ', 'ОТХ', 'ТР', 'ТН', 'ТСН', 'ЗШН', 'СР', 'Шинный мост'];

      const transformedTableData: TableRow[] = [];

      Object.entries(groupedByType).forEach(([typeLabel, typeConfigs]) => {
        cellTypes.forEach((cellName) => {
          const newRow: TableRow = {
            typeLabel,
            cellName,
            values: {},
          };

          headers.forEach((header) => {
            const matchingConfig = typeConfigs.find(
              (tc) =>
                tc.breaker === header.breaker &&
                tc.amperage === parseInt(header.amperage) &&
                tc.group === header.group &&
                tc.busbar === header.busbar
            );

            if (matchingConfig) {
              const cell = matchingConfig.cells.find((c) => c.name === cellName);
              newRow.values[header.id] = cell ? cell.quantity : null;
            }
          });
          transformedTableData.push(newRow);
        });
      });

      setTableData(transformedTableData);
    } catch {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []); // Пустой массив зависимостей, так как все зависимости внутри fetchData статичны или обновляются через setState

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    // Получаем токен из localStorage или другого источника
    const token = localStorage.getItem('token');
    if (!token) return;
    getAllCalculationGroups(token)
      .then((groups) => {
        // Предполагаем, что у группы есть поле name или type
        setAllTypes(groups.map((g) => g.name));
      })
      .catch(() => setAllTypes([]));
  }, []);

  useEffect(() => {
    // Логика фильтрации, если фильтры будут применяться к уже загруженным данным
    // Если фильтры применяются на стороне сервера, то эта логика будет в fetchData
  }, [filters, allSwitchgearConfigs]);

  const handleInputChange = (
    typeLabel: string,
    cellName: string,
    columnId: string,
    value: number | null
  ) => {
    const newTableData = tableData.map((row) => {
      if (row.typeLabel === typeLabel && row.cellName === cellName) {
        return {
          ...row,
          values: {
            ...row.values,
            [columnId]: value,
          },
        };
      }
      return row;
    });
    setTableData(newTableData);
  };

  const handleAddRow = async (newConfig: NewSwitchgearConfig) => {
    try {
      const amperageAsNumber = parseInt(newConfig.amperage);
      if (isNaN(amperageAsNumber)) {
        showToast('Пожалуйста, введите корректное числовое значение для тока.', 'error');
        return;
      }

      const payload = {
        type: newConfig.type,
        breaker: newConfig.breaker,
        amperage: amperageAsNumber,
        group: newConfig.group,
        busbar: newConfig.busbar,
        cells: newConfig.cells.map((cell) => ({
          name: cell.name,
          quantity: cell.quantity || 0,
        })),
      };

      const response = await switchgearApi.create(payload);
      showToast('Конфигурация успешно добавлена', 'success');

      setAllSwitchgearConfigs((prev) => [...prev, response]);
      const headerId = `${response.breaker}_${response.amperage}_${response.group}_${response.busbar}`;
      const headerExists = columnHeaders.some((h) => h.id === headerId);
      if (!headerExists) {
        setColumnHeaders((prev) => [
          ...prev,
          {
            id: headerId,
            breaker: response.breaker,
            amperage: String(response.amperage),
            group: response.group,
            busbar: response.busbar,
            type: response.type,
          },
        ]);
      }
      const cellTypes = ['Ввод', 'СВ', 'ОТХ', 'ТР', 'ТН', 'ТСН', 'ЗШН', 'СР', 'Шинный мост'];
      const newRows: TableRow[] = cellTypes.map((cellName) => {
        const cell = response.cells.find((c) => c.name === cellName);
        return {
          typeLabel: response.type,
          cellName,
          values: {
            [headerId]: cell ? cell.quantity : null,
          },
        };
      });
      setTableData((prev) => [...prev, ...newRows]);
    } catch {
      showToast(`Ошибка при добавлении конфигурации: Произошла ошибка.`, 'error');
    }
  };

  const handleSave = async () => {
    try {
      // Собираем все изменения из tableData
      const updates = new Map<number, UpdateSwitchgearData>(); // Map для хранения обновлений по id конфигурации

      tableData.forEach((row) => {
        Object.entries(row.values).forEach(([columnId, value]) => {
          const [breaker, amperageWithA, group, busbar] = columnId.split('_');
          const amperage = parseInt(amperageWithA.replace('A', ''));

          // Находим соответствующую конфигурацию
          const configToUpdate = allSwitchgearConfigs.find(
            (config) =>
              config.type === row.typeLabel &&
              config.breaker === breaker &&
              config.amperage === amperage &&
              config.group === group &&
              config.busbar === busbar
          );

          if (configToUpdate) {
            // Если для этой конфигурации еще нет записи в updates, создаем ее
            if (!updates.has(configToUpdate.id)) {
              updates.set(configToUpdate.id, {
                type: configToUpdate.type,
                breaker: configToUpdate.breaker,
                amperage: configToUpdate.amperage,
                group: configToUpdate.group,
                busbar: configToUpdate.busbar,
                cells: [...configToUpdate.cells], // Копируем существующие ячейки
              });
            }

            // Обновляем количество в соответствующей ячейке
            const update = updates.get(configToUpdate.id);
            if (update) {
              const cellIndex = update.cells.findIndex((cell) => cell.name === row.cellName);
              if (cellIndex !== -1) {
                update.cells[cellIndex].quantity = value || 0;
              } else {
                update.cells.push({ name: row.cellName, quantity: value || 0 });
              }
            }
          }
        });
      });

      // Отправляем все обновления на сервер
      const updatePromises = Array.from(updates.entries()).map(([id, updateData]) =>
        switchgearApi.update(id, updateData)
      );

      await Promise.all(updatePromises);
      showToast('Все изменения успешно сохранены', 'success');

      // Обновляем данные после сохранения
      await fetchData();
    } catch {
      showToast(`Ошибка при сохранении данных: Произошла ошибка.`, 'error');
    }
  };

  const handleDeleteColumn = async (headerId: string) => {
    // Находим header по id
    const header = columnHeaders.find((h) => h.id === headerId);
    if (!header) return;

    // Находим конфигурацию по всем параметрам
    const config = allSwitchgearConfigs.find(
      (c) =>
        c.breaker === header.breaker &&
        c.amperage === parseInt(header.amperage) &&
        c.group === header.group &&
        c.busbar === header.busbar &&
        c.type === header.type
    );
    if (!config) {
      showToast('Конфигурация не найдена', 'error');
      return;
    }

    if (!window.confirm('Удалить конфигурацию?')) return;
    try {
      await switchgearApi.delete(config.id);
      showToast('Конфигурация удалена', 'success');
      await fetchData();
    } catch {
      showToast('Ошибка при удалении', 'error');
    }
  };

  const handleOpenAddModal = () => setIsAddModalOpen(true);
  const handleCloseAddModal = () => setIsAddModalOpen(false);

  if (loading) {
    return <BusbarLoader />;
  }

  if (error) {
    return <BusbarError error={error} />;
  }

  // Фильтрация данных по выбранному типу
  const filteredTableData = filters.type
    ? tableData.filter((row) => row.typeLabel === filters.type)
    : [];

  const filteredColumnHeaders = filters.type
    ? columnHeaders.filter((header) => header.type === filters.type)
    : [];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Конфигурации РУ</h1>

      <SwitchgearFilters
        filters={filters}
        onFilterChange={setFilters}
        configurations={allSwitchgearConfigs}
      />

      <button
        onClick={handleOpenAddModal}
        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mb-4"
      >
        Добавить конфигурацию
      </button>
      <AddSwitchgearModal
        open={isAddModalOpen}
        onClose={handleCloseAddModal}
        onAdd={handleAddRow}
        type={filters.type}
        allTypes={allTypes}
      />

      {!filters.type ? (
        <div className="text-center text-gray-500 my-8 text-lg">Выберите тип</div>
      ) : (
        <>
          <BusbarTable
            data={filteredTableData}
            columnHeaders={filteredColumnHeaders}
            onInputChange={handleInputChange}
            filterType={filters.type}
            filterAmperage={filters.amperage}
            filterGroup={filters.group}
            onDeleteColumn={handleDeleteColumn}
          />
          {filteredTableData.length === 0 && <BusbarEmpty />}
          <BusbarSaveButton onClick={handleSave} loading={loading} />
        </>
      )}
    </div>
  );
}
