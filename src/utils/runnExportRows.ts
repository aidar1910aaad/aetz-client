import { runnTableConfig } from '@/components/FinalReview/tableConfigs';
import type { TableRow } from '@/components/FinalReview/UniversalTable';
import { useDguStore } from '@/store/useDguStore';
import {
  buildDguSnapshotFromStore,
  type DguSnapshot,
} from '@/utils/dguSnapshot';

/** RUNN + ДГУ для таблиц, PDF и Excel (единый dataMapper) */
export function mergeRunnWithDgu(
  runnStore: Record<string, unknown> | null | undefined,
  dgu?: Partial<DguSnapshot> | null
): Record<string, unknown> {
  const runn = runnStore || {};

  if ((runn as { dgu?: DguSnapshot }).dgu) {
    return runn;
  }

  if (dgu) {
    return { ...runn, dgu };
  }

  const live = useDguStore.getState();
  const hasLiveDgu =
    live.enabled ||
    (live.cellSummaries?.length ?? 0) > 0 ||
    !!live.busbarSummary ||
    (live.busBridgeSummaries?.length ?? 0) > 0;

  if (!hasLiveDgu) {
    return runn;
  }

  return { ...runn, dgu: buildDguSnapshotFromStore() };
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
