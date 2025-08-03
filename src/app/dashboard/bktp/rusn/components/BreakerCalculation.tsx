import { RusnCell as RusnCellType } from '@/store/useRusnStore';
import { RusnMaterials, getMaterialById } from '@/utils/rusnMaterials';
import { calculateCost } from '@/utils/calculationUtils';
import MaterialsTable from './MaterialsTable';
import SelectedMaterialsTable from './SelectedMaterialsTable';
import CalculationDisplay from './CalculationDisplay';

interface BreakerCalculationProps {
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
      cellConfig?: {
        type?: string;
      };
    };
  };
}

export default function BreakerCalculation({
  cell,
  materials,
  calculation,
}: BreakerCalculationProps) {
  // Рассчитываем общую стоимость материалов (без добавления выбранных материалов)
  const materialsTotal = calculation.data.categories.reduce(
    (sum, category) =>
      sum + category.items.reduce((itemSum, item) => itemSum + item.price * item.quantity, 0),
    0
  );

  // Определяем тип ячейки на основе выбранных материалов
  // Проверяем, какая калькуляция используется для определения типа
  const isPuCell =
    calculation.data.cellConfig?.type === 'pu' ||
    (cell.meterType && !cell.breaker && !cell.transformerPower && !cell.transformerVoltage);
  const isDisconnectorCell =
    cell.purpose === 'Секционный разьединитель' ||
    calculation.data.cellConfig?.type === 'disconnector';
  const isTsnCell =
    calculation.data.cellConfig?.type === 'tsn' ||
    (cell.transformerPower && !cell.breaker && !cell.meterType);
  const isTnCell =
    calculation.data.cellConfig?.type === 'tn' ||
    (cell.transformerVoltage && !cell.breaker && !cell.meterType);

  // Логи для отладки
  console.log('=== BREAKER CALCULATION DEBUG ===');
  console.log('Cell purpose:', cell.purpose);
  console.log('Cell materials:', {
    breaker: !!cell.breaker,
    meterType: !!cell.meterType,
    transformerPower: !!cell.transformerPower,
    transformerVoltage: !!cell.transformerVoltage,
  });
  console.log('Calculation cellConfig type:', calculation.data.cellConfig?.type);
  console.log('Cell type determination:', {
    isPuCell,
    isDisconnectorCell,
    isTsnCell,
    isTnCell,
  });
  console.log('================================');

  // Рассчитываем стоимость выбранных материалов в зависимости от типа ячейки
  let selectedMaterialsTotal = 0;

  if (isPuCell) {
    // Для ПУ показываем только выбранный ПУ
    const puMaterialTotal = cell.meterType
      ? Number(materials.meter.find((m) => m.id.toString() === cell.meterType?.id)?.price || 0)
      : 0;
    selectedMaterialsTotal = puMaterialTotal;
  } else if (isDisconnectorCell) {
    // Для разъединителя показываем только разъединитель
    const disconnectorMaterialTotal = cell.breaker
      ? Number(materials.sr.find((m) => m.id.toString() === cell.breaker?.id)?.price || 0)
      : 0;
    selectedMaterialsTotal = disconnectorMaterialTotal;
  } else if (isTsnCell) {
    // Для ТСН показываем только ТСН
    const tsnMaterialTotal = cell.transformerPower
      ? Number(materials.tsn.find((m) => m.id.toString() === cell.transformerPower?.id)?.price || 0)
      : 0;
    selectedMaterialsTotal = tsnMaterialTotal;
  } else if (isTnCell) {
    // Для ТН показываем только ТН
    const tnMaterialTotal = cell.transformerVoltage
      ? Number(
          materials.tn.find((m) => m.id.toString() === cell.transformerVoltage?.id)?.price || 0
        )
      : 0;
    selectedMaterialsTotal = tnMaterialTotal;
  } else {
    // Для выключателя показываем выключатель и трансформатор тока
    const breakerMaterialTotal = cell.breaker
      ? Number(materials.breaker.find((m) => m.id.toString() === cell.breaker?.id)?.price || 0)
      : 0;

    const transformerCurrentTotal = cell.transformerCurrent
      ? Number(getMaterialById(materials, 'tt', cell.transformerCurrent.id)?.price || 0) * 3
      : 0;

    selectedMaterialsTotal = breakerMaterialTotal + transformerCurrentTotal;
  }

  // Используем утилиту для расчета
  const calculationResult = calculateCost(
    materialsTotal,
    calculation.data.calculation,
    selectedMaterialsTotal
  );

  // Определяем заголовок в зависимости от типа ячейки
  let title = 'Калькуляция выключателя';
  if (isPuCell) title = 'Калькуляция ПУ';
  else if (isDisconnectorCell) title = 'Калькуляция разъединителя';
  else if (isTsnCell) title = 'Калькуляция ТСН';
  else if (isTnCell) title = 'Калькуляция ТН';

  // Создаем компонент таблицы материалов
  const materialsTableComponent = (
    <>
      {calculation.data.categories.map((category, index) => (
        <MaterialsTable key={index} category={category} />
      ))}
      <SelectedMaterialsTable
        cell={cell}
        materials={materials}
        showBreaker={!isPuCell && !isDisconnectorCell && !isTsnCell && !isTnCell}
        showRza={false}
        showTransformerCurrent={!isPuCell && !isDisconnectorCell && !isTsnCell && !isTnCell}
        showPu={isPuCell}
        showDisconnector={isDisconnectorCell}
        showTsn={isTsnCell}
        showTn={isTnCell}
      />
    </>
  );

  return (
    <CalculationDisplay
      title={title}
      calculation={calculationResult}
      calculationData={calculation.data.calculation}
      showMaterialsTable={true}
      materialsTableComponent={materialsTableComponent}
      additionalMaterialsTotal={selectedMaterialsTotal}
    />
  );
}
