import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Calculation } from '@/api/calculations';

interface AdditionalEquipmentItem {
  name: string;
  price: number;
  description?: string;
  category?: string;
  [key: string]: unknown;
}

export type AdditionalEquipmentSelected = Record<
  string,
  { checked: boolean; count: number; price?: number; calculation?: Calculation }
>;

interface AdditionalEquipmentState {
  selected: AdditionalEquipmentSelected;
  equipmentList: AdditionalEquipmentItem[];
  setSelected: (selected: AdditionalEquipmentSelected) => void;
  setEquipmentList: (list: AdditionalEquipmentItem[]) => void;
  reset: () => void;
}

export type { AdditionalEquipmentItem };
export type { AdditionalEquipmentState };
export const useAdditionalEquipmentStore = create<AdditionalEquipmentState>()(
  persist(
    (set) => ({
      selected: {},
      equipmentList: [],
      setSelected: (selected) => set({ selected }),
      setEquipmentList: (equipmentList) => set({ equipmentList }),
      reset: () => set({ selected: {}, equipmentList: [] }),
    }),
    {
      name: 'additional-equipment-storage',
    }
  )
);
