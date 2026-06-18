import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { BmzSettings } from '@/api/bmz';

export type BmzBuildingType = 'bmz' | 'tp' | 'none' | null;

interface BmzState {
  settings: BmzSettings | null;
  buildingType: BmzBuildingType;
  length: number;
  width: number;
  height: number;
  thickness: number;
  blockCount: number;
  equipmentState: Record<string, boolean>;
  setSettings: (settings: BmzSettings) => void;
  setBuildingType: (type: BmzBuildingType) => void;
  setLength: (length: number) => void;
  setWidth: (width: number) => void;
  setHeight: (height: number) => void;
  setThickness: (thickness: number) => void;
  setBlockCount: (count: number) => void;
  setEquipmentState: (equipmentName: string, value: boolean) => void;
  initializeDefaultEquipment: () => void;
  // Геттеры для совместимости с BmzForm
  get hasLighting(): boolean;
  get hasHeating(): boolean;
  get hasSecurity(): boolean;
  get hasInsulatedFloor(): boolean;
  get hasVentilationShaft(): boolean;
  get hasCableShelves(): boolean;
  // Сеттеры для совместимости с BmzForm
  setHasLighting: (value: boolean) => void;
  setHasHeating: (value: boolean) => void;
  setHasSecurity: (value: boolean) => void;
  setHasInsulatedFloor: (value: boolean) => void;
  setHasVentilationShaft: (value: boolean) => void;
  setHasCableShelves: (value: boolean) => void;
  reset: () => void;
}

const initialState = {
  settings: null,
  buildingType: null as BmzBuildingType,
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

      initializeDefaultEquipment: () =>
        set((state) => {
          if (!state.settings) return state;
          
          const defaultEquipment = ['Освещение', 'Отопление', 'Охрано-пожарная сигнализация'];
          const newEquipmentState = { ...state.equipmentState };
          
          defaultEquipment.forEach((equipmentName) => {
            const stateKey = equipmentName.toLowerCase().replace(/\s+/g, '');
            newEquipmentState[stateKey] = true;
          });
          
          return {
            equipmentState: newEquipmentState,
          };
        }),

      // Геттеры для совместимости с BmzForm
      get hasLighting() {
        return this.equipmentState['освещение'] || false;
      },
      get hasHeating() {
        return this.equipmentState['отопление'] || false;
      },
      get hasSecurity() {
        return this.equipmentState['охрано-пожарнаясигнализация'] || false;
      },
      get hasInsulatedFloor() {
        return this.equipmentState['утепленныйпол'] || false;
      },
      get hasVentilationShaft() {
        return this.equipmentState['шахтадлявентиляции'] || false;
      },
      get hasCableShelves() {
        return this.equipmentState['кабельныеполкиистойки'] || false;
      },

      // Сеттеры для совместимости с BmzForm
      setHasLighting: (value: boolean) =>
        set((state) => ({
          equipmentState: { ...state.equipmentState, освещение: value },
        })),
      setHasHeating: (value: boolean) =>
        set((state) => ({
          equipmentState: { ...state.equipmentState, отопление: value },
        })),
      setHasSecurity: (value: boolean) =>
        set((state) => ({
          equipmentState: { ...state.equipmentState, 'охрано-пожарнаясигнализация': value },
        })),
      setHasInsulatedFloor: (value: boolean) =>
        set((state) => ({
          equipmentState: { ...state.equipmentState, утепленныйпол: value },
        })),
      setHasVentilationShaft: (value: boolean) =>
        set((state) => ({
          equipmentState: { ...state.equipmentState, шахтадлявентиляции: value },
        })),
      setHasCableShelves: (value: boolean) =>
        set((state) => ({
          equipmentState: { ...state.equipmentState, кабельныеполкиистойки: value },
        })),

      reset: () => set(initialState),
    }),
    {
      name: 'bmz-storage',
      version: 2,
      migrate: (persistedState: unknown, version) => {
        if (version >= 2 || !persistedState || typeof persistedState !== 'object') {
          return persistedState;
        }

        const state = persistedState as Partial<BmzState>;
        return {
          ...state,
          // В старых сохранениях "none" было дефолтом. Теперь дефолт — без выбора.
          buildingType: state.buildingType === 'none' ? null : state.buildingType,
        };
      },
    }
  )
);
