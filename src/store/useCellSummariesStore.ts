import { create } from 'zustand';
import { useRunnStore } from './useRunnStore';

export interface RunnCellSummary {
  cellId: string;
  name: string;
  quantity: number;
  pricePerUnit: number;
  totalPrice: number;
}

interface CellSummariesState {
  cellSummaries: RunnCellSummary[];
  setCellSummary: (summary: RunnCellSummary) => void;
  removeCellSummary: (cellId: string) => void;
  clearSummaries: () => void;
  clearCellSummaries: () => void; // Алиас для совместимости
}

export const useCellSummariesStore = create<CellSummariesState>((set) => ({
  cellSummaries: [],
  
  setCellSummary: (summary) =>
    set((state) => {
      // Проверяем, есть ли уже такая ячейка с теми же данными
      const existingIndex = state.cellSummaries.findIndex((s) => s.cellId === summary.cellId);
      if (existingIndex >= 0) {
        const existing = state.cellSummaries[existingIndex];
        if (JSON.stringify(existing) === JSON.stringify(summary)) {
          return state;
        }
        // Обновляем существующую запись
        const newSummaries = [...state.cellSummaries];
        newSummaries[existingIndex] = summary;
        return { cellSummaries: newSummaries };
      }
      // Добавляем новую запись
      // Синхронизируем в RunnStore (персистится)
      try {
        const runn = useRunnStore.getState();
        if (runn?.setCellSummary) {
          runn.setCellSummary(summary);
        }
      } catch {}
      return {
        cellSummaries: [...state.cellSummaries, summary],
      };
    }),

  removeCellSummary: (cellId) =>
    set((state) => {
      // Синхронизируем удаление в RunnStore
      try {
        const runn = useRunnStore.getState();
        if (runn?.removeCellSummary) {
          runn.removeCellSummary(cellId);
        }
      } catch {}
      return {
        cellSummaries: state.cellSummaries.filter((s) => s.cellId !== cellId),
      };
    }),

  clearSummaries: () => {
    try {
      const runn = useRunnStore.getState();
      if (runn?.clearCellSummaries) {
        runn.clearCellSummaries();
      }
    } catch {}
    set({ cellSummaries: [] });
  },
  clearCellSummaries: () => {
    try {
      const runn = useRunnStore.getState();
      if (runn?.clearCellSummaries) {
        runn.clearCellSummaries();
      }
    } catch {}
    set({ cellSummaries: [] });
  }, // Алиас для совместимости
}));
