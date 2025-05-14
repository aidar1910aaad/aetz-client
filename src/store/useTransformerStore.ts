import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Transformer {
  voltage: number;
  type: string;
  power: number;
  manufacturer: string;
  price: number;
  spec: string;
  quantity: number; // количество трансформаторов
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
            voltage: t.voltage ?? 0,
            type: t.type ?? '',
            power: t.power ?? 0,
            manufacturer: t.manufacturer ?? '',
            price: t.price ?? 0,
            spec: t.spec ?? '',
            quantity: t.quantity ?? 2, // <-- тут ставим по умолчанию quantity = 2
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
