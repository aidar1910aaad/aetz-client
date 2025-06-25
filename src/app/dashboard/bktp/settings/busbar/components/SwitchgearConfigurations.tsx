import { useState, useEffect } from 'react';
import { Switchgear, CreateSwitchgearDto, switchgearApi } from '@/api/switchgear';
import { Plus } from 'lucide-react';
import { TableRow } from './BusbarTable';
import { SwitchgearTable } from './SwitchgearTable';
import { SwitchgearModal } from './SwitchgearModal';
import { SwitchgearFilters } from './SwitchgearFilters';

interface SwitchgearConfigurationsProps {
  tableData: TableRow[];
  onTableDataChange: (data: TableRow[]) => void;
}

export function SwitchgearConfigurations({
  tableData,
  onTableDataChange,
}: SwitchgearConfigurationsProps) {
  const [configurations, setConfigurations] = useState<Switchgear[]>([]);
  const [filteredConfigurations, setFilteredConfigurations] = useState<Switchgear[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState<Switchgear | null>(null);
  const [filters, setFilters] = useState({
    type: '',
    amperage: '',
    group: '',
  });

  useEffect(() => {
    fetchConfigurations();
  }, []);

  useEffect(() => {
    filterConfigurations();
  }, [configurations, filters]);

  const fetchConfigurations = async () => {
    try {
      const data = await switchgearApi.getAll({
        type: filters.type || undefined,
        amperage: filters.amperage ? parseInt(filters.amperage) : undefined,
        group: filters.group || undefined,
      });
      setConfigurations(data);
    } catch (error) {
      console.error('Error fetching configurations:', error);
    }
  };

  const filterConfigurations = () => {
    let filtered = [...configurations];
    if (filters.type) {
      filtered = filtered.filter((config) => config.type === filters.type);
    }
    if (filters.amperage) {
      filtered = filtered.filter((config) => config.amperage.toString() === filters.amperage);
    }
    if (filters.group) {
      filtered = filtered.filter((config) => config.group === filters.group);
    }
    setFilteredConfigurations(filtered);
  };

  const handleConfigSelect = (config: Switchgear) => {
    const newTableData = tableData.map((row) => {
      const configData = config.cells.find(() => {
        const amperageKey = Object.keys(row.amperages).find(
          (key) => parseInt(key) === config.amperage
        );
        return amperageKey !== undefined;
      });

      if (configData) {
        const amperageKey = Object.keys(row.amperages).find(
          (key) => parseInt(key) === config.amperage
        );
        if (amperageKey) {
          return {
            ...row,
            type: config.type,
            breaker: config.breaker,
            group: config.group,
            busbar: config.busbar,
            amperages: {
              ...row.amperages,
              [amperageKey]: {
                ...row.amperages[amperageKey],
                consumption: configData.name === 'Ввод' ? configData.quantity : 0,
                sv: configData.name === 'СВ' ? configData.quantity : 0,
                output: configData.name === 'ОТХ' ? configData.quantity : 0,
              },
            },
          };
        }
      }
      return row;
    });
    onTableDataChange(newTableData);
  };

  const handleOpenModal = (config?: Switchgear) => {
    setEditingConfig(config || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingConfig(null);
  };

  const handleSubmit = async (data: CreateSwitchgearDto) => {
    try {
      if (editingConfig) {
        await switchgearApi.update(editingConfig.id, data);
      } else {
        await switchgearApi.create(data);
      }
      await fetchConfigurations();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving configuration:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Вы уверены, что хотите удалить эту конфигурацию?')) {
      return;
    }

    try {
      await switchgearApi.delete(id);
      await fetchConfigurations();
    } catch (error) {
      console.error('Error deleting configuration:', error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Конфигурации ячеек РУ</h2>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Создать
        </button>
      </div>

      <SwitchgearFilters
        configurations={configurations}
        filters={filters}
        onFilterChange={setFilters}
      />

      <SwitchgearTable
        configurations={filteredConfigurations}
        onEdit={handleOpenModal}
        onDelete={handleDelete}
        onSelect={handleConfigSelect}
      />

      <SwitchgearModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        editingConfig={editingConfig}
      />
    </div>
  );
}
