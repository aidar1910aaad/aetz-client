// Конфигурация для автоматического оборудования
export interface EquipmentConfig {
  id: string;
  title: string;
  type: 'single' | 'dropdown';
  defaultCount: number;
  filterFn: (calc: any) => boolean;
  defaultSelectionFn?: (calculations: any[]) => any;
  sortFn?: (a: any, b: any) => number;
}

export const EQUIPMENT_CONFIGS: EquipmentConfig[] = [
  {
    id: 'shkn',
    title: 'Шкаф собственных нужд (ШСН)',
    type: 'dropdown',
    defaultCount: 1,
    filterFn: (calc) => 
      (calc.name.includes('ШСН') || calc.name.includes('собственных нужд')) &&
      !calc.name.includes('АСКУЭ') &&
      !calc.name.includes('ШСН с АВР'),
    defaultSelectionFn: (calculations) => 
      calculations.find(calc => calc.name.includes('Сайман')),
  },
  {
    id: 'shkn-avr',
    title: 'ШСН с АВР',
    type: 'single',
    defaultCount: 1,
    filterFn: (calc) => calc.name.includes('ШСН с АВР'),
  },
  {
    id: 'shkziao',
    title: 'Шкаф технологической защиты и автоматического обдува (ШТЗиАО)',
    type: 'single',
    defaultCount: 2,
    filterFn: (calc) => calc.name.includes('ШТЗиАО'),
  },
  {
    id: 'shkaf-pitaniya',
    title: 'Шкаф питания оперативного тока цепей РЗА',
    type: 'dropdown',
    defaultCount: 1,
    filterFn: (calc) => 
      calc.name.includes('ШРЗ') || calc.name.includes('ШУОТ'),
    defaultSelectionFn: (calculations) => 
      calculations.find(calc => calc.name.includes('ШРЗ') && calc.name.includes('без UPS')),
    sortFn: (a, b) => {
      // Сначала ШРЗ без UPS
      if (a.name.includes('ШРЗ') && a.name.includes('без UPS')) return -1;
      if (b.name.includes('ШРЗ') && b.name.includes('без UPS')) return 1;
      
      // Потом ШРЗ с UPS
      if (a.name.includes('ШРЗ') && a.name.includes('с UPS')) return -1;
      if (b.name.includes('ШРЗ') && b.name.includes('с UPS')) return 1;
      
      // Потом ШУОТ 65
      if (a.name.includes('ШУОТ 65')) return -1;
      if (b.name.includes('ШУОТ 65')) return 1;
      
      // Потом ШУОТ 100
      if (a.name.includes('ШУОТ 100')) return -1;
      if (b.name.includes('ШУОТ 100')) return 1;
      
      // Потом ШУОТ 120
      if (a.name.includes('ШУОТ 120')) return -1;
      if (b.name.includes('ШУОТ 120')) return 1;
      
      return a.name.localeCompare(b.name);
    },
  },
  {
    id: 'ops',
    title: 'Шкаф охранно пожарной сигнализации (ОПС)',
    type: 'single',
    defaultCount: 2,
    filterFn: (calc) => calc.name.includes('ОПС'),
  },
  {
    id: 'askue',
    title: 'АСКУЭ (Сайман/Меркурий/Миртек)',
    type: 'single',
    defaultCount: 1,
    filterFn: (calc) => calc.name.includes('АСКУЭ'),
  },
  {
    id: 'tm',
    title: 'Шкаф телемеханики (ТМ)',
    type: 'single',
    defaultCount: 1,
    filterFn: (calc) => calc.name.includes('ТМ') || calc.name.includes('телемеханики'),
  },
  {
    id: 'vospd',
    title: 'Шкаф волоконно-оптические системы передачи данных (ВОСПД)',
    type: 'single',
    defaultCount: 2,
    filterFn: (calc) => calc.name.includes('ВОСПД') || calc.name.includes('волоконно-оптические'),
  },
  {
    id: 'shzl',
    title: 'Шкаф защиты линии ШЗЛ',
    type: 'single',
    defaultCount: 0,
    filterFn: (calc) => calc.name.includes('ШЗЛ') || calc.name.includes('защиты линии'),
  },
  {
    id: 'shzt',
    title: 'Шкаф защиты трансформатора ШЗТ',
    type: 'single',
    defaultCount: 0,
    filterFn: (calc) => calc.name.includes('ШЗТ') || calc.name.includes('защиты трансформатора'),
  },
  {
    id: 'shkaf-zhaluzi',
    title: 'Шкаф управления жалюзями',
    type: 'single',
    defaultCount: 0,
    filterFn: (calc) => calc.name.includes('жалюзями') || calc.name.includes('управления жалюзями'),
  },
  {
    id: 'shkaf-ventilyatsiya',
    title: 'Шкаф управления вентиляции',
    type: 'single',
    defaultCount: 0,
    filterFn: (calc) => calc.name.includes('вентиляции') || calc.name.includes('управления вентиляции'),
  },
];