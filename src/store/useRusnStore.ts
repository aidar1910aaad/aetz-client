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

export interface RusnGlobalOptions {
  voltage: 6 | 10 | 20;
  bodyType: string;
  tnCount: number;
  tnType: string;
  tsnCount: number;
  tsnPower: string;
  busBridgeLength: number;
  breaker?: { id: number; name: string } | null;
  rza?: { id: number; name: string } | null;
  meterType?: { id: number; name: string } | null;
  sr?: { id: number; name: string } | null;
  tsn?: { id: number; name: string } | null;
  tn?: { id: number; name: string } | null;
  tt?: { id: number; name: string } | null;
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
  transformerCurrent?: {
    id: string;
    name: string;
    price: number;
  };
  transformerVoltage?: {
    id: string;
    name: string;
    price: number;
  };
  transformerPower?: {
    id: string;
    name: string;
    price: number;
  };
  count: number;
  calculationId?: number;
  totalPrice: number; // Итоговая цена ячейки (Отпускная расчетная цена)
}

export interface RusnBusbarSummary {
  name: string;
  quantity: number;
  pricePerUnit: number;
  totalPrice: number;
}

export interface RusnCellSummary {
  cellId: string;
  name: string;
  quantity: number;
  pricePerUnit: number;
  totalPrice: number;
}

// Тип для шинного моста
export interface BusbarBridge {
  id: string;
  length: number;
  quantity: number;
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
  busbarSummary: RusnBusbarSummary | null;
  busBridgeSummary: RusnBusbarSummary | null;
  busBridgeSummaries: RusnBusbarSummary[];
  cellSummaries: RusnCellSummary[];
  setBusbarSummary: (summary: RusnBusbarSummary) => void;
  setBusBridgeSummary: (summary: RusnBusbarSummary) => void;
  setBusBridgeSummaries: (summaries: RusnBusbarSummary[]) => void;
  setCellSummary: (summary: RusnCellSummary) => void;
  removeCellSummary: (cellId: string) => void;
  clearCellSummaries: () => void;
  busBridges: BusbarBridge[];
  setBusBridges: (bridges: BusbarBridge[]) => void;
}

const initialBusBridge: BusBridgeConfig = {
  material: 'АД',
  selectedBus: null,
  totalWeight: 0,
  pricePerKg: BUS_MATERIAL_PRICES['АД'],
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
  breaker: null,
  rza: null,
  meterType: null,
  sr: null,
  tsn: null,
  tn: null,
  tt: null,
  busBridge: initialBusBridge,
};

// Migration function to ensure proper state structure
const migrateState = (persistedState: Partial<RusnState> | null): Partial<RusnState> => {
  if (!persistedState) return { global: initialGlobalState, cellConfigs: [] };

  // Ensure global state exists and has all required properties
  const global = {
    ...initialGlobalState,
    ...persistedState.global,
    // Ensure new fields exist
    sr: persistedState.global?.sr || null,
    tsn: persistedState.global?.tsn || null,
    tn: persistedState.global?.tn || null,
    tt: persistedState.global?.tt || null,
    busBridge: {
      ...initialBusBridge,
      ...(persistedState.global?.busBridge || {}),
      pricePerKg: persistedState.global?.busBridge?.material
        ? BUS_MATERIAL_PRICES[persistedState.global.busBridge.material as BusMaterial]
        : BUS_MATERIAL_PRICES['АД'],
    },
  };

  return {
    global,
    cellConfigs: persistedState.cellConfigs || [],
  };
};

export type { RusnState };
export const useRusnStore = create<RusnState>()(
  persist(
    (set, get) => ({
      global: initialGlobalState,
      cellConfigs: [],
      busbarSummary: null,
      busBridgeSummary: null,
      busBridgeSummaries: [],
      cellSummaries: [],
      busBridges: [],

      setGlobal: (key, value) =>
        set((state) => {
          console.log('useRusnStore.setGlobal', key, value);
          return {
            global: { ...state.global, [key]: value },
          };
        }),

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
                totalWeight * (state.global.busBridge?.pricePerKg || BUS_MATERIAL_PRICES['АД']),
              consumption,
            },
          },
        }));
      },

      reset: () =>
        set({
          global: initialGlobalState,
          cellConfigs: [],
          busbarSummary: null,
          busBridgeSummary: null,
          busBridgeSummaries: [],
          cellSummaries: [],
          busBridges: [],
        }),

      setBusbarSummary: (summary) =>
        set((state) => {
          // Проверяем, изменились ли данные
          if (JSON.stringify(state.busbarSummary) === JSON.stringify(summary)) {
            return state;
          }
          return { busbarSummary: summary };
        }),
      setBusBridgeSummary: (summary) =>
        set((state) => {
          console.log('useRusnStore - setBusBridgeSummary:', {
            currentSummary: state.busBridgeSummary,
            newSummary: summary,
            isEqual: JSON.stringify(state.busBridgeSummary) === JSON.stringify(summary),
          });

          // Проверяем, изменились ли данные
          if (JSON.stringify(state.busBridgeSummary) === JSON.stringify(summary)) {
            return state;
          }
          return { busBridgeSummary: summary };
        }),
      setBusBridgeSummaries: (summaries) => set({ busBridgeSummaries: summaries }),
      setCellSummary: (summary) =>
        set((state) => {
          // Проверяем, есть ли уже такая ячейка с теми же данными
          const existingIndex = state.cellSummaries.findIndex((s) => s.cellId === summary.cellId);
          if (existingIndex >= 0) {
            const existing = state.cellSummaries[existingIndex];
            if (JSON.stringify(existing) === JSON.stringify(summary)) {
              return state;
            }
            // Обновляем существующую запись
            const newSummaries = [...state.cellSummaries];
            newSummaries[existingIndex] = summary;
            return { cellSummaries: newSummaries };
          }
          // Добавляем новую запись
          return {
            cellSummaries: [...state.cellSummaries, summary],
          };
        }),
      removeCellSummary: (cellId) =>
        set((state) => ({
          cellSummaries: state.cellSummaries.filter((s) => s.cellId !== cellId),
        })),
      clearCellSummaries: () => set({ cellSummaries: [] }),
      setBusBridges: (bridges) => set({ busBridges: bridges }),
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
