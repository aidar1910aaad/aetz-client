import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Calculation } from '@/api/calculations';

interface Transformer {
  id: number;
  model: string;
  voltage: string;
  type: string;
  power: number;
  manufacturer: string;
  price: number;
  quantity: number; // количество трансформаторов
  busbars?: string; // Сборные шины для РУНН (Медь/Алюминий)
  ustCalculation?: Calculation | null; // Выбранная калькуляция УСТ (для обратной совместимости)
  ustCalculations?: Calculation[]; // Множественные УСТ калькуляции
  busbarUstData?: {
    mainUstWeight: number;
    zeroUstWeight: number;
    material: string;
  }; // Данные о шинах для УСТ-0.4кВ
}

interface TransformerStore {
  selectedTransformer: Transformer | null;
  isSkipped: boolean;
  setTransformer: (t: Partial<Transformer>) => void;
  skipTransformer: () => void;
  reset: () => void;
}

export const useTransformerStore = create<TransformerStore>()(
  persist(
    (set) => ({
      selectedTransformer: null,
      isSkipped: false,
      setTransformer: (t) => {
        set({
          selectedTransformer: {
            id: t.id ?? 0,
            model: t.model ?? '',
            voltage: t.voltage ?? '',
            type: t.type ?? '',
            power: t.power ?? 0,
            manufacturer: t.manufacturer ?? '',
            price: t.price ?? 0,
            quantity: t.quantity ?? 2, // <-- тут ставим по умолчанию quantity = 2
            busbars: t.busbars ?? null, // Сборные шины для РУНН
            ustCalculation: t.ustCalculation ?? null, // Выбранная калькуляция УСТ (для обратной совместимости)
            ustCalculations: t.ustCalculations ?? [], // Множественные УСТ калькуляции
            busbarUstData: t.busbarUstData ?? null, // Данные о шинах для УСТ-0.4кВ
          },
          isSkipped: false,
        });
      },
      skipTransformer: () => set({ selectedTransformer: null, isSkipped: true }),
      reset: () => set({ selectedTransformer: null, isSkipped: false }),
    }),
    {
      name: 'transformer-storage',
    }
  )
);
