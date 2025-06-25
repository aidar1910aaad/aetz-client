'use client';

import { useState, useEffect } from 'react';

interface CalculationSummaryProps {
  totalMaterialsCost: number;
  onValuesChange: (values: {
    manufacturingHours: number;
    hourlyRate: number;
    overheadPercentage: number;
    adminPercentage: number;
    plannedProfitPercentage: number;
    ndsPercentage: number;
  }) => void;
  isReadOnly?: boolean;
  initialValues?: {
    manufacturingHours: number;
    hourlyRate: number;
    overheadPercentage: number;
    adminPercentage: number;
    plannedProfitPercentage: number;
    ndsPercentage: number;
  };
}

export function CalculationSummary({ 
  totalMaterialsCost, 
  onValuesChange,
  isReadOnly = false,
  initialValues
}: CalculationSummaryProps) {
  const [manufacturingHours, setManufacturingHours] = useState<number>(initialValues?.manufacturingHours || 1);
  const [hourlyRate, setHourlyRate] = useState<number>(initialValues?.hourlyRate || 2000);
  const [overheadPercentage, setOverheadPercentage] = useState<number>(initialValues?.overheadPercentage || 10);
  const [adminPercentage, setAdminPercentage] = useState<number>(initialValues?.adminPercentage || 15);
  const [plannedProfitPercentage, setPlannedProfitPercentage] = useState<number>(initialValues?.plannedProfitPercentage || 10);
  const [ndsPercentage, setNdsPercentage] = useState<number>(initialValues?.ndsPercentage || 12);

  useEffect(() => {
    onValuesChange({
      manufacturingHours,
      hourlyRate,
      overheadPercentage,
      adminPercentage,
      plannedProfitPercentage,
      ndsPercentage
    });
  }, [manufacturingHours, hourlyRate, overheadPercentage, adminPercentage, plannedProfitPercentage, ndsPercentage]);

  // Расчеты
  const totalSalary = manufacturingHours * hourlyRate;
  const overheadCost = (totalMaterialsCost * overheadPercentage) / 100;
  const productionCost = totalMaterialsCost + totalSalary + overheadCost;
  const adminCost = (totalMaterialsCost * adminPercentage) / 100;
  const fullCost = productionCost + adminCost;
  const plannedProfit = (fullCost * plannedProfitPercentage) / 100;
  const wholesalePrice = fullCost + plannedProfit;
  const ndsAmount = (wholesalePrice * ndsPercentage) / 100;
  const finalPrice = wholesalePrice + ndsAmount;

  const renderInput = (label: string, value: number, onChange: (value: number) => void, suffix?: string) => {
    if (isReadOnly) {
      return (
        <div className="flex items-center">
          <span className="text-gray-700">{value}</span>
          {suffix && <span className="ml-1 text-gray-500">{suffix}</span>}
        </div>
      );
    }

    return (
      <div className="flex items-center">
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-20 px-2 py-1 border border-gray-300 rounded text-right focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
        />
        {suffix && <span className="ml-1 text-gray-500">{suffix}</span>}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">Расчет стоимости</h3>
      
      {/* Итого по материалам */}
      <div className="flex justify-between items-center py-2 border-b">
        <span className="text-gray-700">Итого по материалам:</span>
        <span className="font-medium">{totalMaterialsCost.toLocaleString()} ₸</span>
      </div>

      {/* Изготовление */}
      <div className="space-y-4">
        <h4 className="font-medium text-gray-900">Изготовление</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            {renderInput('Количество часов', manufacturingHours, setManufacturingHours)}
          </div>
          <div>
            {renderInput('Часовая ставка (₸)', hourlyRate, setHourlyRate)}
          </div>
        </div>
        <div className="flex justify-between items-center py-2 border-b">
          <span className="text-gray-700">Зарплата на изделие:</span>
          <span className="font-medium">{totalSalary.toLocaleString()} ₸</span>
        </div>
      </div>

      {/* Общепроизводственные расходы */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-gray-700">Общепроизводственные расходы:</span>
          {renderInput('Общепроизводственные расходы:', overheadPercentage, setOverheadPercentage, '%')}
        </div>
        <div className="flex justify-between items-center py-2 border-b">
          <span className="text-gray-700">Сумма:</span>
          <span className="font-medium">{overheadCost.toLocaleString()} ₸</span>
        </div>
      </div>

      <div className="flex justify-between items-center py-2 border-b">
        <span className="text-gray-700">Производственная себестоимость:</span>
        <span className="font-medium">{productionCost.toLocaleString()} ₸</span>
      </div>

      {/* Административные расходы */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-gray-700">Административные расходы:</span>
          {renderInput('Административные расходы:', adminPercentage, setAdminPercentage, '%')}
        </div>
        <div className="flex justify-between items-center py-2 border-b">
          <span className="text-gray-700">Сумма:</span>
          <span className="font-medium">{adminCost.toLocaleString()} ₸</span>
        </div>
      </div>

      {/* Полная себестоимость */}
      <div className="flex justify-between items-center py-2 border-b">
        <span className="text-gray-700">Полная себестоимость:</span>
        <span className="font-medium">{fullCost.toLocaleString()} ₸</span>
      </div>

      {/* Плановые накопления */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-gray-700">Плановые накопления:</span>
          {renderInput('Плановые накопления:', plannedProfitPercentage, setPlannedProfitPercentage, '%')}
        </div>
        <div className="flex justify-between items-center py-2 border-b">
          <span className="text-gray-700">Сумма:</span>
          <span className="font-medium">{plannedProfit.toLocaleString()} ₸</span>
        </div>
      </div>

      {/* Оптовая цена */}
      <div className="flex justify-between items-center py-2 border-b">
        <span className="text-gray-700">Оптовая цена:</span>
        <span className="font-medium">{wholesalePrice.toLocaleString()} ₸</span>
      </div>

      {/* НДС */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-gray-700">НДС:</span>
          {renderInput('НДС:', ndsPercentage, setNdsPercentage, '%')}
        </div>
        <div className="flex justify-between items-center py-2 border-b">
          <span className="text-gray-700">Сумма:</span>
          <span className="font-medium">{ndsAmount.toLocaleString()} ₸</span>
        </div>
      </div>

      {/* Итоговая цена */}
      <div className="flex justify-between items-center py-2 bg-gray-50 -mx-6 -mb-6 px-6 py-4 rounded-b-lg">
        <span className="text-lg font-semibold text-gray-900">Отпускная расчетная цена:</span>
        <span className="text-lg font-bold text-[#3A55DF]">{finalPrice.toLocaleString()} ₸</span>
      </div>
    </div>
  );
} 