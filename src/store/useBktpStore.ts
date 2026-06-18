// store/useBktpStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getBktpNow } from '@/utils/bktpDateTime';

interface BktpFormState {
  executor: string;
  date: string;
  time: string;
  taskNumber: string;
  client: string;
  setField: <K extends keyof BktpFormState>(key: K, value: BktpFormState[K]) => void;
  /** Проставить текущие дату и время (при старте и при сохранении заявки) */
  stampDateTime: () => { date: string; time: string };
  reset: () => void;
}

const initialMeta = getBktpNow();

export const useBktpStore = create<BktpFormState>()(
  persist(
    (set) => ({
      executor: '',
      date: initialMeta.date,
      time: initialMeta.time,
      taskNumber: '',
      client: '',
      setField: (key, value) => set({ [key]: value }),
      stampDateTime: () => {
        const { date, time } = getBktpNow();
        set({ date, time });
        return { date, time };
      },
      reset: () => {
        const { date, time } = getBktpNow();
        set({
          executor: '',
          date,
          time,
          taskNumber: '',
          client: '',
        });
      },
    }),
    {
      name: 'bktp-storage',
    }
  )
);
