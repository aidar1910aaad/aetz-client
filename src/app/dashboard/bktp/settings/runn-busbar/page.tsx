'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { switchgearApi, Switchgear } from '@/api/switchgear';
import { BusbarTable, TableRow, TableColumnHeader } from './components/BusbarTable';
import { showToast } from '@/shared/modals/ToastProvider';
import { BusbarLoader } from './components/BusbarLoader';
import { BusbarError } from './components/BusbarError';
import { BusbarEmpty } from './components/BusbarEmpty';
import { BusbarSaveButton } from './components/BusbarSaveButton';
import { AddSwitchgearModal } from './components/AddSwitchgearModal';
import { getAllCalculationGroups } from '@/api/calculations';
import { ChevronLeft } from 'lucide-react';
import RoleGuard from '@/components/common/RoleGuard';
import { UserRole } from '@/types/user';

interface NewSwitchgearConfig {
  type: string;
  breaker: string;
  amperage: string;
  group: string;
  busbar: string;
  power?: string; // Добавляем поле для мощности
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

export default function RunnBusbarSettingsPage() {
  const router = useRouter();
  const [tableData, setTableData] = useState<TableRow[]>([]);
  const [columnHeaders, setColumnHeaders] = useState<TableColumnHeader[]>([]);
  const [allSwitchgearConfigs, setAllSwitchgearConfigs] = useState<Switchgear[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Убираем фильтры - показываем все таблицы автоматически
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [allTypes, setAllTypes] = useState<string[]>([]);

  const fetchData = useCallback(async () => {
    try {
      const configs = await switchgearApi.getAll();
      console.log('Loaded configs:', configs);
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
      
      // Сортируем заголовки по мощности с сохранением стабильности
      const headers = Array.from(uniqueHeadersMap.values()).sort((a, b) => {
        const configA = configs.find(c => 
          c.breaker === a.breaker && 
          c.amperage === parseInt(a.amperage) && 
          c.group === a.group && 
          c.busbar === a.busbar
        );
        const configB = configs.find(c => 
          c.breaker === b.breaker && 
          c.amperage === parseInt(b.amperage) && 
          c.group === b.group && 
          c.busbar === b.busbar
        );
        
        // Приоритет сортировки: power -> group -> busbar -> amperage -> id (для стабильности)
        // Для панелей ЩО-70 мощность может быть в поле power или в breaker
        const powerA = configA?.power || (configA?.type?.includes('ЩО') ? parseInt(configA.breaker) || 0 : 0);
        const powerB = configB?.power || (configB?.type?.includes('ЩО') ? parseInt(configB.breaker) || 0 : 0);
        const amperageA = configA?.amperage || 0;
        const amperageB = configB?.amperage || 0;
        
        // Сначала по мощности
        if (powerA !== powerB) {
          console.log(`Sorting by power: ${powerA} vs ${powerB}`, { configA: configA?.type, configB: configB?.type });
          return powerA - powerB;
        }
        
        // Затем по группе
        const groupA = configA?.group || '';
        const groupB = configB?.group || '';
        if (groupA !== groupB) {
          return groupA.localeCompare(groupB);
        }
        
        // Затем по шине
        const busbarA = configA?.busbar || '';
        const busbarB = configB?.busbar || '';
        if (busbarA !== busbarB) {
          return busbarA.localeCompare(busbarB);
        }
        
        // Затем по току
        if (amperageA !== amperageB) {
          return amperageA - amperageB;
        }
        
        // Наконец по ID для стабильности сортировки
        return a.id.localeCompare(b.id);
      });
      
      setColumnHeaders(headers);

      // Группируем данные по типу (КСО 12-10, КСО 17-20 и т.д.)
      const groupedByType = configs.reduce((acc, config) => {
        if (!acc[config.type]) {
          acc[config.type] = [];
        }
        acc[config.type].push(config);
        return acc;
      }, {} as { [key: string]: Switchgear[] });

      const cellTypes = ['Ввод', 'СВ', 'ОТХ', 'УСТ', 'Шинный мост'];

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
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    getAllCalculationGroups(token)
      .then((groups) => {
        const typeNames = groups.map((g) => g.name);
        setAllTypes(typeNames);
        
      })
      .catch(() => setAllTypes([]));
  }, []);

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

      // Для панели ЩО используем мощность как breaker, иначе используем breaker
      const isPanel = newConfig.type && (
        newConfig.type.toLowerCase().includes('панель') && newConfig.type.toLowerCase().includes('що') ||
        newConfig.type.toLowerCase().includes('що-70') ||
        newConfig.type.toLowerCase().includes('що-70n')
      );
      
      // Временно принудительно включаем режим мощности для тестирования
      // TODO: Убрать после тестирования
      const forcePowerMode = true;
      
      const breakerValue = forcePowerMode ? (newConfig.power || '') : (isPanel ? (newConfig.power || '') : newConfig.breaker);


      const payload = {
        type: newConfig.type,
        breaker: breakerValue,
        amperage: amperageAsNumber,
        group: newConfig.group,
        busbar: newConfig.busbar,
        power: newConfig.power ? parseInt(newConfig.power) : undefined,
        cells: newConfig.cells.map((cell) => ({
          name: cell.name,
          quantity: cell.quantity || 0,
        })),
      };

      const response = await switchgearApi.create(payload);
      showToast('Конфигурация успешно добавлена', 'success');

      // Добавляем новую конфигурацию и пересортировываем
      setAllSwitchgearConfigs((prev) => {
        const updated = [...prev, response];
        // Пересортировываем все конфигурации
        return updated.sort((a, b) => {
          const powerA = a.power || 0;
          const powerB = b.power || 0;
          const amperageA = a.amperage || 0;
          const amperageB = b.amperage || 0;
          
          if (powerA !== powerB) return powerA - powerB;
          if (amperageA !== amperageB) return amperageA - amperageB;
          if (a.group !== b.group) return a.group.localeCompare(b.group);
          if (a.busbar !== b.busbar) return a.busbar.localeCompare(b.busbar);
          return a.id - b.id;
        });
      });
      
      // Перезагружаем данные для правильной сортировки
      fetchData();
      const cellTypes = ['Ввод', 'СВ', 'ОТХ', 'УСТ', 'Шинный мост'];
      const headerId = `${response.breaker}_${response.amperage}_${response.group}_${response.busbar}`;
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
      const updates = new Map<number, UpdateSwitchgearData>();

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
                cells: [...configToUpdate.cells],
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

  // Показываем все данные без фильтрации

  return (
    <RoleGuard
      allowedRoles={[UserRole.ADMIN, UserRole.PTO]}
      redirectTo="/dashboard"
      pagePath="/dashboard/bktp/settings/runn-busbar"
    >
      <div className="h-[calc(100vh-65px)] overflow-y-auto bg-gradient-to-br from-white via-green-50/30 to-emerald-50/20">
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => router.back()}
            className="p-3 bg-white hover:bg-[#8eba1e]/10 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md border border-[#8eba1e]/30"
          >
            <ChevronLeft className="w-5 h-5 text-[#8eba1e]" />
          </button>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[#8eba1e] rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#8eba1e]">Сборные шины РУНН</h1>
              <p className="text-sm text-gray-600 mt-1">Настройка конфигураций для РУНН панели ЩО</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">Конфигурации РУНН</h2>
            <button
              onClick={handleOpenAddModal}
              className="px-4 py-2 text-sm font-medium text-white bg-[#8eba1e] rounded-lg hover:bg-[#7aa31a] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8eba1e] transition-all duration-200 shadow-md hover:shadow-lg"
            >
              Добавить конфигурацию
            </button>
          </div>

          <AddSwitchgearModal
            open={isAddModalOpen}
            onClose={handleCloseAddModal}
            onAdd={handleAddRow}
            type=""
            allTypes={allTypes}
          />

          <div className="bg-white rounded-xl shadow-lg border border-[#8eba1e]/20 overflow-hidden">
            <BusbarTable
              data={tableData}
              columnHeaders={columnHeaders}
              onInputChange={handleInputChange}
              onDeleteColumn={handleDeleteColumn}
            />
            {tableData.length === 0 && <BusbarEmpty />}
          </div>
          
          <BusbarSaveButton onClick={handleSave} loading={loading} />
        </div>
      </div>
    </div>
    </RoleGuard>
  );
} 