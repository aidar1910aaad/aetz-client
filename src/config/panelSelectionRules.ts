/**
 * Правила выбора панелей ЩО для ячеек ввода РУНН
 * в зависимости от номинала автомата выкатного
 */

export interface PanelSelectionRule {
  /** Минимальный номинал автомата в амперах */
  minCurrent: number;
  /** Максимальный номинал автомата в амперах */
  maxCurrent: number;
  /** Название панели для данного диапазона */
  panelName: string;
  /** Описание панели */
  description: string;
  /** Глубина корпуса в мм */
  caseDepth: number;
}

/**
 * Правила выбора панелей для ячеек ввода РУНН
 * на основе номинала автомата выкатного
 */
export const RUNN_INPUT_PANEL_RULES: PanelSelectionRule[] = [
  {
    minCurrent: 630,
    maxCurrent: 630,
    panelName: "Панель ЩО 70-32 С У3 (вводная)",
    description: "Панель для автомата выкатного 630А",
    caseDepth: 600
  },
  {
    minCurrent: 1000,
    maxCurrent: 1000,
    panelName: "Панель ЩО 70-42 С У3 (вводная)",
    description: "Панель для автомата выкатного 1000А",
    caseDepth: 600
  },
  {
    minCurrent: 1600,
    maxCurrent: 1600,
    panelName: "Панель ЩО 70-44 С У3 (вводная)",
    description: "Панель для автомата выкатного 1600А",
    caseDepth: 600
  },
  {
    minCurrent: 2000,
    maxCurrent: 2000,
    panelName: "Панель ЩО 70-48 С У3 (вводная)",
    description: "Панель для автомата выкатного 2000А",
    caseDepth: 600
  },
  {
    minCurrent: 2500,
    maxCurrent: 2500,
    panelName: "Панель ЩО 70-62 С У3 (вводная)",
    description: "Панель для автомата выкатного 2500А",
    caseDepth: 700
  },
  {
    minCurrent: 3200,
    maxCurrent: 3200,
    panelName: "Панель ЩО 70-64 С У3 (вводная)",
    description: "Панель для автомата выкатного 3200А",
    caseDepth: 700
  },
  {
    minCurrent: 4000,
    maxCurrent: 4000,
    panelName: "Панель ЩО 70-68 С У3 (вводная)",
    description: "Панель для автомата выкатного 4000А",
    caseDepth: 800
  },
  {
    minCurrent: 5000,
    maxCurrent: 5000,
    panelName: "Панель ЩО 70-69 С У3 (вводная)",
    description: "Панель для автомата выкатного 5000А",
    caseDepth: 800
  },
  {
    minCurrent: 6300,
    maxCurrent: 6300,
    panelName: "Панель ЩО 70-69* С У3 (вводная)",
    description: "Панель для автомата выкатного 6300А",
    caseDepth: 800
  }
];

/**
 * Правила выбора панелей для секционных выключателей РУНН
 */
export const RUNN_SECTION_PANEL_RULES: PanelSelectionRule[] = [
  {
    minCurrent: 630,
    maxCurrent: 630,
    panelName: "Панель ЩО 70-72* У3 (секционная)",
    description: "Панель для секционного выключателя 630А",
    caseDepth: 600
  },
  {
    minCurrent: 1000,
    maxCurrent: 1000,
    panelName: "Панель ЩО 70-72 У3 (секционная)",
    description: "Панель для секционного выключателя 1000А",
    caseDepth: 600
  },
  {
    minCurrent: 1600,
    maxCurrent: 1600,
    panelName: "Панель ЩО 70-73 У3 (секционная)",
    description: "Панель для секционного выключателя 1600А",
    caseDepth: 600
  },
  {
    minCurrent: 2000,
    maxCurrent: 2000,
    panelName: "Панель ЩО 70-74 У3 (секционная)",
    description: "Панель для секционного выключателя 2000А",
    caseDepth: 600
  },
  {
    minCurrent: 2500,
    maxCurrent: 2500,
    panelName: "Панель ЩО 70-75 У3 (секционная)",
    description: "Панель для секционного выключателя 2500А",
    caseDepth: 700
  },
  {
    minCurrent: 3200,
    maxCurrent: 3200,
    panelName: "Панель ЩО 70-79 У3 (секционная)",
    description: "Панель для секционного выключателя 3200А",
    caseDepth: 700
  },
  {
    minCurrent: 4000,
    maxCurrent: 4000,
    panelName: "Панель ЩО 70-79* У3 (секционная)",
    description: "Панель для секционного выключателя 4000А",
    caseDepth: 800
  },
  {
    minCurrent: 5000,
    maxCurrent: 5000,
    panelName: "Панель ЩО 70-79* У3 (секционная)",
    description: "Панель для секционного выключателя 5000А",
    caseDepth: 800
  }
];

/**
 * Функция для определения панели на основе номинала автомата
 * @param current Номинал автомата в амперах
 * @returns Правило выбора панели или null, если не найдено
 */
export function getPanelRuleForCurrent(current: number): PanelSelectionRule | null {
  return RUNN_INPUT_PANEL_RULES.find(rule => 
    rule.minCurrent === current
  ) || null;
}

/**
 * Функция для определения панели на основе названия автомата
 * @param breakerName Название автомата (например, "Автоматический воздушный выключатель Metasol AS-32E3-3200A")
 * @returns Правило выбора панели или null, если не найдено
 */
export function getPanelRuleForBreaker(breakerName: string): PanelSelectionRule | null {
  // Извлекаем ток из названия автомата
  const current = extractCurrentFromBreakerName(breakerName);
  if (current === null) {
    return null;
  }
  
  return getPanelRuleForCurrent(current);
}

/**
 * Извлекает ток из названия автомата
 * @param breakerName Название автомата
 * @returns Ток в амперах или null, если не удалось извлечь
 */
function extractCurrentFromBreakerName(breakerName: string): number | null {
  // Паттерны для извлечения тока из различных названий автоматов
  const patterns = [
    // Metasol AS-32E3-3200A
    /AS-\d+E\d+-(\d+)A/i,
    // CHINT NA 4000 -4000, 4000 A
    /NA\s+\d+\s*-\d+,\s*(\d+)\s*A/i,
    // Другие форматы
    /(\d+)\s*A(?!\w)/i,
    /(\d+)\s*А(?!\w)/i
  ];

  for (const pattern of patterns) {
    const match = breakerName.match(pattern);
    if (match) {
      return parseInt(match[1]);
    }
  }

  return null;
}

/**
 * Получает все доступные правила выбора панелей
 * @returns Массив всех правил
 */
export function getAllPanelRules(): PanelSelectionRule[] {
  return [...RUNN_INPUT_PANEL_RULES];
}

/**
 * Получает правила для определенной глубины корпуса
 * @param caseDepth Глубина корпуса в мм
 * @returns Массив правил для данной глубины
 */
export function getPanelRulesByCaseDepth(caseDepth: number): PanelSelectionRule[] {
  return RUNN_INPUT_PANEL_RULES.filter(rule => rule.caseDepth === caseDepth);
}

/**
 * Валидирует правило выбора панели
 * @param rule Правило для валидации
 * @returns true, если правило валидно
 */
export function validatePanelRule(rule: PanelSelectionRule): boolean {
  return (
    rule.minCurrent > 0 &&
    rule.maxCurrent > 0 &&
    rule.minCurrent === rule.maxCurrent &&
    rule.panelName.trim().length > 0 &&
    rule.caseDepth > 0
  );
}

/**
 * Добавляет новое правило выбора панели
 * @param rule Новое правило
 * @returns true, если правило добавлено успешно
 */
export function addPanelRule(rule: PanelSelectionRule): boolean {
  if (!validatePanelRule(rule)) {
    return false;
  }

  // Проверяем, нет ли пересечений с существующими правилами
  const hasOverlap = RUNN_INPUT_PANEL_RULES.some(existingRule => 
    rule.minCurrent === existingRule.minCurrent
  );

  if (hasOverlap) {
    return false;
  }

  RUNN_INPUT_PANEL_RULES.push(rule);
  RUNN_INPUT_PANEL_RULES.sort((a, b) => a.minCurrent - b.minCurrent);
  return true;
}

/**
 * Удаляет правило выбора панели
 * @param current Ток правила для удаления
 * @returns true, если правило удалено успешно
 */
export function removePanelRule(current: number): boolean {
  const index = RUNN_INPUT_PANEL_RULES.findIndex(rule => rule.minCurrent === current);
  if (index === -1) {
    return false;
  }

  RUNN_INPUT_PANEL_RULES.splice(index, 1);
  return true;
}