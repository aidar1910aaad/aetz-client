import { Material } from '@/api/material';
import { RusnCell as RusnCellType } from '@/store/useRusnStore';
import MaterialsTable from './MaterialsTable';

interface RzaCalculationProps {
  cell: RusnCellType;
  materials: {
    rza: Material[];
  };
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
  if (!cell.rza) return null;

  const rzaMaterialsTotal =
    calculation.data.categories.reduce(
      (sum, category) =>
        sum + category.items.reduce((itemSum, item) => itemSum + item.price * item.quantity, 0),
      0
    ) + Number(materials.rza.find((m) => m.id.toString() === cell.rza?.id)?.price || 0);

  const calculationData = calculation.data.calculation;
  const salary = calculationData.hourlyRate * 4;
  const overheadCost = (rzaMaterialsTotal * calculationData.overheadPercentage) / 100;
  const productionCost = rzaMaterialsTotal + salary + overheadCost;
  const adminCost = (rzaMaterialsTotal * calculationData.adminPercentage) / 100;
  const fullCost = productionCost + adminCost;
  const plannedProfit = (fullCost * calculationData.plannedProfitPercentage) / 100;
  const wholesalePrice = fullCost + plannedProfit;
  const ndsAmount = (wholesalePrice * calculationData.ndsPercentage) / 100;
  const finalPrice = wholesalePrice + ndsAmount;

  return (
    <div className="px-6 py-4 border-b border-gray-200">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Калькуляция РЗА</h3>
      <div className="space-y-4">
        {/* Категории материалов РЗА */}
        {calculation.data.categories.map((category, index) => (
          <MaterialsTable
            key={index}
            category={category}
            cell={cell}
            materials={materials}
            showRza={true}
          />
        ))}

        {/* Расчет стоимости РЗА */}
        <div className="mt-8 space-y-6">
          <div className="flex justify-between items-center">
            <span className="text-lg font-medium">Итого по материалам РЗА:</span>
            <span className="text-lg font-medium">
              {rzaMaterialsTotal.toLocaleString('ru-RU', { maximumFractionDigits: 2 })} ₸
            </span>
          </div>

          {/* Изготовление РЗА */}
          <div className="space-y-2">
            <div className="text-lg font-medium">Изготовление</div>
            <div className="flex justify-between items-center">
              <span>Зарплата на изделие:</span>
              <span>{salary.toLocaleString('ru-RU')} ₸</span>
            </div>
          </div>

          {/* Общепроизводственные расходы РЗА */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span>Общепроизводственные расходы:</span>
              <span>{calculationData.overheadPercentage}%</span>
            </div>
            <div className="flex justify-between items-center text-sm text-gray-600">
              <span>Сумма: (Итого по материалам × {calculationData.overheadPercentage}%)</span>
              <span>{overheadCost.toLocaleString('ru-RU', { maximumFractionDigits: 3 })} ₸</span>
            </div>
          </div>

          {/* Производственная себестоимость РЗА */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-lg font-medium">Производственная себестоимость:</span>
              <span className="text-lg font-medium">
                {productionCost.toLocaleString('ru-RU', { maximumFractionDigits: 3 })} ₸
              </span>
            </div>
            <div className="text-sm text-gray-600">
              (Итого по материалам + Зарплата + Общепроизводственные расходы)
            </div>
          </div>

          {/* Административные расходы РЗА */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span>Административные расходы:</span>
              <span>{calculationData.adminPercentage}%</span>
            </div>
            <div className="flex justify-between items-center text-sm text-gray-600">
              <span>Сумма: (Итого по материалам × {calculationData.adminPercentage}%)</span>
              <span>{adminCost.toLocaleString('ru-RU', { maximumFractionDigits: 3 })} ₸</span>
            </div>
          </div>

          {/* Полная себестоимость РЗА */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-lg font-medium">Полная себестоимость:</span>
              <span className="text-lg font-medium">
                {fullCost.toLocaleString('ru-RU', { maximumFractionDigits: 2 })} ₸
              </span>
            </div>
            <div className="text-sm text-gray-600">
              (Производственная себестоимость + Административные расходы)
            </div>
          </div>

          {/* Плановые накопления РЗА */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span>Плановые накопления:</span>
              <span>{calculationData.plannedProfitPercentage}%</span>
            </div>
            <div className="flex justify-between items-center text-sm text-gray-600">
              <span>
                Сумма: (Полная себестоимость × {calculationData.plannedProfitPercentage}%)
              </span>
              <span>{plannedProfit.toLocaleString('ru-RU', { maximumFractionDigits: 3 })} ₸</span>
            </div>
          </div>

          {/* Оптовая цена РЗА */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-lg font-medium">Оптовая цена:</span>
              <span className="text-lg font-medium">
                {wholesalePrice.toLocaleString('ru-RU', { maximumFractionDigits: 3 })} ₸
              </span>
            </div>
            <div className="text-sm text-gray-600">
              (Полная себестоимость + Плановые накопления)
            </div>
          </div>

          {/* НДС РЗА */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span>НДС:</span>
              <span>{calculationData.ndsPercentage}%</span>
            </div>
            <div className="flex justify-between items-center text-sm text-gray-600">
              <span>Сумма: (Оптовая цена × {calculationData.ndsPercentage}%)</span>
              <span>{ndsAmount.toLocaleString('ru-RU', { maximumFractionDigits: 3 })} ₸</span>
            </div>
          </div>

          {/* Отпускная расчетная цена РЗА */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-lg font-medium">Отпускная расчетная цена РЗА:</span>
              <span className="text-lg font-medium">
                {finalPrice.toLocaleString('ru-RU', { maximumFractionDigits: 3 })} ₸
              </span>
            </div>
            <div className="text-sm text-gray-600">(Оптовая цена + НДС)</div>
          </div>
        </div>
      </div>
    </div>
  );
}
