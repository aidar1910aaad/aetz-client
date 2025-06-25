import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { BmzSettings } from '@/api/bmz';

interface BmzState {
  settings: BmzSettings | null;
  buildingType: 'bmz' | 'tp' | 'none';
  length: number;
  width: number;
  height: number;
  thickness: number;
  blockCount: number;
  equipmentState: Record<string, boolean>;
  setSettings: (settings: BmzSettings) => void;
  setBuildingType: (type: 'bmz' | 'tp' | 'none') => void;
  setLength: (length: number) => void;
  setWidth: (width: number) => void;
  setHeight: (height: number) => void;
  setThickness: (thickness: number) => void;
  setBlockCount: (count: number) => void;
  setEquipmentState: (equipmentName: string, value: boolean) => void;
  reset: () => void;
}

const initialState = {
  settings: null,
  buildingType: 'none' as const,
  length: 0,
  width: 0,
  height: 0,
  thickness: 50,
  blockCount: 4,
  equipmentState: {},
};

export const useBmzStore = create<BmzState>()(
  persist(
    (set) => ({
      ...initialState,

      setSettings: (settings) => set({ settings }),

      setBuildingType: (type) => set({ buildingType: type }),

      setLength: (length) => set({ length }),

      setWidth: (width) => set({ width }),

      setHeight: (height) => set({ height }),

      setThickness: (thickness) => set({ thickness }),

      setBlockCount: (count) => set({ blockCount: count }),

      setEquipmentState: (equipmentName, value) =>
        set((state) => ({
          equipmentState: {
            ...state.equipmentState,
            [equipmentName.toLowerCase().replace(/\s+/g, '')]: value,
          },
        })),

      reset: () => set(initialState),
    }),
    {
      name: 'bmz-storage',
    }
  )
);
