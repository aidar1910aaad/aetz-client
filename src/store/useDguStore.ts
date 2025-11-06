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
}

export interface DguSettings {
  enabled: boolean;
  material: 'Алюминий' | 'Медь';
  nominalPowerKva: number;
  price: number;
}

interface DguState {
  enabled: boolean; // Будет ли ДГУ
  settings: DguSettings;
  cells: DguCell[];
  
  setEnabled: (enabled: boolean) => void;
  setSettings: (settings: Partial<DguSettings>) => void;
  addCell: (cell: DguCell | Omit<DguCell, 'id'>) => void;
  updateCell: (id: string, key: keyof DguCell, value: any) => void;
  removeCell: (id: string) => void;
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

      setEnabled: (enabled) =>
        set({ enabled }),

      setSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        })),

      addCell: (cell) =>
        set((state) => {
          const cellWithId = 'id' in cell ? cell : { ...cell, id: crypto.randomUUID() };
          // Проверяем, есть ли уже ячейка с таким id
          const existingIndex = state.cells.findIndex(c => c.id === cellWithId.id);
          if (existingIndex >= 0) {
            // Обновляем существующую ячейку
            const updatedCells = [...state.cells];
            updatedCells[existingIndex] = cellWithId;
            return { cells: updatedCells };
          }
          // Добавляем новую ячейку
          return {
            cells: [...state.cells, cellWithId],
          };
        }),

      updateCell: (id, key, value) =>
        set((state) => ({
          cells: state.cells.map((c) => (c.id === id ? { ...c, [key]: value } : c)),
        })),

      removeCell: (id) =>
        set((state) => ({
          cells: state.cells.filter((c) => c.id !== id),
        })),

      reset: () =>
        set({
          enabled: false,
          settings: initialSettings,
          cells: [],
        }),
    }),
    {
      name: 'dgu-storage',
      partialize: (state) => ({
        enabled: state.enabled,
        settings: state.settings,
        cells: state.cells,
      }),
    }
  )
);

