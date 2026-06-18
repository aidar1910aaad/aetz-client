import { useEffect, useMemo, useRef } from 'react';
import type { RunnCell } from '@/store/useRunnStore';
import { useDguStore } from '@/store/useDguStore';

/** Удаляет сводки для ячеек, которых больше нет в конфигурации. */
export function useDguSummaryCleanup(
  inputCellId: string,
  cells: RunnCell[]
) {
  const removeCellSummary = useDguStore((s) => s.removeCellSummary);
  const lastActiveIdsRef = useRef<string>('');

  const activeIdsKey = useMemo(
    () => [inputCellId, ...cells.map((c) => c.id)].sort().join(','),
    [inputCellId, cells]
  );

  useEffect(() => {
    if (activeIdsKey === lastActiveIdsRef.current) {
      return;
    }
    lastActiveIdsRef.current = activeIdsKey;

    const activeIds = new Set(activeIdsKey.split(',').filter(Boolean));
    const summaries = useDguStore.getState().cellSummaries;

    summaries.forEach((summary) => {
      if (!activeIds.has(summary.cellId)) {
        removeCellSummary(summary.cellId);
      }
    });
  }, [activeIdsKey, removeCellSummary]);
}
