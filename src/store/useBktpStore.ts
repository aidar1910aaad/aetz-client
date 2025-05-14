// store/useBktpStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
const currentTime = new Date().toTimeString().slice(0, 5); // HH:mm

interface BktpFormState {
  executor: string;
  date: string;
  time: string;
  taskNumber: string;
  client: string;
  setField: <K extends keyof BktpFormState>(key: K, value: BktpFormState[K]) => void;
  reset: () => void;
}

export const useBktpStore = create<BktpFormState>()(
  persist(
    (set) => ({
      executor: '',
      date: today,
      time: currentTime,
      taskNumber: '',
      client: '',
      setField: (key, value) => set({ [key]: value }),
      reset: () =>
        set({
          executor: '',
          date: today,
          time: currentTime,
          taskNumber: '',
          client: '',
        }),
    }),
    {
      name: 'bktp-storage', // ключ в localStorage
    }
  )
);
