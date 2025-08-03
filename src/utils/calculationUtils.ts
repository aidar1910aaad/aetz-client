export interface CalculationData {
  hourlyRate: number;
  manufacturingHours?: number;
  overheadPercentage: number;
  adminPercentage: number;
  plannedProfitPercentage: number;
  ndsPercentage: number;
}

export interface CalculationResult {
  materialsTotal: number;
  salary: number;
  overheadCost: number;
  productionCost: number;
  adminCost: number;
  fullCost: number;
  plannedProfit: number;
  wholesalePrice: number;
  ndsAmount: number;
  finalPrice: number;
}

// Расчет стоимости на основе материалов и параметров
export const calculateCost = (
  materialsTotal: number,
  calculationData: CalculationData,
  additionalMaterialsTotal: number = 0
): CalculationResult => {
  const totalMaterials = materialsTotal + additionalMaterialsTotal;
  const salary = calculationData.hourlyRate * (calculationData.manufacturingHours || 4);
  const overheadCost = (totalMaterials * calculationData.overheadPercentage) / 100;
  const productionCost = totalMaterials + salary + overheadCost;
  const adminCost = (totalMaterials * calculationData.adminPercentage) / 100;
  const fullCost = productionCost + adminCost;
  const plannedProfit = (fullCost * calculationData.plannedProfitPercentage) / 100;
  const wholesalePrice = fullCost + plannedProfit;
  const ndsAmount = (wholesalePrice * calculationData.ndsPercentage) / 100;
  const finalPrice = wholesalePrice + ndsAmount;

  return {
    materialsTotal: totalMaterials,
    salary,
    overheadCost,
    productionCost,
    adminCost,
    fullCost,
    plannedProfit,
    wholesalePrice,
    ndsAmount,
    finalPrice,
  };
};

// Форматирование валюты
export const formatCurrency = (amount: number, decimals: number = 2): string => {
  return amount.toLocaleString('ru-RU', { maximumFractionDigits: decimals });
};

// Получение названия этапа расчета
export const getCalculationStepName = (step: keyof CalculationResult): string => {
  const names: Record<keyof CalculationResult, string> = {
    materialsTotal: 'Итого по материалам',
    salary: 'Зарплата на изделие',
    overheadCost: 'Общепроизводственные расходы',
    productionCost: 'Производственная себестоимость',
    adminCost: 'Административные расходы',
    fullCost: 'Полная себестоимость',
    plannedProfit: 'Плановые накопления',
    wholesalePrice: 'Оптовая цена',
    ndsAmount: 'НДС',
    finalPrice: 'Отпускная расчетная цена',
  };
  return names[step];
};

// Получение описания этапа расчета
export const getCalculationStepDescription = (
  step: keyof CalculationResult,
  calculationData: CalculationData
): string => {
  const descriptions: Record<keyof CalculationResult, string> = {
    materialsTotal: '',
    salary: '',
    overheadCost: `(Итого по материалам × ${calculationData.overheadPercentage}%)`,
    productionCost: '(Итого по материалам + Зарплата + Общепроизводственные расходы)',
    adminCost: `(Итого по материалам × ${calculationData.adminPercentage}%)`,
    fullCost: '(Производственная себестоимость + Административные расходы)',
    plannedProfit: `(Полная себестоимость × ${calculationData.plannedProfitPercentage}%)`,
    wholesalePrice: '(Полная себестоимость + Плановые накопления)',
    ndsAmount: `(Оптовая цена × ${calculationData.ndsPercentage}%)`,
    finalPrice: '(Оптовая цена + НДС)',
  };
  return descriptions[step];
};
