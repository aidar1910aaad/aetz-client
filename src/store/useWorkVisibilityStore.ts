import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WorkVisibilityState {
  isWorksEnabled: boolean;
  isPageVisible: boolean;
  setWorksEnabled: (enabled: boolean) => void;
  setPageVisible: (visible: boolean) => void;
  toggleWorks: () => void;
  reset: () => void;
}

const initialState = {
  isWorksEnabled: false,
  isPageVisible: false,
};

export const useWorkVisibilityStore = create<WorkVisibilityState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setWorksEnabled: (enabled: boolean) => 
        set({ 
          isWorksEnabled: enabled,
          isPageVisible: enabled // Страница видна только когда работы включены
        }),

      setPageVisible: (visible: boolean) => 
        set({ isPageVisible: visible }),

      toggleWorks: () => {
        const currentState = get();
        const newEnabled = !currentState.isWorksEnabled;
        set({ 
          isWorksEnabled: newEnabled,
          isPageVisible: newEnabled
        });
      },

      reset: () => set(initialState),
    }),
    {
      name: 'work-visibility-storage',
    }
  )
);