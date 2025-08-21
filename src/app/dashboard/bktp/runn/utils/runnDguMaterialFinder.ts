import { Material } from '@/api/material';

/**
 * Извлекает ток из названия материала для РУНН ДГУ
 * Поддерживает форматы: "630А", "630 А", "630A", "630 A"
 */
export function extractCurrentFromMaterialName(materialName: string): number | null {
  if (!materialName || typeof materialName !== 'string') {
    return null;
  }

  // Паттерны для поиска тока в названии
  const currentPatterns = [
    /(\d+)\s*А\b/gi, // 630 А, 630А (кириллица)
    /(\d+)\s*A\b/gi, // 630 A, 630A (латиница)
    /(\d+)\s*ампер/gi, // 630 ампер
    /(\d+)\s*amp/gi, // 630 amp
  ];

  for (const pattern of currentPatterns) {
    const matches = materialName.match(pattern);
    if (matches) {
      // Извлекаем число из первого совпадения
      const numberMatch = matches[0].match(/\d+/);
      if (numberMatch) {
        return parseInt(numberMatch[0], 10);
      }
    }
  }

  return null;
}

/**
 * Находит материал с током, максимально приближенным к требуемому номинальному току
 * @param materials - Массив доступных материалов
 * @param nominalCurrent - Требуемый номинальный ток
 * @returns Подходящий материал или null
 */
export function findBestMaterialByNominalCurrent(
  materials: Material[],
  nominalCurrent: number
): Material | null {
  if (!materials || materials.length === 0 || nominalCurrent <= 0) {
    return null;
  }

  console.log(`=== ПОИСК МАТЕРИАЛА ДЛЯ РУНН ДГУ (номинальный ток: ${nominalCurrent.toFixed(2)} А) ===`);
  console.log('Количество материалов для поиска:', materials.length);

  // Собираем материалы с извлеченными токами
  const materialsWithCurrents = materials
    .map(material => ({
      material,
      current: extractCurrentFromMaterialName(material.name),
    }))
    .filter(item => item.current !== null && item.current > 0)
    .map(item => ({
      material: item.material,
      current: item.current as number,
    }));

  if (materialsWithCurrents.length === 0) {
    console.log('❌ Не найдено материалов с указанием тока в названии');
    return null;
  }

  console.log('Материалы с токами:');
  materialsWithCurrents.forEach(item => {
    console.log(`  "${item.material.name}" -> ${item.current} А`);
  });

  // Ищем материал с током, который больше или равен номинальному току
  // Сортируем по возрастанию тока, чтобы найти минимально подходящий
  const suitableMaterials = materialsWithCurrents
    .filter(item => item.current >= nominalCurrent)
    .sort((a, b) => a.current - b.current);

  if (suitableMaterials.length > 0) {
    const selected = suitableMaterials[0];
    console.log(`✅ Выбран материал: "${selected.material.name}" (${selected.current} А)`);
    console.log(`   Превышение: ${(selected.current - nominalCurrent).toFixed(2)} А`);
    return selected.material;
  }

  // Если нет материала с током >= номинального, выбираем максимальный доступный
  const maxCurrentMaterial = materialsWithCurrents
    .sort((a, b) => b.current - a.current)[0];

  console.log(`⚠️ Нет материала с током >= ${nominalCurrent.toFixed(2)} А`);
  console.log(`   Выбран максимальный доступный: "${maxCurrentMaterial.material.name}" (${maxCurrentMaterial.current} А)`);
  console.log(`   Недостаток: ${(nominalCurrent - maxCurrentMaterial.current).toFixed(2)} А`);

  return maxCurrentMaterial.material;
}

/**
 * Вычисляет номинальный ток для заданной мощности при напряжении 0.4 кВ
 * @param powerKva - Мощность в кВА
 * @returns Номинальный ток в амперах
 */
export function calculateNominalCurrentForDgu(powerKva: number): number {
  if (powerKva <= 0) return 0;
  // Формула: I = S / (U * √3) где S - мощность в кВА, U = 0.4 кВ
  return (powerKva * 1000) / (400 * Math.sqrt(3));
}
