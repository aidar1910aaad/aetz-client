import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
  setSelected: (selected: Record<string, { checked: boolean; count: number }>) => void;
  setWorksList: (list: WorkItem[]) => void;
  reset: () => void;
}

export type { WorkItem };

export const useWorksStore = create<WorksState>()(
  persist(
    (set) => ({
      selected: {},
      worksList: [],
      setSelected: (selected) => set({ selected }),
      setWorksList: (worksList) => set({ worksList }),
      reset: () => set({ selected: {}, worksList: [] }),
    }),
    {
      name: 'works-storage',
    }
  )
);
