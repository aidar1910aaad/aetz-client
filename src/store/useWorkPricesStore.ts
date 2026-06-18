import { create } from 'zustand';

export interface WorkPricesState {
  // ── 1. Монтаж БМЗ ───────────────────────────────────────────────────────
  bmzPriceUpTo6Blocks: number;
  bmzPriceOver6Blocks: number;
  bmzExternalGroundingPerMeter: number;
  bmzInternalGroundingPerKit: number;
  bmzCableRacks: number;

  // ── 2. РУ 10/20 (РУСН) ─────────────────────────────────────────────────
  rusnPriceUpTo6Cells: number;
  rusnPrice6To8Cells: number;
  rusnPriceOver8Cells: number;
  rusnBusBridgePrice: number;
  rusnBusBridgeInstallationPrice: number;
  rusnTransformerUnitPrice: number;

  // ── 3. РУ 0.4 кВ — панели и ШМ ──────────────────────────────────────────
  runnInstallInBuildingNoMount: number; // Установка в здание (если нет монтажа)
  runnMountRu04UpTo7PerPanel: number;   // Монтаж РУ-0,4 кВ до 7 панелей, за панель
  runnMountRu048To9PerPanel: number;   // Свыше 7 до 9 панелей, за панель
  runnMountRu04Over9PerPanel: number;  // Каждая панель свыше 9, за панель
  runnShmInstallation: number;         // Установка ШМ

  // Узел силового трансформатора 0,4 кВ — шина МТ (10×100 / 10×120 / 10×160 × одн./дв./тр.)
  runnUnitMt10x100Single: number;
  runnUnitMt10x100Double: number;
  runnUnitMt10x100Triple: number;
  runnUnitMt10x120Single: number;
  runnUnitMt10x120Double: number;
  runnUnitMt10x120Triple: number;
  runnUnitMt10x160Single: number;
  runnUnitMt10x160Double: number;
  runnUnitMt10x160Triple: number;

  // Узел силового трансформатора 0,4 кВ — шина АД
  runnUnitAd10x100Single: number;
  runnUnitAd10x100Double: number;
  runnUnitAd10x100Triple: number;
  runnUnitAd10x120Single: number;
  runnUnitAd10x120Double: number;
  runnUnitAd10x120Triple: number;
  runnUnitAd10x160Single: number;
  runnUnitAd10x160Double: number;
  runnUnitAd10x160Triple: number;

  // ── 4. Трансформаторы (монтаж / демонтаж по диапазонам мощности) ─────────
  transformerPrice630: number;
  transformerPrice1000: number;
  transformerPrice2500: number;
  transformerDismantlePrice630: number;
  transformerDismantlePrice1000: number;
  transformerDismantlePrice2500: number;

  // ── 5. ДГУ (монтаж, кабель, панели по диапазонам мощности) ──────────────
  dguInstallUpTo300: number;
  dguInstall300To500: number;
  dguInstall500To750: number;
  dguInstall750To1000: number;
  dguInstall1000To2000: number;
  dguCableUpTo300: number;
  dguCable300To500: number;
  dguCable500To750: number;
  dguCable750To1000: number;
  dguCable1000To2000: number;
  dguPanelsPerSet: number;

  // ── 6. ЛАБ (Лаборатория) ───────────────────────────────────────────────
  labKtpTpRpSwitchOn: number;              // Включение КТП/ТП/РП
  labRelaySettingsCalculation: number;    // Расчёт уставок РЗ
  labComprehensiveTestTwoTransformer: number; // Комплексное испытание (двухтрансформаторное)

  // ── 7. Логистика при монтаже оборудования ────────────────────────────────
  logisticsCraneShiftLoading: number;      // Кран (смена) — погрузка
  logisticsLowLoaderBmzKtpTrip: number;     // Трал (БМЗ/КТП) — за рейс
  logisticsLongBedTruckTrip: number;        // Длинномер — за рейс
  logisticsManipulatorHourUnloading: number; // Манипулятор — выгрузка, за час (мин. 3 ч)

  // ── 8. АС (архитектурно-строительная часть / фундамент по смете) ─────────
  foundationPricePerM2: number; // Монтаж фундамента (с материалами) за м²

  // ── 9. Командировочные ──────────────────────────────────────────────────
  mrp: number;
  dailyAllowanceMultiplier: number;
  accommodationPerDay: number;
  transportExpenses: number;

  // ── Actions ─────────────────────────────────────────────────────────────
  setAll: (values: WorkPricesValues) => void;
  updateMany: (values: Partial<WorkPricesValues>) => void;
  resetToDefaults: () => void;
}

export type WorkPricesValues = Omit<WorkPricesState, 'setAll' | 'updateMany' | 'resetToDefaults'>;
export type PriceKey = keyof WorkPricesValues;

export const defaultWorkPrices: WorkPricesValues = {
  bmzPriceUpTo6Blocks: 55315,
  bmzPriceOver6Blocks: 55315,
  bmzExternalGroundingPerMeter: 6424,
  bmzInternalGroundingPerKit: 446093,
  bmzCableRacks: 160593,

  rusnPriceUpTo6Cells: 60948,
  rusnPrice6To8Cells: 108840,
  rusnPriceOver8Cells: 21770,
  rusnBusBridgePrice: 100130,
  rusnBusBridgeInstallationPrice: 25000,
  rusnTransformerUnitPrice: 108840,

  runnInstallInBuildingNoMount: 10400,
  runnMountRu04UpTo7PerPanel: 51474,
  runnMountRu048To9PerPanel: 51474,
  runnMountRu04Over9PerPanel: 51474,
  runnShmInstallation: 80297,

  runnUnitMt10x100Single: 160593,
  runnUnitMt10x100Double: 258000,
  runnUnitMt10x100Triple: 355000,
  runnUnitMt10x120Single: 270000,
  runnUnitMt10x120Double: 350000,
  runnUnitMt10x120Triple: 410000,
  runnUnitMt10x160Single: 380000,
  runnUnitMt10x160Double: 425000,
  runnUnitMt10x160Triple: 469289,

  runnUnitAd10x100Single: 124906,
  runnUnitAd10x100Double: 201000,
  runnUnitAd10x100Triple: 278000,
  runnUnitAd10x120Single: 290000,
  runnUnitAd10x120Double: 315000,
  runnUnitAd10x120Triple: 340000,
  runnUnitAd10x160Single: 350000,
  runnUnitAd10x160Double: 363000,
  runnUnitAd10x160Triple: 376502,

  transformerPrice630: 64237,
  transformerPrice1000: 85650,
  transformerPrice2500: 107062,
  transformerDismantlePrice630: 64237,
  transformerDismantlePrice1000: 85650,
  transformerDismantlePrice2500: 107062,

  dguInstallUpTo300: 214124,
  dguInstall300To500: 310480,
  dguInstall500To750: 428249,
  dguInstall750To1000: 642373,
  dguInstall1000To2000: 1070622,
  dguCableUpTo300: 85650,
  dguCable300To500: 124182,
  dguCable500To750: 171300,
  dguCable750To1000: 256950,
  dguCable1000To2000: 428249,
  dguPanelsPerSet: 74944,

  labKtpTpRpSwitchOn: 175000,
  labRelaySettingsCalculation: 156000,
  labComprehensiveTestTwoTransformer: 203741,

  logisticsCraneShiftLoading: 220000,
  logisticsLowLoaderBmzKtpTrip: 75000,
  logisticsLongBedTruckTrip: 75000,
  logisticsManipulatorHourUnloading: 25000,

  foundationPricePerM2: 50000,

  mrp: 4325,
  dailyAllowanceMultiplier: 3,
  accommodationPerDay: 30000,
  transportExpenses: 100000,
};

export const useWorkPricesStore = create<WorkPricesState>()(
  (set) => ({
    ...defaultWorkPrices,
    setAll: (values) => set({ ...values }),
    updateMany: (values) => set((state) => ({ ...state, ...values })),
    resetToDefaults: () => set({ ...defaultWorkPrices }),
  })
);
