import type { DguBusbarSummary, DguCell, DguCellSummary, DguSettings } from '@/store/useDguStore';
import { useDguStore } from '@/store/useDguStore';
import type { TableRow } from '@/components/FinalReview/UniversalTable';

export interface DguSnapshot {
  enabled: boolean;
  settings: DguSettings;
  cells: DguCell[];
  cellSummaries: DguCellSummary[];
  busbarSummary: DguBusbarSummary | null;
  busBridgeSummaries: DguBusbarSummary[];
  total: number;
}

export function buildDguSnapshotFromStore(): DguSnapshot {
  const state = useDguStore.getState();
  return {
    enabled: state.enabled,
    settings: state.settings,
    cells: state.cells,
    cellSummaries: state.cellSummaries,
    busbarSummary: state.busbarSummary,
    busBridgeSummaries: state.busBridgeSummaries,
    total: calculateDguTotalFromSnapshot(state),
  };
}

export function calculateDguTotalFromSnapshot(
  dgu: Pick<
    DguSnapshot,
    'enabled' | 'cellSummaries' | 'busbarSummary' | 'busBridgeSummaries'
  > | null | undefined
): number {
  if (!dgu?.enabled) return 0;

  const cellsTotal = (dgu.cellSummaries || []).reduce(
    (sum, s) => sum + (s.totalPrice || 0),
    0
  );
  const busbarTotal = dgu.busbarSummary?.totalPrice || 0;
  const bridgesTotal = (dgu.busBridgeSummaries || []).reduce(
    (sum, b) => sum + (b.totalPrice || 0),
    0
  );

  return cellsTotal + busbarTotal + bridgesTotal;
}

/** Строки ДГУ для таблицы РУ-0.4кВ: заголовок без цены + позиции с расчётом */
export function mapDguRowsForRunnTable(
  dgu: Pick<
    DguSnapshot,
    'enabled' | 'settings' | 'cellSummaries' | 'busbarSummary' | 'busBridgeSummaries'
  > | null | undefined,
  startOrder = 0
): TableRow[] {
  if (!dgu?.enabled) return [];

  const cellItems = (dgu.cellSummaries || []).map((summary, index) => ({
    id: `dgu-cell-${summary.cellId}`,
    name: summary.name,
    unit: 'шт.',
    quantity: summary.quantity,
    price: summary.pricePerUnit,
    total: summary.totalPrice,
    order: startOrder + index + 2,
  }));

  const busBridgeSummaries = dgu.busBridgeSummaries || [];
  const busbarSummary = dgu.busbarSummary;
  let orderOffset = startOrder + cellItems.length + 2;

  const busBridgeItems = busBridgeSummaries.map((bbs, i) => ({
    id: `dgu-busbridge-${i}`,
    name: bbs.name,
    unit: 'шт.',
    quantity: bbs.quantity,
    price: bbs.pricePerUnit,
    total: bbs.totalPrice,
    order: orderOffset + i,
  }));

  orderOffset += busBridgeItems.length;

  const busbarItems = busbarSummary
    ? [
        {
          id: 'dgu-busbar',
          name: busbarSummary.name,
          unit: 'шт.',
          quantity: busbarSummary.quantity,
          price: busbarSummary.pricePerUnit,
          total: busbarSummary.totalPrice,
          order: orderOffset,
        },
      ]
    : [];

  const headerRow: TableRow = {
    id: 'dgu-header',
    name: 'ДГУ',
    isSectionHeader: true,
    order: startOrder + 1,
  };

  return [headerRow, ...cellItems, ...busBridgeItems, ...busbarItems];
}

export function applyDguSnapshot(snapshot: Partial<DguSnapshot> | null | undefined): void {
  if (!snapshot) return;

  const store = useDguStore.getState();

  if (snapshot.enabled !== undefined) {
    store.setEnabled(snapshot.enabled);
  }
  if (snapshot.settings) {
    store.setSettings(snapshot.settings);
  }
  if (snapshot.cells) {
    store.setCells(snapshot.cells);
  }
  if (snapshot.cellSummaries) {
    store.clearCellSummaries();
    snapshot.cellSummaries.forEach((s) => store.setCellSummary(s));
  }
  if (snapshot.busbarSummary !== undefined) {
    store.setBusbarSummary(snapshot.busbarSummary);
  }
  if (snapshot.busBridgeSummaries) {
    store.setBusBridgeSummaries(snapshot.busBridgeSummaries);
  }
}
