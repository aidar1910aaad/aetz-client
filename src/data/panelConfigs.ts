// Конфигурации панелей с массами ячеек в кг
export interface PanelConfig {
  type: string;
  power: number;
  current: number;
  group: string;
  busbar: string;
  cells: {
    name: string;
    weight: number;
  }[];
}

export const panelConfigs: PanelConfig[] = [
  {
    type: "Панель ЩО-70",
    power: 2000,
    current: 3610,
    group: "МТ2",
    busbar: "100x10",
    cells: [
      { name: "Ввод", weight: 208 },
      { name: "СВ", weight: 267 },
      { name: "ОТХ", weight: 47 },
      { name: "УСТ", weight: 12 },
      { name: "Шинный мост", weight: 40 }
    ]
  },
  {
    type: "Панель ЩО-70",
    power: 400,
    current: 870,
    group: "АД",
    busbar: "60x6",
    cells: [
      { name: "Ввод", weight: 69 },
      { name: "СВ", weight: 89 },
      { name: "ОТХ", weight: 16 },
      { name: "УСТ", weight: 18 },
      { name: "Шинный мост", weight: 6 }
    ]
  },
  {
    type: "Панель ЩО-70",
    power: 1250,
    current: 2070,
    group: "АД",
    busbar: "120x10",
    cells: [
      { name: "Ввод", weight: 18 },
      { name: "СВ", weight: 23 },
      { name: "ОТХ", weight: 4 },
      { name: "УСТ", weight: 6 },
      { name: "Шинный мост", weight: 18 }
    ]
  },
  {
    type: "Панель ЩО-70",
    power: 1600,
    current: 2860,
    group: "АД2",
    busbar: "100x10",
    cells: [
      { name: "Ввод", weight: 370 },
      { name: "СВ", weight: 476 },
      { name: "ОТХ", weight: 84 },
      { name: "УСТ", weight: 18 },
      { name: "Шинный мост", weight: 118 }
    ]
  },
  {
    type: "Панель ЩО-70",
    power: 100,
    current: 625,
    group: "МТ",
    busbar: "40x4",
    cells: [
      { name: "Ввод", weight: 6 },
      { name: "СВ", weight: 8 },
      { name: "ОТХ", weight: 2 },
      { name: "УСТ", weight: 6 },
      { name: "Шинный мост", weight: 124 }
    ]
  },
  {
    type: "Панель ЩО-70",
    power: 160,
    current: 480,
    group: "АД",
    busbar: "40x4",
    cells: [
      { name: "Ввод", weight: 6 },
      { name: "СВ", weight: 8 },
      { name: "ОТХ", weight: 2 },
      { name: "УСТ", weight: 6 },
      { name: "Шинный мост", weight: 6 }
    ]
  },
  {
    type: "Панель ЩО-70",
    power: 25,
    current: 625,
    group: "МТ",
    busbar: "40x4",
    cells: [
      { name: "Ввод", weight: 26 },
      { name: "СВ", weight: 33 },
      { name: "ОТХ", weight: 6 },
      { name: "УСТ", weight: 37 },
      { name: "Шинный мост", weight: 9 }
    ]
  },
  {
    type: "Панель ЩО-70",
    power: 40,
    current: 625,
    group: "МТ",
    busbar: "40x4",
    cells: [
      { name: "Ввод", weight: 247 },
      { name: "СВ", weight: 317 },
      { name: "ОТХ", weight: 56 },
      { name: "УСТ", weight: 104 },
      { name: "Шинный мост", weight: 79 }
    ]
  },
  {
    type: "Панель ЩО-70",
    power: 3150,
    current: 5200,
    group: "МТ3",
    busbar: "120x10",
    cells: [
      { name: "Ввод", weight: 6 },
      { name: "СВ", weight: 8 },
      { name: "ОТХ", weight: 2 },
      { name: "УСТ", weight: 6 },
      { name: "Шинный мост", weight: 66 }
    ]
  },
  {
    type: "Панель ЩО-70",
    power: 63,
    current: 625,
    group: "МТ",
    busbar: "40x4",
    cells: [
      { name: "Ввод", weight: 35 },
      { name: "СВ", weight: 45 },
      { name: "ОТХ", weight: 8 },
      { name: "УСТ", weight: 21 },
      { name: "Шинный мост", weight: 18 }
    ]
  },
  {
    type: "Панель ЩО-70",
    power: 2500,
    current: 4100,
    group: "АД3",
    busbar: "120x10",
    cells: [
      { name: "Ввод", weight: 18 },
      { name: "СВ", weight: 23 },
      { name: "ОТХ", weight: 4 },
      { name: "УСТ", weight: 6 },
      { name: "Шинный мост", weight: 18 }
    ]
  },
  {
    type: "Панель ЩО-70",
    power: 63,
    current: 480,
    group: "АД",
    busbar: "40x4",
    cells: [
      { name: "Ввод", weight: 6 },
      { name: "СВ", weight: 8 },
      { name: "ОТХ", weight: 2 },
      { name: "УСТ", weight: 6 },
      { name: "Шинный мост", weight: 6 }
    ]
  },
  {
    type: "Панель ЩО-70",
    power: 1600,
    current: 2650,
    group: "МТ",
    busbar: "120x10",
    cells: [
      { name: "Ввод", weight: 6 },
      { name: "СВ", weight: 8 },
      { name: "ОТХ", weight: 2 },
      { name: "УСТ", weight: 6 },
      { name: "Шинный мост", weight: 66 }
    ]
  },
  {
    type: "Панель ЩО-70",
    power: 25,
    current: 480,
    group: "АД",
    busbar: "40x4",
    cells: [
      { name: "Ввод", weight: 6 },
      { name: "СВ", weight: 8 },
      { name: "ОТХ", weight: 2 },
      { name: "УСТ", weight: 6 },
      { name: "Шинный мост", weight: 6 }
    ]
  },
  {
    type: "Панель ЩО-70",
    power: 100,
    current: 480,
    group: "АД",
    busbar: "40x4",
    cells: [
      { name: "Ввод", weight: 6 },
      { name: "СВ", weight: 8 },
      { name: "ОТХ", weight: 2 },
      { name: "УСТ", weight: 6 },
      { name: "Шинный мост", weight: 6 }
    ]
  },
  {
    type: "Панель ЩО-70",
    power: 400,
    current: 860,
    group: "МТ",
    busbar: "50x5",
    cells: [
      { name: "Ввод", weight: 6 },
      { name: "СВ", weight: 8 },
      { name: "ОТХ", weight: 2 },
      { name: "УСТ", weight: 6 },
      { name: "Шинный мост", weight: 66 }
    ]
  },
  {
    type: "Панель ЩО-70",
    power: 630,
    current: 1125,
    group: "МТ",
    busbar: "60x6",
    cells: [
      { name: "Ввод", weight: 6 },
      { name: "СВ", weight: 8 },
      { name: "ОТХ", weight: 2 },
      { name: "УСТ", weight: 6 },
      { name: "Шинный мост", weight: 35 }
    ]
  },
  {
    type: "Панель ЩО-70",
    power: 250,
    current: 665,
    group: "АД",
    busbar: "50x5",
    cells: [
      { name: "Ввод", weight: 6 },
      { name: "СВ", weight: 8 },
      { name: "ОТХ", weight: 2 },
      { name: "УСТ", weight: 6 },
      { name: "Шинный мост", weight: 21 }
    ]
  },
  {
    type: "Панель ЩО-70",
    power: 2500,
    current: 4100,
    group: "МТ2",
    busbar: "120x10",
    cells: [
      { name: "Ввод", weight: 18 },
      { name: "СВ", weight: 23 },
      { name: "ОТХ", weight: 4 },
      { name: "УСТ", weight: 6 },
      { name: "Шинный мост", weight: 18 }
    ]
  },
  {
    type: "Панель ЩО-70",
    power: 1250,
    current: 2310,
    group: "МТ",
    busbar: "100x10",
    cells: [
      { name: "Ввод", weight: 6 },
      { name: "СВ", weight: 8 },
      { name: "ОТХ", weight: 2 },
      { name: "УСТ", weight: 6 },
      { name: "Шинный мост", weight: 18 }
    ]
  },
  {
    type: "Панель ЩО-70",
    power: 2000,
    current: 3200,
    group: "АД2",
    busbar: "120x10",
    cells: [
      { name: "Ввод", weight: 18 },
      { name: "СВ", weight: 23 },
      { name: "ОТХ", weight: 4 },
      { name: "УСТ", weight: 6 },
      { name: "Шинный мост", weight: 18 }
    ]
  },
  {
    type: "Панель ЩО-70",
    power: 40,
    current: 480,
    group: "АД",
    busbar: "40x4",
    cells: [
      { name: "Ввод", weight: 6 },
      { name: "СВ", weight: 8 },
      { name: "ОТХ", weight: 2 },
      { name: "УСТ", weight: 6 },
      { name: "Шинный мост", weight: 6 }
    ]
  },
  {
    type: "Панель ЩО-70",
    power: 1000,
    current: 1690,
    group: "МТ",
    busbar: "80x8",
    cells: [
      { name: "Ввод", weight: 6 },
      { name: "СВ", weight: 8 },
      { name: "ОТХ", weight: 2 },
      { name: "УСТ", weight: 6 },
      { name: "Шинный мост", weight: 18 }
    ]
  },
  {
    type: "Панель ЩО-70",
    power: 1000,
    current: 1820,
    group: "АД",
    busbar: "100x10",
    cells: [
      { name: "Ввод", weight: 6 },
      { name: "СВ", weight: 8 },
      { name: "ОТХ", weight: 2 },
      { name: "УСТ", weight: 6 },
      { name: "Шинный мост", weight: 18 }
    ]
  },
  {
    type: "Панель ЩО-70",
    power: 630,
    current: 1320,
    group: "АД",
    busbar: "80x8",
    cells: [
      { name: "Ввод", weight: 6 },
      { name: "СВ", weight: 8 },
      { name: "ОТХ", weight: 2 },
      { name: "УСТ", weight: 6 },
      { name: "Шинный мост", weight: 18 }
    ]
  },
  {
    type: "Панель ЩО-70",
    power: 250,
    current: 625,
    group: "МТ",
    busbar: "40x4",
    cells: [
      { name: "Ввод", weight: 6 },
      { name: "СВ", weight: 8 },
      { name: "ОТХ", weight: 2 },
      { name: "УСТ", weight: 6 },
      { name: "Шинный мост", weight: 6 }
    ]
  },
  {
    type: "Панель ЩО-70",
    power: 160,
    current: 625,
    group: "МТ",
    busbar: "40x4",
    cells: [
      { name: "Ввод", weight: 6 },
      { name: "СВ", weight: 8 },
      { name: "ОТХ", weight: 2 },
      { name: "УСТ", weight: 6 },
      { name: "Шинный мост", weight: 6 }
    ]
  }
];