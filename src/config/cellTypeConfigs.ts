import { CalculationGroup } from '@/api/calculations';

// Конфигурация ячеек для разных типов камер
export interface CellTypeConfig {
  name: string;
  voltage: string;
  cellTypes: string[];
}

// Маппинг между API группами и типами ячеек
export const GROUP_TO_CELL_TYPES: Record<string, string[]> = {
  'Камера КСО А12-10': [
    'Ввод',
    'Секционный выключатель',
    'Секционный разьединитель',
    'Трансформаторная',
    'Отходящая',
    'Трансформатор напряжения',
    'Трансформатор собственных нужд',
  ],
  'Камера КСО 366': [
    'Ввод',
    'Трансформаторная',
    'Секционный разьединитель',
    'Отходящая',
  ],
  'Камера 8DJH': [
    'Камера Siemens 8DJH',
    'Кабельная перемычка',
    'Изоляционный адаптер'
  ],
  'Камера КМ1-АФ': [
    'Ввод',
    'Секционный выключатель',
    'Секционный разьединитель',
    'Трансформаторная',
    'Отходящая',
    'Трансформатор напряжения',
    'Трансформатор собственных нужд',
  ],
  'Камера КСО А17-20': [
    'Ввод',
    'Секционный выключатель',
    'Секционный разьединитель',
    'Трансформаторная',
    'Отходящая',
    'Трансформатор напряжения',
    'Трансформатор собственных нужд',
  ],
};

// Функция для получения типов ячеек по группе из API
export const getCellTypesForGroup = (groupName: string): string[] => {
  const cellTypes = GROUP_TO_CELL_TYPES[groupName] || GROUP_TO_CELL_TYPES['Камера КСО А12-10'];
  return cellTypes;
};

// Функция для получения типов ячеек по группе из API (с fallback)
export const getCellTypesForCamera = (cameraType: string): string[] => {
  return GROUP_TO_CELL_TYPES[cameraType] || GROUP_TO_CELL_TYPES['Камера КСО А12-10'];
};

// Функция для получения названия камеры по типу
export const getCameraName = (cameraType: string): string => {
  return cameraType || 'Камера КСО А12-10';
};
