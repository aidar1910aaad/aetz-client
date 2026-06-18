import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { defaultWorkPrices } from './useWorkPricesStore';

interface WorkItem {
  name: string;
  price: number;
  description?: string;
  category?: string;
  unit?: string;
  [key: string]: unknown;
}

interface WorksState {
  selected: Record<string, { checked: boolean; count: number }>;
  worksList: WorkItem[];
  isEnabled: boolean;
  // UI-only derived value. Never use as source of truth for backend totals.
  totalPrice: number;
  setSelected: (selected: Record<string, { checked: boolean; count: number }>) => void;
  setWorksList: (list: WorkItem[]) => void;
  setEnabled: (enabled: boolean) => void;
  toggleWork: (workName: string) => void;
  updateWorkCount: (workName: string, count: number) => void;
  calculateTotal: () => number;
  reset: () => void;
  forceUpdateWorksList: () => void;
}

export type { WorkItem };

export const useWorksStore = create<WorksState>()(
  persist(
    (set, get) => {
      const initialWorksList = [
        {
          name: 'Монтаж фундамента (с материалами) за м²',
          price: defaultWorkPrices.foundationPricePerM2,
          unit: 'раб',
          category: 'Фундамент',
          description: 'Монтаж фундамента с материалами'
        },
        {
          name: 'Пусконаладочные работы',
          price:
            defaultWorkPrices.labKtpTpRpSwitchOn +
            defaultWorkPrices.labRelaySettingsCalculation +
            defaultWorkPrices.labComprehensiveTestTwoTransformer,
          unit: 'раб',
          category: 'Пусконаладочные',
          description: 'Комплексные пусконаладочные работы'
        }
      ];
      
      console.log('useWorksStore: Initializing with worksList:', initialWorksList.map(w => w.name));
      
      return {
        selected: {},
        worksList: initialWorksList,
      isEnabled: false,
      totalPrice: 0,

      setSelected: (selected) => {
        set((state) => {
          const newState = { ...state, selected };
          const total = newState.worksList
            .filter((work) => selected[work.name]?.checked)
            .reduce((sum, work) => {
              const count = selected[work.name]?.count || 1;
              return sum + work.price * count;
            }, 0);
          return { ...newState, totalPrice: total };
        });
      },

      setWorksList: (worksList) => {
        console.log('useWorksStore: setWorksList called with:', worksList.map(w => w.name));
        set((state) => {
          const total = worksList
            .filter((work) => state.selected[work.name]?.checked)
            .reduce((sum, work) => {
              const count = state.selected[work.name]?.count || 1;
              return sum + work.price * count;
            }, 0);
          return { ...state, worksList, totalPrice: total };
        });
      },

      setEnabled: (enabled) => set({ isEnabled: enabled }),

      toggleWork: (workName) => {
        set((state) => {
          const currentWork = state.selected[workName];
          const newSelected = {
            ...state.selected,
            [workName]: {
              checked: !currentWork?.checked,
              count: currentWork?.count || 1,
            },
          };
          
          // Пересчитываем общую сумму
          const total = state.worksList
            .filter((work) => newSelected[work.name]?.checked)
            .reduce((sum, work) => {
              const count = newSelected[work.name]?.count || 1;
              return sum + work.price * count;
            }, 0);

          return { 
            ...state,
            selected: newSelected,
            totalPrice: total
          };
        });
      },

      updateWorkCount: (workName, count) => {
        set((state) => {
          const currentWork = state.selected[workName];
          if (!currentWork) return state;

          const newSelected = {
            ...state.selected,
            [workName]: {
              ...currentWork,
              count: Math.max(1, count), // Минимум 1
            },
          };

          // Пересчитываем общую сумму
          const total = state.worksList
            .filter((work) => newSelected[work.name]?.checked)
            .reduce((sum, work) => {
              const workCount = newSelected[work.name]?.count || 1;
              return sum + work.price * workCount;
            }, 0);

          return { 
            ...state,
            selected: newSelected,
            totalPrice: total
          };
        });
      },

      calculateTotal: () => {
        const state = get();
        return state.worksList
          .filter((work) => state.selected[work.name]?.checked)
          .reduce((sum, work) => {
            const count = state.selected[work.name]?.count || 1;
            return sum + work.price * count;
          }, 0);
      },

      reset: () => {
        console.log('useWorksStore: reset called');
        set({ 
          selected: {}, 
          worksList: initialWorksList, 
          isEnabled: false, 
          totalPrice: 0 
        });
      },

      // Функция для принудительного обновления worksList
      forceUpdateWorksList: () => {
        console.log('useWorksStore: forceUpdateWorksList called');
        set((state) => ({
          ...state,
          worksList: initialWorksList
        }));
      },
      };
    },
    {
      name: 'works-storage',
      partialize: (state) => ({
        // Persist only draft selection/config; totals are recalculated and server-authoritative.
        selected: state.selected,
        worksList: state.worksList,
        isEnabled: state.isEnabled,
      }),
      onRehydrateStorage: () => (state) => {
        console.log('useWorksStore: Rehydrating from localStorage');
        if (state) {
          console.log('useWorksStore: Rehydrated worksList:', state.worksList?.map(w => w.name));
          
          // Принудительно обновляем worksList с правильными данными
          if (!state.worksList || state.worksList.length < 2) {
            console.log('useWorksStore: Updating worksList with correct data');
            state.worksList = initialWorksList;
          } else {
            // Обновляем единицы измерения для существующих работ
            console.log('useWorksStore: Updating units to "раб" for existing works');
            state.worksList = state.worksList.map(work => ({
              ...work,
              unit: 'раб'
            }));
          }
          // Recalculate UI-only total after rehydration.
          state.totalPrice = state.worksList
            .filter((work) => state.selected[work.name]?.checked)
            .reduce((sum, work) => {
              const count = state.selected[work.name]?.count || 1;
              return sum + work.price * count;
            }, 0);
        }
      },
    }
  )
);
