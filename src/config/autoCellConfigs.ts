// Конфигурация для автоматического создания ячеек
export interface AutoCellConfig {
  materials: {
    breaker?: string[];
    rza?: string[];
    meter?: string[];
    meterFallback?: string[];
    tt?: string[];
    sr?: string[];
    transformerVoltage?: string[];
    transformerPower?: string[];
  };
  count: number;
  useGlobalMeter: boolean;
  useGlobalBreaker?: boolean;
  useGlobalRza?: boolean;
  /** Не создавать автоматически — только по кнопке «Добавить» в таблице ячеек */
  createOnDemand?: boolean;
}

export const autoCellConfigs: Record<string, AutoCellConfig> = {
  'Ввод': {
    materials: {
      breaker: ['AV-12 1250A'],
      rza: ['РС 83 А 2.0', 'РЗиА по току РС 83 А 2.0'],
      meter: [
        'Счетчик э/э Меркурий 234 ART 2 - 00 PR',
        'Счетчик э/э Меркурий 234 ARTM 2  - 00 PBR.G',
        'Счетчик э/э Сайман CA4У-Э712 (3*57,7/100V)',
        'Счетчик э/э Сайман CA4У-Э712'
      ],
      meterFallback: ['234 ART 2', '234 ARTM 2', 'CA4У-Э712', 'Меркурий', 'Сайман'],
      tt: ['ТОЛ-10 200/5', '200/5']
    },
    count: 2,
    useGlobalMeter: true,
    useGlobalBreaker: true,
    useGlobalRza: true
  },
  'Секционный выключатель': {
    materials: {
      breaker: ['AV-12 1250A'],
      rza: ['РС 83 А 2.0', 'РЗиА по току РС 83 А 2.0']
    },
    count: 1,
    useGlobalMeter: false,
    useGlobalBreaker: true,
    useGlobalRza: true
  },
  'Секционный разьединитель': {
    materials: {
      sr: ['РВЗ - 10/630 - III', 'разъединитель']
    },
    count: 1,
    useGlobalMeter: false
  },
  'Трансформаторная': {
    materials: {
      breaker: ['AV-12 1250A'],
      rza: ['РС 83 А 2.0', 'РЗиА по току РС 83 А 2.0'],
      meter: [
        'Счетчик э/э Меркурий 234 ART 2 - 00 PR',
        'Счетчик э/э Меркурий 234 ARTM 2  - 00 PBR.G',
        'Счетчик э/э Сайман CA4У-Э712 (3*57,7/100V)',
        'Счетчик э/э Сайман CA4У-Э712'
      ],
      meterFallback: ['234 ART 2', '234 ARTM 2', 'CA4У-Э712', 'Меркурий', 'Сайман'],
      tt: ['ТОЛ-10 200/5', '200/5']
    },
    // КСО А12-10 / А17-20 / КМ1-АФ: по умолчанию 2 (как вводная)
    count: 2,
    useGlobalMeter: true,
    useGlobalBreaker: true,
    useGlobalRza: true
  },
  'Трансформатор напряжения': {
    materials: {
      transformerVoltage: ['3*3НОЛП-10кВ', '3НОЛП-10кВ', 'НОЛП-10кВ'],
      rza: ['РЗиА по напряжению РС83 В1', 'РС83 В1', 'РС83']
    },
    count: 1,
    useGlobalMeter: false,
    useGlobalBreaker: false,
    useGlobalRza: false
  },
  'ТН с ЗСШ': {
    materials: {
      transformerVoltage: ['3*3НОЛП-10кВ', '3НОЛП-10кВ', 'НОЛП-10кВ'],
      rza: ['РЗиА по напряжению РС83 В1', 'РС83 В1', 'РС83']
    },
    count: 1,
    useGlobalMeter: false,
    useGlobalBreaker: false,
    useGlobalRza: false
  },
  'Трансформатор собственных нужд': {
    materials: {
      transformerPower: ['ТСН-10/0,4', 'ТСН', 'трансформатор собственных нужд']
    },
    count: 2,
    useGlobalMeter: false,
    useGlobalBreaker: false,
    useGlobalRza: false
  },
  'Отходящая': {
    materials: {
      breaker: ['AV-12 1250A'],
      rza: ['РС 83 А 2.0', 'РЗиА по току РС 83 А 2.0'],
      meter: [
        'Счетчик э/э Меркурий 234 ART 2 - 00 PR',
        'Счетчик э/э Меркурий 234 ARTM 2  - 00 PBR.G',
        'Счетчик э/э Сайман CA4У-Э712 (3*57,7/100V)',
        'Счетчик э/э Сайман CA4У-Э712'
      ],
      meterFallback: ['234 ART 2', '234 ARTM 2', 'CA4У-Э712', 'Меркурий', 'Сайман'],
      tt: ['ТОЛ-10 200/5', '200/5']
    },
    count: 2,
    useGlobalMeter: true,
    useGlobalBreaker: true,
    useGlobalRza: true
  },
  'Камера Siemens 8DJH': {
    materials: {},
    count: 1,
    useGlobalMeter: false,
    useGlobalBreaker: false,
    useGlobalRza: false
  },
  'Кабельная перемычка': {
    materials: {},
    count: 1,
    useGlobalMeter: false,
    useGlobalBreaker: false,
    useGlobalRza: false
  },
  'Изоляционный адаптер': {
    materials: {},
    count: 4,
    useGlobalMeter: false,
    useGlobalBreaker: false,
    useGlobalRza: false
  },
  'Заземление сборных шин': {
    materials: {},
    count: 2,
    useGlobalMeter: false,
    useGlobalBreaker: false,
    useGlobalRza: false,
    createOnDemand: true,
  }
};


