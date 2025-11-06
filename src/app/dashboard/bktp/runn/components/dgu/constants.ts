// Данные таблицы кабелей ДГУ
export interface DguCableSpec {
  type: string;
  powerRangeKva: {
    min: number;
    max: number;
  };
  currentAmps: number;
  cableSpec: string;
}

export const DGU_CABLE_SPECS: DguCableSpec[] = [
  {
    type: 'ДГУ',
    powerRangeKva: { min: 100, max: 150 },
    currentAmps: 326,
    cableSpec: 'ВВГнг 1х120',
  },
  {
    type: 'ДГУ',
    powerRangeKva: { min: 200, max: 250 },
    currentAmps: 512,
    cableSpec: 'ВВГнг 1х240',
  },
  {
    type: 'ДГУ',
    powerRangeKva: { min: 300, max: 400 },
    currentAmps: 652,
    cableSpec: 'ВВГнг 2х(1х120)',
  },
  {
    type: 'ДГУ',
    powerRangeKva: { min: 450, max: 650 },
    currentAmps: 1024,
    cableSpec: 'ВВГнг 2х(1х240)',
  },
  {
    type: 'ДГУ',
    powerRangeKva: { min: 700, max: 850 },
    currentAmps: 1370,
    cableSpec: 'ВВГнг 2х(1х400)',
  },
  {
    type: 'ДГУ',
    powerRangeKva: { min: 900, max: 1350 },
    currentAmps: 2055,
    cableSpec: 'ВВГнг 3х(1х400)',
  },
];

export const SWITCHING_DEVICE_OPTIONS = ['Воздушный', 'Литой корпус', 'Литой корпус + Рубильник', 'РПС'];

