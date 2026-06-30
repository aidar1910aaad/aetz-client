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
  /** Индекс самого дальнего достигнутого шага в конфигураторе (0 = «Заявка») */
  furthestStepIndex: number;
  setField: <K extends keyof BktpFormState>(key: K, value: BktpFormState[K]) => void;
  markStepReached: (stepIndex: number) => void;
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
      furthestStepIndex: 0,
      setField: (key, value) => set({ [key]: value }),
      markStepReached: (stepIndex) =>
        set((state) => ({
          furthestStepIndex: Math.max(state.furthestStepIndex, stepIndex),
        })),
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
          furthestStepIndex: 0,
        });
      },
    }),
    {
      name: 'bktp-storage',
      partialize: (state) => ({
        executor: state.executor,
        date: state.date,
        time: state.time,
        taskNumber: state.taskNumber,
        client: state.client,
        furthestStepIndex: state.furthestStepIndex,
      }),
    }
  )
);
