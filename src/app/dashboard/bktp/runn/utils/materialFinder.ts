import { Material } from '@/api/material';
import { runnCellsData } from '../data/runnCells';

/**
 * Находит материал по требуемому току в названии
 * Поддерживает разные форматы: "2500A", "2500 A", "2500 А", "2500ампер" и т.д.
 */
export function findMaterialByCurrent(
  materials: Material[],
  requiredCurrent: number
): Material | null {
  if (!materials || materials.length === 0) {
    return null;
  }

  // Создаем регулярные выражения для поиска тока в разных форматах
  const currentPatterns = [
    // Основные паттерны с кириллической А (русская буква)
    new RegExp(`\\b${requiredCurrent}\\s*А\\b`, 'i'), // 2500 А (кириллица)
    new RegExp(`\\b${requiredCurrent}А\\b`, 'i'), // 2500А (кириллица)
    // Паттерны с латинской A
    new RegExp(`\\b${requiredCurrent}\\s*A\\b`, 'i'), // 2500 A
    new RegExp(`\\b${requiredCurrent}A\\b`, 'i'), // 2500A
    // Другие форматы
    new RegExp(`\\b${requiredCurrent}\\s*ампер\\b`, 'i'), // 2500 ампер
    new RegExp(`\\b${requiredCurrent}\\s*amp\\b`, 'i'), // 2500 amp
    // Более гибкие паттерны с кириллической А
    new RegExp(`${requiredCurrent}\\s*А`, 'i'), // 2500 А (без границ слова)
    new RegExp(`${requiredCurrent}А`, 'i'), // 2500А (без границ слова)
    // Более гибкие паттерны с латинской A
    new RegExp(`${requiredCurrent}\\s*A`, 'i'), // 2500 A (без границ слова)
    new RegExp(`${requiredCurrent}A`, 'i'), // 2500A (без границ слова)
    // Специальные случаи для Metasol (ток в конце названия)
    new RegExp(`-${requiredCurrent}A\\b`, 'i'), // -2500A (как в "AS-25E3-2500A")
    new RegExp(`-${requiredCurrent}\\s*A\\b`, 'i'), // -2500 A
    new RegExp(`-${requiredCurrent}А\\b`, 'i'), // -2500А
    new RegExp(`-${requiredCurrent}\\s*А\\b`, 'i'), // -2500 А
    // Другие специальные случаи
    new RegExp(`-${requiredCurrent}\\s*,`, 'i'), // -2500 , (как в "NA 4000 -4000, 4000 A")
    new RegExp(`,\\s*${requiredCurrent}\\s*А`, 'i'), // , 2500 А
    new RegExp(`,\\s*${requiredCurrent}\\s*A`, 'i'), // , 2500 A
  ];

  // Ищем материал, название которого содержит требуемый ток
  for (const material of materials) {
    const name = material.name || '';

    for (let i = 0; i < currentPatterns.length; i++) {
      const pattern = currentPatterns[i];
      const matches = pattern.test(name);
      
      if (matches) {
        return material;
      }
    }
  }

  return null;
}

/**
 * Получает рекомендуемый ток для ввода по мощности трансформатора
 */
export function getVvodCurrentByTransformerPower(transformerPower: number): number | null {
  const entry = runnCellsData.find((item) => item.tr === transformerPower);
  return entry ? entry.vvod : null;
}

/**
 * Получает рекомендуемый ток для секционного выключателя по мощности трансформатора
 */
export function getSvCurrentByTransformerPower(transformerPower: number): number | null {
  const entry = runnCellsData.find((item) => item.tr === transformerPower);
  return entry ? entry.sv : null;
}
