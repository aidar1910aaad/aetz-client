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

type DguContentSource = Pick<
  DguSnapshot,
  'enabled' | 'settings' | 'cellSummaries' | 'busbarSummary' | 'busBridgeSummaries'
> | null | undefined;

/** Есть ли что показать в спецификации по ДГУ */
export function hasDguSnapshotData(dgu: DguContentSource): boolean {
  if (!dgu?.enabled) return false;

  const settingsPrice = Number(dgu.settings?.price) || 0;
  return (
    (dgu.cellSummaries?.length ?? 0) > 0 ||
    !!dgu.busbarSummary ||
    (dgu.busBridgeSummaries?.length ?? 0) > 0 ||
    settingsPrice > 0
  );
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

export function calculateDguTotalFromSnapshot(dgu: DguContentSource): number {
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
  const generatorTotal = Number(dgu.settings?.price) || 0;

  return cellsTotal + busbarTotal + bridgesTotal + generatorTotal;
}

/** Строки ДГУ для таблицы РУ-0.4кВ: заголовок + ячейки + шины/мосты + генератор */
export function mapDguRowsForRunnTable(
  dgu: DguContentSource,
  startOrder = 0
): TableRow[] {
  if (!hasDguSnapshotData(dgu)) return [];

  const cellItems = (dgu!.cellSummaries || []).map((summary, index) => ({
    id: `dgu-cell-${summary.cellId}`,
    name: summary.name,
    unit: 'шт.',
    quantity: summary.quantity,
    price: summary.pricePerUnit,
    total: summary.totalPrice,
    order: startOrder + index + 2,
  }));

  const busBridgeSummaries = dgu!.busBridgeSummaries || [];
  const busbarSummary = dgu!.busbarSummary;
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

  orderOffset += busbarItems.length;

  const settingsPrice = Number(dgu!.settings?.price) || 0;
  const generatorItems =
    settingsPrice > 0
      ? [
          {
            id: 'dgu-generator',
            name: `ДГУ (${dgu!.settings?.nominalPowerKva || 0} кВА)`,
            unit: 'шт.',
            quantity: 1,
            price: settingsPrice,
            total: settingsPrice,
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

  return [headerRow, ...cellItems, ...busBridgeItems, ...busbarItems, ...generatorItems];
}

/** Выбирает снимок ДГУ с реальными данными (live стор важнее пустого вложенного) */
export function resolveDguSnapshot(
  fromRunn: DguContentSource,
  live?: DguContentSource
): DguContentSource {
  const liveSource =
    live ??
    (() => {
      const state = useDguStore.getState();
      return {
        enabled: state.enabled,
        settings: state.settings,
        cellSummaries: state.cellSummaries,
        busbarSummary: state.busbarSummary,
        busBridgeSummaries: state.busBridgeSummaries,
      };
    })();

  if (hasDguSnapshotData(fromRunn)) return fromRunn;
  if (hasDguSnapshotData(liveSource)) return liveSource;
  if (fromRunn?.enabled) return fromRunn;
  return liveSource;
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
