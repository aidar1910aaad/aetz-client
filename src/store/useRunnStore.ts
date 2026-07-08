import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { normalizeBusbarSection } from '@/utils/busbarSectionUtils';

export type BusMaterial = 'АД' | 'АД2' | 'МТ' | 'МТ2';

export interface BusbarBridge {
  id?: string;
  name?: string;
  length: number;
  width: number;
  quantity: number;
  pairedId?: string;
}

interface RunnGlobalOptions {
  voltage: 0.4 | 6 | 10;
  bodyType: string;
  busBridgeLength: number;
  withdrawableBreaker: string;
  moldedCaseBreaker: string;
  meterType: string;
  busbar: {
    enabled: boolean;
    material: BusMaterial | null;
    selectedBusbarGroup: string | null;
    selectedBusbarSection: string | null;
  };
  busBridge: {
    enabled: boolean;
    material: BusMaterial | null;
    bridges: BusbarBridge[];
  };
  zeroBusbar: {
    enabled: boolean;
    material: BusMaterial | null;
    configuration: string;
    weight: number;
    pricePerKg: number;
    selectedBusbarGroup: string | null;
    selectedBusbarSection: string | null;
  };
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
  hasAVR?: boolean; // Наличие АВР
  selectedCalculationName?: string; // Название выбранной калькуляции
  calculationName?: string; // Название выбранной калькуляции (альтернативное поле)
  // Добавляем поля для хранения расчетов как в РУСН
  breakerPrice?: number; // Цена автомата
  meterPrice?: number; // Цена счетчика
  rzaPrice?: number; // Цена РЗА
  transformerPrice?: number; // Цена трансформатора тока
  totalPrice?: number; // Общая цена ячейки
  calculationId?: number; // ID калькуляции
}

export interface RunnCellSummary {
  cellId: string;
  name: string;
  quantity: number;
  pricePerUnit: number;
  totalPrice: number;
}

export interface RunnBusbarSummary {
  name: string;
  quantity: number;
  pricePerUnit: number;
  totalPrice: number;
}

interface RunnState {
  global: RunnGlobalOptions;
  cellConfigs: RunnCell[];
  // UI snapshot only. Backend remains authoritative for final totals.
  cellSummaries: RunnCellSummary[];
  busbarSummary: RunnBusbarSummary | null;
  busBridgeSummary: RunnBusbarSummary | null;
  busBridgeSummaries: RunnBusbarSummary[];
  busBridges: BusbarBridge[];
  
  setGlobal: <K extends keyof RunnGlobalOptions>(key: K, value: RunnGlobalOptions[K]) => void;
  addCell: (cell: Omit<RunnCell, 'id'> & { id?: string }) => void;
  updateCell: (id: string, key: keyof RunnCell, value: any) => void;
  removeCell: (id: string) => void;
  setBusMaterial: (material: BusMaterial) => void;
  setBusbarVariant: (group: string | null, section: string | null) => void;
  setZeroBusbarVariant: (group: string | null, section: string | null) => void;
  setBusBridgeMaterial: (material: BusMaterial) => void;
  setBusBridges: (bridges: BusbarBridge[]) => void;
  toggleBusbar: (enabled: boolean) => void;
  toggleBusBridge: (enabled: boolean) => void;
  clearAllCells: () => void;
  reset: () => void;
  
  // Методы для управления сводками
  setCellSummary: (summary: RunnCellSummary) => void;
  removeCellSummary: (cellId: string) => void;
  clearCellSummaries: () => void;
  setBusbarSummary: (summary: RunnBusbarSummary) => void;
  setBusBridgeSummary: (summary: RunnBusbarSummary | null) => void;
  setBusBridgeSummaries: (
    summaries:
      | RunnBusbarSummary[]
      | ((currentSummaries: RunnBusbarSummary[]) => RunnBusbarSummary[])
  ) => void;
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
        busbar: {
          enabled: false,
          material: null,
          selectedBusbarGroup: null,
          selectedBusbarSection: null,
        },
        busBridge: {
          enabled: false,
          material: null,
          bridges: [],
        },
        zeroBusbar: {
          enabled: false,
          material: null,
          configuration: '',
          weight: 0,
          pricePerKg: 0,
          selectedBusbarGroup: null,
          selectedBusbarSection: null,
        },
      },
      cellConfigs: [],
      // Инициализируем поля для сводок
      cellSummaries: [],
      busbarSummary: null,
      busBridgeSummary: null,
      busBridgeSummaries: [],
      busBridges: [],

      setGlobal: (key, value) =>
        set((state) => ({
          global: { ...state.global, [key]: value },
        })),

      addCell: (cell) =>
        set((state) => {
          const newCell = { ...cell, id: cell.id ?? crypto.randomUUID() };
          return {
            cellConfigs: [...state.cellConfigs, newCell],
          };
        }),

      updateCell: (id, key, value) =>
        set((state) => ({
          cellConfigs: state.cellConfigs.map((c) => (c.id === id ? { ...c, [key]: value } : c)),
        })),

      removeCell: (id) =>
        set((state) => ({
          cellConfigs: state.cellConfigs.filter((c) => c.id !== id),
        })),

      setBusMaterial: (material) =>
        set((state) => ({
          global: {
            ...state.global,
            busbar: {
              ...(state.global.busbar || {
                enabled: false,
                material: null,
                selectedBusbarGroup: null,
                selectedBusbarSection: null,
              }),
              material,
              selectedBusbarGroup: null,
              selectedBusbarSection: null,
            },
          },
        })),

      setBusbarVariant: (group, section) =>
        set((state) => {
          const current = state.global.busbar || {
            enabled: false,
            material: null,
            selectedBusbarGroup: null,
            selectedBusbarSection: null,
          };
          const nextGroup = group ?? null;
          const nextSection = section ?? null;
          const sameGroup = (current.selectedBusbarGroup ?? null) === nextGroup;
          const sameSection =
            (current.selectedBusbarSection ?? null) === nextSection ||
            (current.selectedBusbarSection &&
              nextSection &&
              normalizeBusbarSection(current.selectedBusbarSection) ===
                normalizeBusbarSection(nextSection));

          if (sameGroup && sameSection) {
            return state;
          }
          return {
            global: {
              ...state.global,
              busbar: {
                ...current,
                selectedBusbarGroup: nextGroup,
                selectedBusbarSection: nextSection,
              },
            },
          };
        }),

      setZeroBusbarVariant: (group, section) =>
        set((state) => {
          const current = state.global.zeroBusbar || {
            enabled: false,
            material: null,
            configuration: '',
            weight: 0,
            pricePerKg: 0,
            selectedBusbarGroup: null,
            selectedBusbarSection: null,
          };
          const nextGroup = group ?? null;
          const nextSection = section ?? null;
          const sameGroup = (current.selectedBusbarGroup ?? null) === nextGroup;
          const sameSection =
            (current.selectedBusbarSection ?? null) === nextSection ||
            (current.selectedBusbarSection &&
              nextSection &&
              normalizeBusbarSection(current.selectedBusbarSection) ===
                normalizeBusbarSection(nextSection));

          if (sameGroup && sameSection) {
            return state;
          }
          return {
            global: {
              ...state.global,
              zeroBusbar: {
                ...current,
                selectedBusbarGroup: nextGroup,
                selectedBusbarSection: nextSection,
              },
            },
          };
        }),

      setBusBridgeMaterial: (material) =>
        set((state) => ({
          global: {
            ...state.global,
            busBridge: {
              ...(state.global.busBridge || { enabled: false, material: null, bridges: [] }),
              material,
            },
          },
        })),

      setBusBridges: (bridges) =>
        set((state) => ({
          busBridges: bridges,
          global: {
            ...state.global,
            busBridge: { 
              ...(state.global.busBridge || { enabled: false, material: null, bridges: [] }),
              bridges 
            },
          },
        })),

      toggleBusbar: (enabled) =>
        set((state) => ({
          global: {
            ...state.global,
            busbar: { 
              ...(state.global.busbar || { enabled: false, material: null }),
              enabled 
            },
          },
        })),

      toggleBusBridge: (enabled) =>
        set((state) => ({
          global: {
            ...state.global,
            busBridge: { 
              ...(state.global.busBridge || { enabled: false, material: null, bridges: [] }),
              enabled 
            },
          },
        })),

      clearAllCells: () =>
        set({
          cellConfigs: [],
          cellSummaries: [],
        }),

      reset: () => {
        // Очищаем localStorage для шинных мостов и самого store
        if (typeof window !== 'undefined') {
          localStorage.removeItem('busbar-bridges');
          // Очищаем persist storage для РУНН
          localStorage.removeItem('runn-storage');
        }
        
        set({
          global: {
            voltage: 0.4,
            bodyType: '',
            busBridgeLength: 0,
            withdrawableBreaker: '',
            moldedCaseBreaker: '',
            meterType: '',
            busbar: {
              enabled: false,
              material: null,
              selectedBusbarGroup: null,
              selectedBusbarSection: null,
            },
            busBridge: {
              enabled: false,
              material: null,
              bridges: [],
            },
            zeroBusbar: {
              enabled: false,
              material: null,
              configuration: '',
              weight: 0,
              pricePerKg: 0,
              selectedBusbarGroup: null,
              selectedBusbarSection: null,
            },
          },
          cellConfigs: [],
          cellSummaries: [],
          busbarSummary: null,
          busBridgeSummary: null,
          busBridgeSummaries: [],
          busBridges: [],
        });
      },

      // Методы для управления сводками
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
          // Проверяем, изменились ли данные
          if (JSON.stringify(state.busBridgeSummary) === JSON.stringify(summary)) {
            return state;
          }
          return { busBridgeSummary: summary };
        }),

      setBusBridgeSummaries: (summaries) => set((state) => ({ 
        busBridgeSummaries: typeof summaries === 'function' ? summaries(state.busBridgeSummaries) : summaries 
      })),
    }),
    {
      name: 'runn-storage',
      partialize: (state) => ({
        global: state.global,
        cellConfigs: state.cellConfigs,
        // Теперь сохраняем и сводки ячеек, чтобы после перезагрузки были цены
        cellSummaries: state.cellSummaries,
        busbarSummary: state.busbarSummary,
        busBridgeSummary: state.busBridgeSummary,
        busBridgeSummaries: state.busBridgeSummaries,
      }),
      // Отключаем persist для cellSummaries, но позволяем гидратацию остального состояния
    }
  )
);
