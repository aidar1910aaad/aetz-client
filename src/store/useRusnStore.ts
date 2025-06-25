import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  BusBridgeConfig,
  BusMaterial,
  BusSpec,
  BusConsumption,
  BUS_MATERIAL_PRICES,
  BUS_SPECS,
  BUS_CONSUMPTION,
} from '@/types/rusn';

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
  busBridge: BusBridgeConfig;
}

export interface RusnCell {
  id: string;
  purpose: string; // Ввод, СВ, СР и т.д.
  cellType: string; // Тип ячейки (например, КСО А12-10 1000x1000)
  breaker?: {
    id: string;
    name: string;
    price: number;
    current?: number; // ток в амперах
  };
  rza?: {
    id: string;
    name: string;
    price: number;
  };
  meterType?: {
    id: string;
    name: string;
    price: number;
  };
  transformer?: {
    id: string;
    name: string;
    price: number;
  };
  count: number;
  calculationId?: number;
  totalPrice: number; // Итоговая цена ячейки (Отпускная расчетная цена)
}

interface RusnState {
  global: RusnGlobalOptions;
  cellConfigs: RusnCell[];
  setGlobal: <K extends keyof RusnGlobalOptions>(key: K, value: RusnGlobalOptions[K]) => void;
  addCell: (cell: Omit<RusnCell, 'id'>) => void;
  updateCell: (id: string, key: keyof RusnCell, value: RusnCell[keyof RusnCell]) => void;
  removeCell: (id: string) => void;
  setBusMaterial: (material: BusMaterial) => void;
  updateBusBridge: () => void;
  reset: () => void;
}

const initialBusBridge: BusBridgeConfig = {
  material: 'copper',
  selectedBus: null,
  totalWeight: 0,
  pricePerKg: BUS_MATERIAL_PRICES.copper,
  totalPrice: 0,
  consumption: [],
};

const initialGlobalState: RusnGlobalOptions = {
  voltage: 10,
  bodyType: '',
  tnCount: 2,
  tnType: 'ЗНОЛп-10',
  tsnCount: 2,
  tsnPower: '2 кВА',
  busBridgeLength: 2,
  breaker: '',
  rza: '',
  meterType: '',
  busBridge: initialBusBridge,
};

// Migration function to ensure proper state structure
const migrateState = (persistedState: Partial<RusnState> | null): Partial<RusnState> => {
  if (!persistedState) return { global: initialGlobalState, cellConfigs: [] };

  // Ensure global state exists and has all required properties
  const global = {
    ...initialGlobalState,
    ...persistedState.global,
    busBridge: {
      ...initialBusBridge,
      ...(persistedState.global?.busBridge || {}),
      pricePerKg: persistedState.global?.busBridge?.material
        ? BUS_MATERIAL_PRICES[persistedState.global.busBridge.material as BusMaterial]
        : BUS_MATERIAL_PRICES.copper,
    },
  };

  return {
    global,
    cellConfigs: persistedState.cellConfigs || [],
  };
};

export const useRusnStore = create<RusnState>()(
  persist(
    (set, get) => ({
      global: initialGlobalState,
      cellConfigs: [],

      setGlobal: (key, value) =>
        set((state) => ({
          global: { ...state.global, [key]: value },
        })),

      addCell: (cell: Omit<RusnCell, 'id'>) =>
        set((state) => ({
          cellConfigs: [...state.cellConfigs, { ...cell, id: crypto.randomUUID() }],
        })),

      updateCell: (id: string, key: keyof RusnCell, value: RusnCell[keyof RusnCell]) =>
        set((state) => ({
          cellConfigs: state.cellConfigs.map((cell) =>
            cell.id === id ? { ...cell, [key]: value } : cell
          ),
        })),

      removeCell: (id: string) =>
        set((state) => ({
          cellConfigs: state.cellConfigs.filter((cell) => cell.id !== id),
        })),

      setBusMaterial: (material: BusMaterial) =>
        set((state) => ({
          global: {
            ...state.global,
            busBridge: {
              ...state.global.busBridge,
              material,
              pricePerKg: BUS_MATERIAL_PRICES[material],
            },
          },
        })),

      updateBusBridge: () => {
        const state = get();
        const { cellConfigs, global } = state;

        // Ensure busBridge exists
        if (!global.busBridge) {
          global.busBridge = { ...initialBusBridge };
        }

        // Находим вводной выключатель
        const inputCell = cellConfigs.find((cell) => cell.purpose === '1ВК');
        const inputCurrent = inputCell?.breaker?.current;

        // Выбираем шину по току
        let selectedBus: BusSpec | null = null;
        if (inputCurrent) {
          const materialSpecs = BUS_SPECS[global.busBridge.material];
          selectedBus =
            materialSpecs.find((bus) => {
              if (Array.isArray(bus.amps)) {
                return bus.amps.some((amp) => amp !== null && amp >= inputCurrent);
              } else {
                return bus.amps >= inputCurrent;
              }
            }) || null;
        }

        // Рассчитываем потребление по типам ячеек
        const consumption = cellConfigs.reduce((acc, cell) => {
          const existing = acc.find((c) => c.cellType === cell.purpose);
          if (existing) {
            existing.weight +=
              cell.count *
              (BUS_CONSUMPTION[global.bodyType]?.find((c) => c.cellType === cell.purpose)?.weight ||
                0);
          } else {
            acc.push({
              cellType: cell.purpose,
              weight:
                cell.count *
                (BUS_CONSUMPTION[global.bodyType]?.find((c) => c.cellType === cell.purpose)
                  ?.weight || 0),
            });
          }
          return acc;
        }, [] as BusConsumption[]);

        // Рассчитываем общий вес
        const totalWeight = consumption.reduce((sum, c) => sum + c.weight, 0);

        // Обновляем состояние
        set((state) => ({
          global: {
            ...state.global,
            busBridge: {
              ...state.global.busBridge,
              selectedBus,
              totalWeight,
              totalPrice:
                totalWeight * (state.global.busBridge?.pricePerKg || BUS_MATERIAL_PRICES.copper),
              consumption,
            },
          },
        }));
      },

      reset: () =>
        set({
          global: initialGlobalState,
          cellConfigs: [],
        }),
    }),
    {
      name: 'rusn-storage',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Apply migration when state is rehydrated
          const migratedState = migrateState(state);
          state.global = migratedState.global;
          state.cellConfigs = migratedState.cellConfigs;
        }
      },
    }
  )
);
