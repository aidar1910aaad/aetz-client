import { CellType } from '@/types/calculation';
import { BHA_CELL_TYPES } from '@/domain/calculation/bhaPresets';

export const STANDARD_CELL_TYPES: CellType[] = [
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
  'input',
  'section_switch',
  'outgoing',
];

export const ALL_CELL_TYPES: CellType[] = [...STANDARD_CELL_TYPES, ...BHA_CELL_TYPES];

export function isValidCellType(type?: string): type is CellType {
  return ALL_CELL_TYPES.includes(type as CellType);
}

export function normalizeCellType(type?: string, fallback: CellType = '10kv'): CellType {
  return isValidCellType(type) ? type : fallback;
}

export const CELL_TYPE_LABELS: Record<string, string> = {
  '0.4kv': '0.4 кВ',
  '10kv': '10 кВ',
  '20kv': '20 кВ',
  rza: 'РЗА',
  pu: 'ПУ',
  disconnector: 'Разъединитель',
  busbar: 'Сборные шины',
  busbridge: 'Шинный мост',
  switch: 'Выключатель',
  tn: 'Трансформатор напряжения',
  tsn: 'ТСН',
  input: 'Ввод',
  section_switch: 'Секционный выключатель',
  outgoing: 'Отходящая',
  bha_input: 'BHA — Вводная',
  bha_transformer: 'BHA — Трансформаторная',
  bha_outgoing: 'BHA — Отходящая',
};

export function getCellTypeLabel(type?: string): string {
  if (!type) return '';
  return CELL_TYPE_LABELS[type] || type;
}
