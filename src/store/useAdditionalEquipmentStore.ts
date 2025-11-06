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
  isInitialized: boolean;
  setSelected: (selected: AdditionalEquipmentSelected | ((prev: AdditionalEquipmentSelected) => AdditionalEquipmentSelected)) => void;
  setEquipmentList: (list: AdditionalEquipmentItem[]) => void;
  setInitialized: (initialized: boolean) => void;
  reset: () => void;
}

export type { AdditionalEquipmentItem };
export type { AdditionalEquipmentState };
export const useAdditionalEquipmentStore = create<AdditionalEquipmentState>()(
  persist(
    (set) => ({
      selected: {},
      equipmentList: [],
      isInitialized: false,
      setSelected: (selected) => {
        const newSelected = typeof selected === 'function' ? selected(useAdditionalEquipmentStore.getState().selected) : selected;
        console.log('💾 Store setSelected:', Object.keys(newSelected).length, 'items');
        set((state) => ({ 
          selected: newSelected
        }));
      },
      setEquipmentList: (equipmentList) => {
        console.log('💾 Store: обновляем equipmentList');
        set({ equipmentList });
      },
      setInitialized: (isInitialized) => {
        console.log('🏁 Store: устанавливаем isInitialized =', isInitialized);
        set({ isInitialized });
      },
      reset: () => {
        console.log('🗑️ Store: сброс данных');
        set({ selected: {}, equipmentList: [], isInitialized: false });
      },
    }),
    {
      name: 'additional-equipment-storage',
      onRehydrateStorage: () => (state) => {
        console.log('🔄 Store: восстановление из localStorage', state);
        if (state && state.selected) {
          console.log('✅ Данные успешно восстановлены:', Object.keys(state.selected).length, 'элементов');
          Object.entries(state.selected).forEach(([name, data]) => {
            if (data.checked && data.count > 0) {
              console.log(`  - ${name}: ${data.count} шт, цена: ${data.price}₸`);
            }
          });
        } else {
          console.log('❌ Данные не найдены в localStorage');
        }
      },
      // Добавляем partialize чтобы сохранять selected и isInitialized
      partialize: (state) => ({ selected: state.selected, isInitialized: state.isInitialized }),
    }
  )
);
