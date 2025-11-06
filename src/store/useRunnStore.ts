import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
  // Добавляем поля для сводок как в РУСН
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
  setBusBridgeMaterial: (material: BusMaterial) => void;
  setBusBridges: (bridges: BusbarBridge[]) => void;
  toggleBusbar: (enabled: boolean) => void;
  toggleBusBridge: (enabled: boolean) => void;
  reset: () => void;
  
  // Методы для управления сводками
  setCellSummary: (summary: RunnCellSummary) => void;
  removeCellSummary: (cellId: string) => void;
  clearCellSummaries: () => void;
  setBusbarSummary: (summary: RunnBusbarSummary) => void;
  setBusBridgeSummary: (summary: RunnBusbarSummary) => void;
  setBusBridgeSummaries: (summaries: RunnBusbarSummary[]) => void;
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
        },
        busBridge: {
          enabled: false,
          material: null,
          bridges: [],
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
              ...(state.global.busbar || { enabled: false, material: null }),
              material 
            },
          },
        })),

      setBusBridgeMaterial: (material) =>
        set((state) => ({
          global: {
            ...state.global,
            busBridge: { 
              ...(state.global.busBridge || { enabled: false, material: null, bridges: [] }),
              material 
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

      reset: () => {
        console.log('RunnStore reset called - this will clear cellSummaries!');
        // Очищаем localStorage для шинных мостов
        localStorage.removeItem('busbar-bridges');
        
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
            },
            busBridge: {
              enabled: false,
              material: null,
              bridges: [],
            },
          },
          cellConfigs: [],
          cellSummaries: [],
          busbarSummary: null,
          busBridgeSummary: null,
          busBridgeSummaries: [],
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
