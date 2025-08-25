import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface RunnGlobalOptions {
  voltage: 0.4 | 6 | 10;
  bodyType: string;
  busBridgeLength: number;
  withdrawableBreaker: string;
  moldedCaseBreaker: string;
  meterType: string;
}

export interface RunnCell {
  id: string;
  purpose: string;
  breaker: string;
  switchingDevice?: string; // Коммутационный аппарат для отходящих ячеек
  rza?: string;
  meterType?: string;
  ctRatio?: string;
  nominalPower?: number; // Номинальная мощность в кВт
  price?: number; // Цена в тенге
  quantity?: number; // Количество
  rubilniki?: string[]; // Рубильники для РПС (массив)
}

interface RunnState {
  global: RunnGlobalOptions;
  cellConfigs: RunnCell[];
  setGlobal: <K extends keyof RunnGlobalOptions>(key: K, value: RunnGlobalOptions[K]) => void;
  addCell: (cell: Omit<RunnCell, 'id'> & { id?: string }) => void;
  updateCell: (id: string, key: keyof RunnCell, value: any) => void;
  removeCell: (id: string) => void;
  reset: () => void;
}

export const useRunnStore = create<RunnState>()(
  persist(
    (set) => ({
      global: {
        voltage: 0.4,
        bodyType: '',
        busBridgeLength: 0,
        withdrawableBreaker: '',
        moldedCaseBreaker: '',
        meterType: '',
      },
      cellConfigs: [],

      setGlobal: (key, value) =>
        set((state) => ({
          global: { ...state.global, [key]: value },
        })),

      addCell: (cell) =>
        set((state) => ({
          cellConfigs: [...state.cellConfigs, { ...cell, id: cell.id ?? crypto.randomUUID() }],
        })),

      updateCell: (id, key, value) =>
        set((state) => ({
          cellConfigs: state.cellConfigs.map((c) => (c.id === id ? { ...c, [key]: value } : c)),
        })),

      removeCell: (id) =>
        set((state) => ({
          cellConfigs: state.cellConfigs.filter((c) => c.id !== id),
        })),

      reset: () =>
        set({
          global: {
            voltage: 0.4,
            bodyType: '',
            busBridgeLength: 0,
            withdrawableBreaker: '',
            moldedCaseBreaker: '',
            meterType: '',
          },
          cellConfigs: [],
        }),
    }),
    {
      name: 'runn-storage',
    }
  )
);
