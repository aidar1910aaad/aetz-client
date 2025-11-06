import { create } from 'zustand';

interface TpBuildingState {
  buildingType: 'bmz' | 'tp' | 'none';
  length: number;
  width: number;
  height: number;
  thickness: number;
  blockCount: number;
  hasLighting: boolean;
  hasHeating: boolean;
  hasSecurity: boolean;
  hasInsulatedFloor: boolean;
  hasVentilationShaft: boolean;
  hasCableShelves: boolean;
  setField: (field: keyof TpBuildingState, value: any) => void;
  initializeDefaultEquipment: () => void;
  reset: () => void;
}

const initialState = {
  buildingType: 'none' as const,
  length: 0,
  width: 0,
  height: 0,
  thickness: 0,
  blockCount: 0,
  hasLighting: false,
  hasHeating: false,
  hasSecurity: false,
  hasInsulatedFloor: false,
  hasVentilationShaft: false,
  hasCableShelves: false,
};

export const useTpBuildingStore = create<TpBuildingState>((set) => ({
  ...initialState,
  setField: (field, value) => set({ [field]: value }),
  initializeDefaultEquipment: () => set({
    hasLighting: true,
    hasHeating: true,
    hasSecurity: true,
  }),
  reset: () => set(initialState),
}));
