import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface DguCell {
  id: string;
  purpose: string;
  breaker?: string;
  meterType?: string;
  nominalPower?: number;
  price?: number;
  quantity?: number;
  rza?: string;
  ctRatio?: string;
  switchingDevice?: string;
  rubilniki?: string[];
  selectedCalculationName?: string;
  calculationName?: string;
}

export interface DguSettings {
  enabled: boolean;
  material: 'Алюминий' | 'Медь';
  nominalPowerKva: number;
  price: number;
}

export interface DguCellSummary {
  cellId: string;
  name: string;
  quantity: number;
  pricePerUnit: number;
  totalPrice: number;
}

export interface DguBusbarSummary {
  name: string;
  quantity: number;
  pricePerUnit: number;
  totalPrice: number;
}

interface DguState {
  enabled: boolean; // Будет ли ДГУ
  settings: DguSettings;
  cells: DguCell[];
  cellSummaries: DguCellSummary[];
  busbarSummary: DguBusbarSummary | null;
  busBridgeSummaries: DguBusbarSummary[];

  setEnabled: (enabled: boolean) => void;
  setSettings: (settings: Partial<DguSettings>) => void;
  addCell: (cell: DguCell | Omit<DguCell, 'id'>) => void;
  setCells: (cells: DguCell[]) => void;
  updateCell: (id: string, key: keyof DguCell, value: any) => void;
  removeCell: (id: string) => void;
  setCellSummary: (summary: DguCellSummary) => void;
  removeCellSummary: (cellId: string) => void;
  clearCellSummaries: () => void;
  setBusbarSummary: (summary: DguBusbarSummary | null) => void;
  setBusBridgeSummaries: (
    summaries:
      | DguBusbarSummary[]
      | ((current: DguBusbarSummary[]) => DguBusbarSummary[])
  ) => void;
  reset: () => void;
}

const initialSettings: DguSettings = {
  enabled: false,
  material: 'Алюминий',
  nominalPowerKva: 0,
  price: 0,
};

export const useDguStore = create<DguState>()(
  persist(
    (set) => ({
      enabled: false,
      settings: initialSettings,
      cells: [],
      cellSummaries: [],
      busbarSummary: null,
      busBridgeSummaries: [],

      setEnabled: (enabled) =>
        set({ enabled }),

      setSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        })),

      addCell: (cell) =>
        set((state) => {
          const cellWithId = 'id' in cell ? cell : { ...cell, id: crypto.randomUUID() };
          const existingIndex = state.cells.findIndex((c) => c.id === cellWithId.id);
          if (existingIndex >= 0) {
            const existing = state.cells[existingIndex];
            if (JSON.stringify(existing) === JSON.stringify(cellWithId)) {
              return state;
            }
            const updatedCells = [...state.cells];
            updatedCells[existingIndex] = cellWithId;
            return { cells: updatedCells };
          }
          return {
            cells: [...state.cells, cellWithId],
          };
        }),

      setCells: (cells) =>
        set((state) => {
          if (JSON.stringify(state.cells) === JSON.stringify(cells)) {
            return state;
          }
          return { cells };
        }),

      updateCell: (id, key, value) =>
        set((state) => {
          const target = state.cells.find((c) => c.id === id);
          if (!target || target[key] === value) {
            return state;
          }
          return {
            cells: state.cells.map((c) =>
              c.id === id ? { ...c, [key]: value } : c
            ),
          };
        }),

      removeCell: (id) =>
        set((state) => ({
          cells: state.cells.filter((c) => c.id !== id),
          cellSummaries: state.cellSummaries.filter((s) => s.cellId !== id),
        })),

      setCellSummary: (summary) =>
        set((state) => {
          const existingIndex = state.cellSummaries.findIndex(
            (s) => s.cellId === summary.cellId
          );
          if (existingIndex >= 0) {
            const existing = state.cellSummaries[existingIndex];
            if (JSON.stringify(existing) === JSON.stringify(summary)) {
              return state;
            }
            const newSummaries = [...state.cellSummaries];
            newSummaries[existingIndex] = summary;
            return { cellSummaries: newSummaries };
          }
          return { cellSummaries: [...state.cellSummaries, summary] };
        }),

      removeCellSummary: (cellId) =>
        set((state) => {
          if (!state.cellSummaries.some((s) => s.cellId === cellId)) {
            return state;
          }
          return {
            cellSummaries: state.cellSummaries.filter((s) => s.cellId !== cellId),
          };
        }),

      clearCellSummaries: () => set({ cellSummaries: [] }),

      setBusbarSummary: (summary) =>
        set((state) => {
          if (JSON.stringify(state.busbarSummary) === JSON.stringify(summary)) {
            return state;
          }
          return { busbarSummary: summary };
        }),

      setBusBridgeSummaries: (summaries) =>
        set((state) => ({
          busBridgeSummaries:
            typeof summaries === 'function'
              ? summaries(state.busBridgeSummaries)
              : summaries,
        })),

      reset: () =>
        set({
          enabled: false,
          settings: initialSettings,
          cells: [],
          cellSummaries: [],
          busbarSummary: null,
          busBridgeSummaries: [],
        }),
    }),
    {
      name: 'dgu-storage',
      partialize: (state) => ({
        enabled: state.enabled,
        settings: state.settings,
        cells: state.cells,
        cellSummaries: state.cellSummaries,
        busbarSummary: state.busbarSummary,
        busBridgeSummaries: state.busBridgeSummaries,
      }),
    }
  )
);

