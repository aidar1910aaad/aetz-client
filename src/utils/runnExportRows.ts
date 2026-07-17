import { runnTableConfig } from '@/components/FinalReview/tableConfigs';
import type { TableRow } from '@/components/FinalReview/UniversalTable';
import { useDguStore } from '@/store/useDguStore';
import {
  buildDguSnapshotFromStore,
  hasDguSnapshotData,
  resolveDguSnapshot,
  type DguSnapshot,
} from '@/utils/dguSnapshot';

/** RUNN + ДГУ для таблиц, PDF и Excel (единый dataMapper) */
export function mergeRunnWithDgu(
  runnStore: Record<string, unknown> | null | undefined,
  dgu?: Partial<DguSnapshot> | null
): Record<string, unknown> {
  const runn = runnStore || {};
  const nestedDgu = (runn as { dgu?: DguSnapshot }).dgu;

  const live = useDguStore.getState();
  const liveSnapshot = {
    enabled: live.enabled,
    settings: live.settings,
    cellSummaries: live.cellSummaries,
    busbarSummary: live.busbarSummary,
    busBridgeSummaries: live.busBridgeSummaries,
  };

  const explicit =
    dgu &&
    ({
      enabled: dgu.enabled ?? false,
      settings: dgu.settings ?? live.settings,
      cellSummaries: dgu.cellSummaries ?? [],
      busbarSummary: dgu.busbarSummary ?? null,
      busBridgeSummaries: dgu.busBridgeSummaries ?? [],
    } as DguSnapshot);

  const resolved = resolveDguSnapshot(
    explicit ?? nestedDgu,
    hasDguSnapshotData(liveSnapshot) || live.enabled ? liveSnapshot : null
  );

  if (!resolved || (!hasDguSnapshotData(resolved) && !resolved.enabled)) {
    const { dgu: _omit, ...rest } = runn as { dgu?: unknown };
    return rest;
  }

  return {
    ...runn,
    dgu: {
      ...resolved,
      cells: (explicit as DguSnapshot | undefined)?.cells ?? nestedDgu?.cells ?? live.cells ?? [],
      total:
        (explicit as DguSnapshot | undefined)?.total ??
        nestedDgu?.total ??
        buildDguSnapshotFromStore().total,
    },
  };
}

export function getRunnTableRows(
  runnStore: Record<string, unknown> | null | undefined,
  dgu?: Partial<DguSnapshot> | null
): TableRow[] {
  return runnTableConfig.dataMapper(mergeRunnWithDgu(runnStore, dgu));
}

export function countRunnDataRows(rows: TableRow[]): number {
  return rows.filter((row) => !row.isSectionHeader).length;
}
