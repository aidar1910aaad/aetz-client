/**
 * Утилиты для определения названия панели на основе номинала автомата
 */

import { Material } from '@/api/material';

/**
 * Извлекает ток из названия автомата
 * @param breakerName Название автомата
 * @returns Ток в амперах или null, если не удалось извлечь
 */
export function extractCurrentFromBreakerName(breakerName: string): number | null {
  const patterns = [
    // Автомат ВА-57-ф35 / 100 А
    /\/\s*(\d+)\s*А(?!\w)/i,
    /\/\s*(\d+)\s*A(?!\w)/i,
    // Автоматический воздушный выключатель (CHINT) NA 2000 - 1600A
    /NA\s+\d+\s*-\s*(\d+)A/i,
    /NA\s+\d+\s*-\s*(\d+)\s*A/i,
    // Metasol AS-32E3-3200A
    /AS-\d+E\d+-(\d+)A/i,
    // Metasol AS-63G3-6300A
    /AS-\d+G\d+-(\d+)A/i,
    // Metasol AN-10D3-1000A
    /AN-\d+D\d+-(\d+)A/i,
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
 * Извлекает ток из названия рубильника РПС
 * @param rubilnikName Название рубильника (например, "Рубильник РПС - 4/1 Лев 400 А")
 * @returns Ток в амперах или null, если не удалось извлечь
 */
export function extractCurrentFromRubilnikName(rubilnikName: string): number | null {
  if (!rubilnikName) return null;
  
  const patterns = [
    // Рубильник РПС - 4/1 Лев 400 А
    /\s+(\d+)\s+А(?!\w)/i,
    // Рубильник РПС - 4/1 Лев 400A
    /\s+(\d+)A(?!\w)/i,
    // Другие форматы с током
    /(\d+)\s*А(?!\w)/i,
    /(\d+)\s*A(?!\w)/i
  ];

  for (const pattern of patterns) {
    const match = rubilnikName.match(pattern);
    if (match) {
      return parseInt(match[1]);
    }
  }

  return null;
}

/**
 * Извлекает ток из названия трансформатора тока
 * @param transformerName Название трансформатора (например, "Трансформатор тока Т-0,66  - 1000/ 5 УЗ")
 * @returns Ток в амперах или null, если не удалось извлечь
 */
export function extractCurrentFromTransformerName(transformerName: string): number | null {
  if (!transformerName) return null;
  
  // Ищем ток в формате "2500/5", "2000/5", "1000/5" и т.д.
  const patterns = [
    /(\d+)\/5\b/i,  // 2500/5
    /(\d+)\/\s*5\b/i,  // 2500/ 5
    /(\d+)\s*\/\s*5\b/i,  // 2500 / 5
    // Также ищем просто число перед "/5"
    /\s+(\d+)\s*\/\s*5/i,
  ];
  
  for (const pattern of patterns) {
    const match = transformerName.match(pattern);
    if (match) {
      return parseInt(match[1]);
    }
  }
  
  return null;
}

/**
 * Находит подходящий трансформатор тока по требуемому току
 * @param requiredCurrent Требуемый ток в амперах
 * @param transformers Массив материалов трансформаторов тока
 * @returns Найденный трансформатор или null
 */
export function findMatchingCurrentTransformer(requiredCurrent: number, transformers: Material[]): Material | null {
  if (!transformers || transformers.length === 0) return null;
  
  // Сначала ищем точное совпадение
  for (const transformer of transformers) {
    const transformerCurrent = extractCurrentFromTransformerName(transformer.name);
    if (transformerCurrent && transformerCurrent === requiredCurrent) {
      return transformer;
    }
  }
  
  // Если точного совпадения нет, ищем ближайший больший трансформатор (но не слишком большой - в пределах 10% от требуемого)
  let closestMatch: Material | null = null;
  let closestCurrent = Infinity;
  const maxAllowedCurrent = requiredCurrent * 1.10; // Не более чем на 10% больше
  
  for (const transformer of transformers) {
    const transformerCurrent = extractCurrentFromTransformerName(transformer.name);
    if (transformerCurrent && 
        transformerCurrent >= requiredCurrent && 
        transformerCurrent <= maxAllowedCurrent &&
        transformerCurrent < closestCurrent) {
      closestCurrent = transformerCurrent;
      closestMatch = transformer;
    }
  }
  
  if (closestMatch) {
    return closestMatch;
  }
  
  // Если не нашли в допустимом диапазоне (10%), ищем ближайший меньший трансформатор (но не меньше чем на 20% меньше)
  const minAllowedCurrent = requiredCurrent * 0.8; // Не менее чем на 20% меньше
  let closestMatchSmaller: Material | null = null;
  let closestCurrentSmaller = 0;
  
  for (const transformer of transformers) {
    const transformerCurrent = extractCurrentFromTransformerName(transformer.name);
    if (transformerCurrent && 
        transformerCurrent < requiredCurrent && 
        transformerCurrent >= minAllowedCurrent &&
        transformerCurrent > closestCurrentSmaller) {
      closestCurrentSmaller = transformerCurrent;
      closestMatchSmaller = transformer;
    }
  }
  
  if (closestMatchSmaller) {
    return closestMatchSmaller;
  }
  
  // Если не нашли в допустимом диапазоне, ищем ближайший больший (без ограничений)
  let closestMatchAny: Material | null = null;
  let closestCurrentAny = Infinity;
  
  for (const transformer of transformers) {
    const transformerCurrent = extractCurrentFromTransformerName(transformer.name);
    if (transformerCurrent && transformerCurrent >= requiredCurrent && transformerCurrent < closestCurrentAny) {
      closestCurrentAny = transformerCurrent;
      closestMatchAny = transformer;
    }
  }
  
  if (closestMatchAny) {
    return closestMatchAny;
  }
  
  // Если не нашли больший или равный, берем максимальный доступный
  let maxCurrent = 0;
  let bestMatch: Material | null = null;
  
  for (const transformer of transformers) {
    const transformerCurrent = extractCurrentFromTransformerName(transformer.name);
    if (transformerCurrent && transformerCurrent > maxCurrent) {
      maxCurrent = transformerCurrent;
      bestMatch = transformer;
    }
  }
  
  return bestMatch;
}

/**
 * Правила выбора панелей для ячеек ввода РУНН
 */
export const INPUT_PANEL_RULES = [
  { current: 630, name: "Панель ЩО 70-32 С У3 (вводная)" },
  { current: 1000, name: "Панель ЩО 70-42 С У3 (вводная)" },
  { current: 1600, name: "Панель ЩО 70-44 С У3 (вводная)" },
  { current: 2000, name: "Панель ЩО 70-48 С У3 (вводная)" },
  { current: 2500, name: "Панель ЩО 70-62 С У3 (вводная)" },
  { current: 3200, name: "Панель ЩО 70-64 С У3 (вводная)" },
  { current: 4000, name: "Панель ЩО 70-68 С У3 (вводная)" },
  { current: 5000, name: "Панель ЩО 70-69 С У3 (вводная)" },
  { current: 6300, name: "Панель ЩО 70-69* С У3 (вводная)" }
];

/**
 * Правила выбора панелей для секционных выключателей РУНН
 */
export const SECTION_PANEL_RULES = [
  { current: 630, name: "Панель ЩО 70-72* У3 (секционная)" },
  { current: 1000, name: "Панель ЩО 70-72 У3 (секционная)" },
  { current: 1600, name: "Панель ЩО 70-73 У3 (секционная)" },
  { current: 2000, name: "Панель ЩО 70-74 У3 (секционная)" },
  { current: 2500, name: "Панель ЩО 70-75 У3 (секционная)" },
  { current: 3200, name: "Панель ЩО 70-79 У3 (секционная)" },
  { current: 4000, name: "Панель ЩО 70-79* У3 (секционная)" },
  { current: 5000, name: "Панель ЩО 70-79* У3 (секционная)" }
];

/**
 * Получает название панели на основе номинала автомата для вводных ячеек
 * @param current Номинал автомата в амперах
 * @param fallbackName Название по умолчанию, если правило не найдено
 * @returns Название панели
 */
export function getInputPanelNameForCurrent(current: number, fallbackName: string = "Панель ЩО 70 (вводная)"): string {
  const rule = INPUT_PANEL_RULES.find(r => r.current === current);
  return rule ? rule.name : fallbackName;
}

/**
 * Получает название панели на основе номинала автомата для секционных выключателей
 * @param current Номинал автомата в амперах
 * @param fallbackName Название по умолчанию, если правило не найдено
 * @returns Название панели
 */
export function getSectionPanelNameForCurrent(current: number, fallbackName: string = "Панель ЩО 70 (секционная)"): string {
  const rule = SECTION_PANEL_RULES.find(r => r.current === current);
  return rule ? rule.name : fallbackName;
}

/**
 * Получает название панели на основе названия автомата для вводных ячеек
 * @param breakerName Название автомата
 * @param fallbackName Название по умолчанию, если правило не найдено
 * @returns Название панели
 */
export function getInputPanelNameForBreaker(breakerName: string, fallbackName: string = "Панель ЩО 70 (вводная)"): string {
  const current = extractCurrentFromBreakerName(breakerName);
  if (current === null) {
    return fallbackName;
  }
  
  return getInputPanelNameForCurrent(current, fallbackName);
}

/**
 * Получает название панели на основе названия автомата для секционных выключателей
 * @param breakerName Название автомата
 * @param fallbackName Название по умолчанию, если правило не найдено
 * @returns Название панели
 */
export function getSectionPanelNameForBreaker(breakerName: string, fallbackName: string = "Панель ЩО 70 (секционная)"): string {
  const current = extractCurrentFromBreakerName(breakerName);
  if (current === null) {
    return fallbackName;
  }
  
  return getSectionPanelNameForCurrent(current, fallbackName);
}

/**
 * Получает название панели на основе названия автомата (универсальная функция)
 * @param breakerName Название автомата
 * @param cellPurpose Назначение ячейки ('Ввод' или 'Секционный выключатель')
 * @param fallbackName Название по умолчанию, если правило не найдено
 * @returns Название панели
 */
export function getPanelNameForBreaker(breakerName: string, cellPurpose: string, fallbackName?: string): string {
  const current = extractCurrentFromBreakerName(breakerName);
  if (current === null) {
    return fallbackName || "Панель ЩО 70";
  }
  
  if (cellPurpose === 'Секционный выключатель') {
    return getSectionPanelNameForCurrent(current, fallbackName || "Панель ЩО 70 (секционная)");
  } else {
    return getInputPanelNameForCurrent(current, fallbackName || "Панель ЩО 70 (вводная)");
  }
}

/**
 * Тестовые примеры для проверки работы функций
 */
export const TEST_EXAMPLES = [
  {
    breakerName: "Автоматический воздушный выключатель Metasol AS-32E3-3200A",
    expectedCurrent: 3200,
    expectedInputPanel: "Панель ЩО 70-64 С У3 (вводная)",
    expectedSectionPanel: "Панель ЩО 70-79 У3 (секционная)"
  },
  {
    breakerName: "Автоматический воздушный выключатель Metasol AS-63G3-6300A",
    expectedCurrent: 6300,
    expectedInputPanel: "Панель ЩО 70-69* С У3 (вводная)",
    expectedSectionPanel: "Панель ЩО 70-79* У3 (секционная)"
  },
  {
    breakerName: "Автоматический воздушный выключатель Metasol AN-10D3-1000A",
    expectedCurrent: 1000,
    expectedInputPanel: "Панель ЩО 70-42 С У3 (вводная)",
    expectedSectionPanel: "Панель ЩО 70-72 У3 (секционная)"
  },
  {
    breakerName: "Автоматический воздушный выключатель (CHINT) NA 4000 -4000, 4000 A",
    expectedCurrent: 4000,
    expectedInputPanel: "Панель ЩО 70-68 С У3 (вводная)",
    expectedSectionPanel: "Панель ЩО 70-79* У3 (секционная)"
  },
  {
    breakerName: "Автоматический воздушный выключатель 630A",
    expectedCurrent: 630,
    expectedInputPanel: "Панель ЩО 70-32 С У3 (вводная)",
    expectedSectionPanel: "Панель ЩО 70-72* У3 (секционная)"
  },
  {
    breakerName: "Автоматический воздушный выключатель 1000 А",
    expectedCurrent: 1000,
    expectedInputPanel: "Панель ЩО 70-42 С У3 (вводная)",
    expectedSectionPanel: "Панель ЩО 70-72 У3 (секционная)"
  }
];
