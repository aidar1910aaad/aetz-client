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

  console.log(`=== ПОИСК МАТЕРИАЛА ДЛЯ ТОКА ${requiredCurrent}A ===`);
  console.log('Количество материалов для поиска:', materials.length);

  // Создаем регулярные выражения для поиска тока в разных форматах
  const currentPatterns = [
    new RegExp(`\\b${requiredCurrent}\\s*A\\b`, 'i'), // 2500 A
    new RegExp(`\\b${requiredCurrent}A\\b`, 'i'), // 2500A
    new RegExp(`\\b${requiredCurrent}\\s*А\\b`, 'i'), // 2500 А (кириллица)
    new RegExp(`\\b${requiredCurrent}А\\b`, 'i'), // 2500А (кириллица)
    new RegExp(`\\b${requiredCurrent}\\s*ампер\\b`, 'i'), // 2500 ампер
    new RegExp(`\\b${requiredCurrent}\\s*amp\\b`, 'i'), // 2500 amp
    // Добавляем более гибкие паттерны
    new RegExp(`${requiredCurrent}\\s*A`, 'i'), // 4000 A (без границ слова)
    new RegExp(`${requiredCurrent}A`, 'i'), // 4000A (без границ слова)
    new RegExp(`-${requiredCurrent}\\s*,`, 'i'), // -4000 , (как в "NA 4000 -4000, 4000 A")
    new RegExp(`,\\s*${requiredCurrent}\\s*A`, 'i'), // , 4000 A
  ];

  console.log(
    'Паттерны для поиска:',
    currentPatterns.map((p) => p.source)
  );

  // Ищем материал, название которого содержит требуемый ток
  for (const material of materials) {
    const name = material.name || '';
    console.log(`Проверяем материал: "${name}"`);

    for (const pattern of currentPatterns) {
      if (pattern.test(name)) {
        console.log(`✅ Найден материал для тока ${requiredCurrent}A:`, material.name);
        console.log(`   Паттерн: ${pattern.source}`);
        return material;
      }
    }
  }

  console.log(
    `❌ Материал для тока ${requiredCurrent}A не найден среди ${materials.length} материалов`
  );
  console.log('Доступные токи в материалах:');
  materials.forEach((material) => {
    const name = material.name || '';
    // Извлекаем все токи из названия для отладки
    const currentMatches = name.match(/\d+\s*[AА]/gi);
    if (currentMatches) {
      console.log(`   "${name}" -> токи: ${currentMatches.join(', ')}`);
    }
  });

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
