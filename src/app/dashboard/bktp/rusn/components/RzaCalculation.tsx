import { RusnCell as RusnCellType } from '@/store/useRusnStore';
import { RusnMaterials } from '@/utils/rusnMaterials';
import { calculateCost } from '@/utils/calculationUtils';
import MaterialsTable from './MaterialsTable';
import SelectedMaterialsTable from './SelectedMaterialsTable';
import CalculationDisplay from './CalculationDisplay';

interface RzaCalculationProps {
  cell: RusnCellType;
  materials: RusnMaterials;
  calculation: {
    data: {
      categories: Array<{
        name: string;
        items: Array<{
          name: string;
          unit: string;
          price: number;
          quantity: number;
        }>;
      }>;
      calculation: {
        manufacturingHours?: number;
        hourlyRate: number;
        overheadPercentage: number;
        adminPercentage: number;
        plannedProfitPercentage: number;
        ndsPercentage: number;
      };
    };
  };
}

export default function RzaCalculation({ cell, materials, calculation }: RzaCalculationProps) {
  // Рассчитываем общую стоимость материалов (без добавления выбранных материалов)
  const materialsTotal = calculation.data.categories.reduce(
    (sum, category) =>
      sum + category.items.reduce((itemSum, item) => itemSum + item.price * item.quantity, 0),
    0
  );

  // Рассчитываем стоимость выбранных материалов
  const selectedMaterialsTotal = cell.rza
    ? Number(materials.rza.find((m) => m.id.toString() === cell.rza?.id)?.price || 0)
    : 0;

  // Используем утилиту для расчета
  const calculationResult = calculateCost(
    materialsTotal,
    calculation.data.calculation,
    selectedMaterialsTotal
  );

  // Создаем компонент таблицы материалов
  const materialsTableComponent = (
    <>
      {calculation.data.categories.map((category, index) => (
        <MaterialsTable key={index} category={category} />
      ))}
      <SelectedMaterialsTable cell={cell} materials={materials} showRza={true} />
    </>
  );

  return (
    <CalculationDisplay
      title="Калькуляция РЗА"
      calculation={calculationResult}
      calculationData={calculation.data.calculation}
      showMaterialsTable={true}
      materialsTableComponent={materialsTableComponent}
      additionalMaterialsTotal={selectedMaterialsTotal}
    />
  );
}
