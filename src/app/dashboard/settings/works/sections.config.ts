import {
  Building2, Zap, Battery, Wrench,
  BotIcon, FlaskConical, Truck, Briefcase,
} from 'lucide-react';
import type { SectionDef } from './types';

// ─────────────────────────────────────────────────────────────────────────────
//  Чтобы добавить новую секцию:
//    1. Добавь ключи в useWorkPricesStore (WorkPricesValues + defaultWorkPrices)
//    2. Добавь запись в этот массив — больше ничего трогать не нужно
// ─────────────────────────────────────────────────────────────────────────────

export const SECTIONS: SectionDef[] = [
  // 1. Монтаж БМЗ
  {
    id: 'bmz',
    title: 'Монтаж',
    subtitle: 'Монтаж БМЗ, блоки и контуры заземления',
    icon: Building2,
    badge: 'bg-blue-50 border-blue-200 text-blue-600',
    fields: [
      { key: 'bmzPriceUpTo6Blocks',          label: 'Монтаж блока (до 6 шт.)',             note: 'за блок' },
      { key: 'bmzPriceOver6Blocks',           label: 'Монтаж блока (свыше 6 шт.)',          note: 'за блок' },
      { key: 'bmzExternalGroundingPerMeter',  label: 'Внешний контур заземления ТП',        note: 'за 1 м' },
      { key: 'bmzInternalGroundingPerKit',    label: 'Внутренний контур (БМЗ по проекту)',  note: 'компл.' },
      { key: 'bmzCableRacks',                 label: 'Монтаж кабельных стоек и полок',      note: 'объект' },
    ],
  },

  // 2. РУ 10/20 (РУСН)
  {
    id: 'rusn',
    title: 'РУ 10/20',
    subtitle: 'Ячейки, шинные мосты, трансформаторный узел',
    icon: Zap,
    badge: 'bg-red-50 border-red-200 text-red-600',
    fields: [
      { key: 'rusnPriceUpTo6Cells',            label: 'РУ-10/20 кВ с ШРЗ (до 6 ячеек)',       note: 'ячейка' },
      { key: 'rusnPrice6To8Cells',             label: 'РУ-10/20 кВ с ШРЗ (6–8 ячеек)',        note: 'ячейка' },
      { key: 'rusnPriceOver8Cells',            label: 'Каждая ячейка свыше 8',                 note: 'ячейка' },
      { key: 'rusnBusBridgePrice',             label: 'Шинный мост (монтаж и изготовление)',   note: '1 шт.' },
      { key: 'rusnBusBridgeInstallationPrice', label: 'Установка шинного моста',               note: '1 шт.' },
      { key: 'rusnTransformerUnitPrice',       label: 'Узел силового трансформатора 10/20 кВ', note: '1 шт.' },
    ],
  },

  // 3. РУ 0,4 кВ — панели, ШМ, узел ТТ (шина МТ и АД), одна карточка
  {
    id: 'runn',
    title: 'РУ 0.4',
    subtitle:
      'Панели и монтаж РУ-0,4 кВ, установка ШМ; узел ТТ — шина МТ и шина АД (10×100 / 10×120 / 10×160)',
    icon: Battery,
    badge: 'bg-green-50 border-green-200 text-green-600',
    fields: [
      { key: 'runnInstallInBuildingNoMount', label: 'Установка в здание (если нет монтажа)', note: 'за панель' },
      { key: 'runnMountRu04UpTo7PerPanel', label: 'Монтаж РУ-0,4 кВ до 7 панелей', note: 'за панель' },
      { key: 'runnMountRu048To9PerPanel', label: 'Свыше 7 до 9 панелей', note: 'за панель' },
      { key: 'runnMountRu04Over9PerPanel', label: 'Каждая панель свыше 9', note: 'за панель' },
      { key: 'runnShmInstallation', label: 'Установка ШМ', note: '1 шт.' },
      { key: 'runnUnitMt10x100Single', label: 'Узел ТТ, шина МТ — 10×100, одинарная', note: '1 шт.' },
      { key: 'runnUnitMt10x100Double', label: 'Узел ТТ, шина МТ — 10×100, двойная', note: '1 шт.' },
      { key: 'runnUnitMt10x100Triple', label: 'Узел ТТ, шина МТ — 10×100, тройная', note: '1 шт.' },
      { key: 'runnUnitMt10x120Single', label: 'Узел ТТ, шина МТ — 10×120, одинарная', note: '1 шт.' },
      { key: 'runnUnitMt10x120Double', label: 'Узел ТТ, шина МТ — 10×120, двойная', note: '1 шт.' },
      { key: 'runnUnitMt10x120Triple', label: 'Узел ТТ, шина МТ — 10×120, тройная', note: '1 шт.' },
      { key: 'runnUnitMt10x160Single', label: 'Узел ТТ, шина МТ — 10×160, одинарная', note: '1 шт.' },
      { key: 'runnUnitMt10x160Double', label: 'Узел ТТ, шина МТ — 10×160, двойная', note: '1 шт.' },
      { key: 'runnUnitMt10x160Triple', label: 'Узел ТТ, шина МТ — 10×160, тройная', note: '1 шт.' },
      { key: 'runnUnitAd10x100Single', label: 'Узел ТТ, шина АД — 10×100, одинарная', note: '1 шт.' },
      { key: 'runnUnitAd10x100Double', label: 'Узел ТТ, шина АД — 10×100, двойная', note: '1 шт.' },
      { key: 'runnUnitAd10x100Triple', label: 'Узел ТТ, шина АД — 10×100, тройная', note: '1 шт.' },
      { key: 'runnUnitAd10x120Single', label: 'Узел ТТ, шина АД — 10×120, одинарная', note: '1 шт.' },
      { key: 'runnUnitAd10x120Double', label: 'Узел ТТ, шина АД — 10×120, двойная', note: '1 шт.' },
      { key: 'runnUnitAd10x120Triple', label: 'Узел ТТ, шина АД — 10×120, тройная', note: '1 шт.' },
      { key: 'runnUnitAd10x160Single', label: 'Узел ТТ, шина АД — 10×160, одинарная', note: '1 шт.' },
      { key: 'runnUnitAd10x160Double', label: 'Узел ТТ, шина АД — 10×160, двойная', note: '1 шт.' },
      { key: 'runnUnitAd10x160Triple', label: 'Узел ТТ, шина АД — 10×160, тройная', note: '1 шт.' },
    ],
    layoutBlocks: [
      {
        kind: 'full',
        keys: [
          'runnInstallInBuildingNoMount',
          'runnMountRu04UpTo7PerPanel',
          'runnMountRu048To9PerPanel',
          'runnMountRu04Over9PerPanel',
          'runnShmInstallation',
        ],
      },
      {
        kind: 'split',
        leftTitle: 'Шина МТ',
        left: [
          'runnUnitMt10x100Single',
          'runnUnitMt10x100Double',
          'runnUnitMt10x100Triple',
          'runnUnitMt10x120Single',
          'runnUnitMt10x120Double',
          'runnUnitMt10x120Triple',
          'runnUnitMt10x160Single',
          'runnUnitMt10x160Double',
          'runnUnitMt10x160Triple',
        ],
        rightTitle: 'Шина АД',
        right: [
          'runnUnitAd10x100Single',
          'runnUnitAd10x100Double',
          'runnUnitAd10x100Triple',
          'runnUnitAd10x120Single',
          'runnUnitAd10x120Double',
          'runnUnitAd10x120Triple',
          'runnUnitAd10x160Single',
          'runnUnitAd10x160Double',
          'runnUnitAd10x160Triple',
        ],
      },
    ],
  },

  // 4. Трансформаторы (монтаж и демонтаж)
  {
    id: 'transformer',
    title: 'ТР',
    subtitle: 'Монтаж и демонтаж трансформатора по мощности',
    icon: Wrench,
    badge: 'bg-yellow-50 border-yellow-200 text-yellow-600',
    fields: [
      { key: 'transformerPrice630', label: 'Монтаж — мощность до 630 кВА', note: '1 шт.' },
      { key: 'transformerPrice1000', label: 'Монтаж — мощность 1 000–1 600 кВА', note: '1 шт.' },
      { key: 'transformerPrice2500', label: 'Монтаж — мощность 2 500–3 150 кВА', note: '1 шт.' },
      { key: 'transformerDismantlePrice630', label: 'Демонтаж — мощность до 630 кВА', note: '1 шт.' },
      { key: 'transformerDismantlePrice1000', label: 'Демонтаж — мощность 1 000–1 600 кВА', note: '1 шт.' },
      { key: 'transformerDismantlePrice2500', label: 'Демонтаж — мощность 2 500–3 150 кВА', note: '1 шт.' },
    ],
  },

  // 5. ЛАБ (+ монтаж фундамента АС)
  {
    id: 'lab',
    title: 'ЛАБ',
    subtitle: 'Включение, расчёт уставок, испытания; монтаж фундамента (с материалами, АС)',
    icon: FlaskConical,
    badge: 'bg-cyan-50 border-cyan-200 text-cyan-600',
    fields: [
      { key: 'labKtpTpRpSwitchOn', label: 'Включение КТП/ТП/РП', note: 'цена за ед.' },
      { key: 'labRelaySettingsCalculation', label: 'Расчёт уставок РЗ', note: 'цена за ед.' },
      { key: 'labComprehensiveTestTwoTransformer', label: 'Комплексное испытание (двухтрансформаторное)', note: 'цена за ед.' },
      {
        key: 'foundationPricePerM2',
        label: 'Монтаж фундамента (с материалами)',
        note: 'за 1 м²',
      },
    ],
  },

  // 6. ДГУ — монтаж, кабель и панели (одна карточка)
  {
    id: 'dgu',
    title: 'ДГУ',
    subtitle: 'Монтаж по мощности, кабель (проверьте суммы по смете), панели за комплект',
    icon: BotIcon,
    badge: 'bg-slate-50 border-slate-200 text-slate-600',
    fields: [
      { key: 'dguCableUpTo300', label: 'Кабель — до 300 кВА', note: '1 шт.' },
      { key: 'dguCable300To500', label: 'Кабель — от 300 до 500 кВА', note: '1 шт.' },
      { key: 'dguCable500To750', label: 'Кабель — от 500 до 750 кВА', note: '1 шт.' },
      { key: 'dguCable750To1000', label: 'Кабель — от 750 до 1000 кВА', note: '1 шт.' },
      { key: 'dguCable1000To2000', label: 'Кабель — от 1000 до 2000 кВА', note: '1 шт.' },
      { key: 'dguInstallUpTo300', label: 'Монтаж — до 300 кВА', note: '1 шт.' },
      { key: 'dguInstall300To500', label: 'Монтаж — от 300 до 500 кВА', note: '1 шт.' },
      { key: 'dguInstall500To750', label: 'Монтаж — от 500 до 750 кВА', note: '1 шт.' },
      { key: 'dguInstall750To1000', label: 'Монтаж — от 750 до 1000 кВА', note: '1 шт.' },
      { key: 'dguInstall1000To2000', label: 'Монтаж — от 1000 до 2000 кВА', note: '1 шт.' },
      { key: 'dguPanelsPerSet', label: 'Панели ДГУ', note: 'комплект' },
    ],
    layoutBlocks: [
      {
        kind: 'split',
        leftTitle: 'Кабель',
        left: [
          'dguCableUpTo300',
          'dguCable300To500',
          'dguCable500To750',
          'dguCable750To1000',
          'dguCable1000To2000',
        ],
        rightTitle: 'Монтаж',
        right: [
          'dguInstallUpTo300',
          'dguInstall300To500',
          'dguInstall500To750',
          'dguInstall750To1000',
          'dguInstall1000To2000',
        ],
      },
      {
        kind: 'full',
        keys: ['dguPanelsPerSet'],
      },
    ],
  },

  // 7. Логистика при монтаже оборудования
  {
    id: 'logistics',
    title: 'Логистика',
    subtitle: 'При монтаже оборудования (тарифы за смену / рейс / час)',
    icon: Truck,
    badge: 'bg-orange-50 border-orange-200 text-orange-600',
    fields: [
      { key: 'logisticsCraneShiftLoading', label: 'Кран (смена) — погрузка', note: 'за смену' },
      { key: 'logisticsLowLoaderBmzKtpTrip', label: 'Трал (для БМЗ или КТП)', note: 'за 1 рейс' },
      { key: 'logisticsLongBedTruckTrip', label: 'Длинномер', note: 'за 1 рейс' },
      { key: 'logisticsManipulatorHourUnloading', label: 'Манипулятор — выгрузка', note: 'за 1 ч (мин. 3 ч)' },
    ],
  },

  // 8. Командировочные (суточные = МРП × множитель — computed поле)
  {
    id: 'travel',
    title: 'Командировочные',
    subtitle: 'МРП, суточные, проживание, транспорт',
    icon: Briefcase,
    badge: 'bg-purple-50 border-purple-200 text-purple-600',
    fields: [
      { key: 'mrp',                      label: 'МРП',                       note: 'тг' },
      {
        key: 'dailyAllowanceMultiplier',
        label: 'Кол-во МРП для суточных',
        note: 'множитель',
        inputSuffix: null,
      },
      {
        key: 'mrp', // ключ не используется (computed)
        label: 'Суточные (МРП × множитель)',
        note: 'авторасчёт',
        computed: (local) =>
          (Number(local['mrp']) || 0) * (Number(local['dailyAllowanceMultiplier']) || 0),
      },
      { key: 'accommodationPerDay', label: 'Проживание / аренда в сутки', note: 'сутки' },
      { key: 'transportExpenses',   label: 'Транспортные расходы',        note: '1 рейс' },
    ],
  },
];
