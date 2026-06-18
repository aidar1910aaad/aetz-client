import {
  DGU_CELL_PURPOSE,
  RUNN_CELL_PURPOSE,
  isOutgoingPurpose,
} from './runnConstants';

type BusbarCell = { purpose: string; quantity?: number };

export function countBusbarCellsForConfig(
  configCellName: string,
  cells: BusbarCell[]
): number {
  switch (configCellName) {
    case 'Ввод':
      return cells
        .filter(
          (c) =>
            c.purpose === RUNN_CELL_PURPOSE.INPUT ||
            c.purpose === DGU_CELL_PURPOSE.INPUT
        )
        .reduce((total, cell) => total + (cell.quantity || 1), 0);
    case 'СВ':
      return cells
        .filter((c) => c.purpose === RUNN_CELL_PURPOSE.SECTION_SWITCH)
        .reduce((total, cell) => total + (cell.quantity || 1), 0);
    case 'ОТХ':
      return cells
        .filter((c) => isOutgoingPurpose(c.purpose))
        .reduce((total, cell) => total + (cell.quantity || 1), 0);
    case 'УСТ':
      return 0;
    default:
      return cells
        .filter((c) => c.purpose === configCellName)
        .reduce((total, cell) => total + (cell.quantity || 1), 0);
  }
}
