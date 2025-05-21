import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface RusnGlobalOptions {
  voltage: 6 | 10 | 20;
  bodyType: string;
  tnCount: number;
  tnType: string;
  tsnCount: number;
  tsnPower: string;
  busBridgeLength: number;
  breaker: string;
  rza: string;
  meterType: string;
}

export interface RusnCell {
  id: string;
  purpose: string; // Ввод, СВ, СР и т.д.
  breaker: string;
  rza?: string;
  meterType?: string;
  ctRatio?: string;
  avr?: boolean;
  count: number;
  calculationId?: number;
}

interface RusnState {
  global: RusnGlobalOptions;
  cellConfigs: RusnCell[];
  setGlobal: <K extends keyof RusnGlobalOptions>(key: K, value: RusnGlobalOptions[K]) => void;
  addCell: (cell: Omit<RusnCell, 'id'>) => void;
  updateCell: (id: string, key: keyof RusnCell, value: any) => void;
  removeCell: (id: string) => void;
  reset: () => void;
}

export const useRusnStore = create<RusnState>()(
  persist(
    (set) => ({
      global: {
        voltage: 10,
        bodyType: '',
        tnCount: 2,
        tnType: 'ЗНОЛп-10',
        tsnCount: 2,
        tsnPower: '2 кВА',
        busBridgeLength: 2,
        breaker: '',
        rza: '',
        meterType: ''
      },
      cellConfigs: [],

      setGlobal: (key, value) =>
        set((state) => ({
          global: { ...state.global, [key]: value },
        })),

      addCell: (cell: Omit<RusnCell, 'id'>) =>
        set((state) => ({
          cellConfigs: [...state.cellConfigs, { ...cell, id: crypto.randomUUID() }],
        })),

      updateCell: (id: string, key: keyof RusnCell, value: any) =>
        set((state) => ({
          cellConfigs: state.cellConfigs.map((cell) =>
            cell.id === id ? { ...cell, [key]: value } : cell
          ),
        })),

      removeCell: (id: string) =>
        set((state) => ({
          cellConfigs: state.cellConfigs.filter((cell) => cell.id !== id),
        })),

      reset: () =>
        set({
          global: {
            voltage: 10,
            bodyType: '',
            tnCount: 2,
            tnType: 'ЗНОЛп-10',
            tsnCount: 2,
            tsnPower: '2 кВА',
            busBridgeLength: 2,
            breaker: '',
            rza: '',
            meterType: ''
          },
          cellConfigs: [],
        }),
    }),
    {
      name: 'rusn-storage',
    }
  )
);
