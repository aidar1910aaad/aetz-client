import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface BmzState {
  width: number;
  length: number;
  height: number;
  thickness: 50 | 100 | null;
  lighting: boolean;
  heatedFloor: boolean;
  heating: boolean;
  fireAlarm: boolean;
  cableTrays: boolean;
  conditioning: boolean;
  ventilationShaft: boolean;

  buildingType: 'bmz' | 'tp' | 'none';
  isBuildingCounted: boolean;

  setField: <K extends keyof BmzState>(key: K, value: BmzState[K]) => void;
  reset: () => void;
}

export const useBmzStore = create<BmzState>()(
  persist(
    (set) => ({
      width: 0,
      length: 0,
      height: 0,
      thickness: null,
      lighting: false,
      heatedFloor: false,
      heating: false,
      fireAlarm: false,
      cableTrays: false,
      conditioning: false,
      ventilationShaft: false,

      buildingType: 'none',
      isBuildingCounted: false,

      setField: (key, value) => set({ [key]: value }),

      reset: () =>
        set({
          width: 0,
          length: 0,
          height: 0,
          thickness: null,
          lighting: false,
          heatedFloor: false,
          heating: false,
          fireAlarm: false,
          cableTrays: false,
          conditioning: false,
          ventilationShaft: false,
          buildingType: 'none',
          isBuildingCounted: false,
        }),
    }),
    {
      name: 'bmz-storage', // имя ключа в localStorage
    }
  )
);
