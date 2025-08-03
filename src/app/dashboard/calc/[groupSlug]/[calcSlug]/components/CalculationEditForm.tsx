import { useState, useEffect } from 'react';
import { CalculationSummary } from './CalculationSummary';
import { Material as ApiMaterial, getAllMaterials } from '@/api/material';
import CellConfig from '@/components/calculation/CellConfig';
import CalculationCategoriesEditor from './CalculationCategoriesEditor';
import CalculationEditActions from './CalculationEditActions';
import { CellConfiguration, CellType } from '@/types/calculation';

interface CalculationMaterial {
  id: number;
  name: string;
  unit: string;
  price: number;
  quantity: number;
}

interface CalculationCategory {
  name: string;
  items: CalculationMaterial[];
}

interface CalculationData {
  categories: CalculationCategory[];
  calculation: {
    manufacturingHours: number;
    hourlyRate: number;
    overheadPercentage: number;
    adminPercentage: number;
    plannedProfitPercentage: number;
    ndsPercentage: number;
  };
  cellConfig?: CellConfiguration;
}

interface Calculation {
  id: number;
  name: string;
  slug: string;
  data: CalculationData;
}

interface CalculationEditFormProps {
  calculation: Calculation;
  onSave: (updatedCalculation: Calculation) => void;
  onCancel: () => void;
}

export function CalculationEditForm({ calculation, onSave, onCancel }: CalculationEditFormProps) {
  const [name, setName] = useState(calculation.name);
  const [categories, setCategories] = useState<CalculationCategory[]>(calculation.data.categories);
  const [cellConfig, setCellConfig] = useState<CellConfiguration | undefined>(
    calculation.data.cellConfig
  );
  const [calculationValues, setCalculationValues] = useState(calculation.data.calculation);
  const [materials, setMaterials] = useState<ApiMaterial[]>([]);

  // Validate cell type
  const validCellTypes: CellType[] = [
    '0.4kv',
    '10kv',
    '20kv',
    'rza',
    'pu',
    'disconnector',
    'busbar',
    'busbridge',
    'switch',
    'tn',
    'tsn',
  ];
  const getValidCellType = (type: string | undefined): CellType => {
    return validCellTypes.includes(type as CellType) ? (type as CellType) : '10kv';
  };

  useEffect(() => {
    const loadMaterials = async () => {
      try {
        const token = localStorage.getItem('token') || '';
        const data = await getAllMaterials(token);
        setMaterials(data);
      } catch (error) {
        console.error('Error loading materials:', error);
      }
    };
    loadMaterials();
  }, []);

  const calculateTotalMaterialsCost = () => {
    return categories.reduce((total, category) => {
      return (
        total +
        category.items.reduce((categoryTotal, item) => {
          return categoryTotal + item.price * item.quantity;
        }, 0)
      );
    }, 0);
  };

  const handleSave = () => {
    const updatedCalculation: Calculation = {
      ...calculation,
      name,
      data: {
        ...calculation.data,
        categories,
        cellConfig,
        calculation: calculationValues,
      },
    };
    onSave(updatedCalculation);
  };

  const handleCellConfigChange = (newConfig: CellConfiguration) => {
    setCellConfig(newConfig);
  };

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Название калькуляции
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#3A55DF] focus:border-[#3A55DF]"
          />
        </div>
      </div>

      {/* Конфигурация ячейки */}
      <CellConfig
        cellType={getValidCellType(cellConfig?.type)}
        configuration={
          cellConfig || {
            type: '10kv',
            materials: {
              switch: [],
              rza: [],
              counter: [],
              sr: [],
              tsn: [],
              tn: [],
              tt: [],
              pu: [],
              disconnector: [],
              busbar: [],
              busbridge: [],
            },
          }
        }
        onConfigurationChange={handleCellConfigChange}
      />

      {/* Категории и материалы */}
      <CalculationCategoriesEditor
        categories={categories}
        setCategories={setCategories}
        materials={materials}
      />

      <CalculationSummary
        totalMaterialsCost={calculateTotalMaterialsCost()}
        onValuesChange={(values) => {
          setCalculationValues(values);
        }}
        initialValues={calculationValues}
      />

      <CalculationEditActions onCancel={onCancel} onSave={handleSave} />
    </div>
  );
}
