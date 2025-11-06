import { Material } from '@/api/material';

/**
 * Извлекает номинальный ток из названия рубильника
 * @param rubilnikName - Название рубильника
 * @returns Номинальный ток в амперах или null, если не найден
 */
export function extractCurrentFromRubilnik(rubilnikName: string): number | null {
  if (!rubilnikName || typeof rubilnikName !== 'string') {
    return null;
  }

  const currentPatterns = [
    /(\d+)\s*A\s*$/i, // 630 A, 1000 A в конце строки
    /(\d+)\s*А\s*$/i, // 630 А, 1000 А в конце строки
    /(\d+)\s*A\s*,/i, // 630 A, в середине
    /(\d+)\s*А\s*,/i, // 630 А, в середине
    /(\d+)\s*а/i, /(\d+)\s*a/i, // старые паттерны
    /(\d+)\s*ампер/i, /(\d+)\s*амп/i,
    /ток\s*(\d+)/i, /номинальный\s*ток\s*(\d+)/i,
    /iн\s*=\s*(\d+)/i, /i\s*=\s*(\d+)/i,
  ];

  for (const pattern of currentPatterns) {
    const match = rubilnikName.match(pattern);
    if (match) {
      return parseInt(match[1]);
    }
  }
  return null;
}

/**
 * Находит подходящий предохранитель ПН по номинальному току
 * @param current - Номинальный ток в амперах
 * @param fusesPnMaterials - Массив материалов предохранителей ПН
 * @returns Подходящий предохранитель или null, если не найден
 */
export function findMatchingFuse(current: number, fusesPnMaterials: Material[]): Material | null {
  if (!current || !fusesPnMaterials || fusesPnMaterials.length === 0) {
    return null;
  }


  // Ищем предохранитель с точно таким же номиналом
  for (const fuse of fusesPnMaterials) {
    const fuseCurrent = extractCurrentFromRubilnik(fuse.name);
    if (fuseCurrent === current) {
      return fuse;
    }
  }

  // Если точного совпадения нет, ищем ближайший по номиналу
  let closestFuse: Material | null = null;
  let minDifference = Infinity;

  for (const fuse of fusesPnMaterials) {
    const fuseCurrent = extractCurrentFromRubilnik(fuse.name);
    if (fuseCurrent !== null) {
      const difference = Math.abs(fuseCurrent - current);
      if (difference < minDifference) {
        minDifference = difference;
        closestFuse = fuse;
      }
    }
  }

  if (closestFuse) {
    const closestCurrent = extractCurrentFromRubilnik(closestFuse.name);
  } else {
  }

  return closestFuse;
}

/**
 * Автоматически добавляет предохранители ПН к рубильникам РПС
 * @param rubilniki - Массив названий рубильников
 * @param fusesPnMaterials - Массив материалов предохранителей ПН
 * @returns Массив автоматически добавленных предохранителей
 */
export function autoAddFusesToRubilniki(
  rubilniki: string[],
  fusesPnMaterials: Material[]
): Material[] {
  if (!rubilniki || rubilniki.length === 0 || !fusesPnMaterials || fusesPnMaterials.length === 0) {
    return [];
  }

  const autoAddedFuses: Material[] = [];

  rubilniki.forEach((rubilnik, index) => {
    if (!rubilnik || rubilnik.trim() === '') {
      return;
    }

    const current = extractCurrentFromRubilnik(rubilnik);
    if (!current) {
      return;
    }

    const matchingFuse = findMatchingFuse(current, fusesPnMaterials);
    if (matchingFuse) {
      // Добавляем 3 штуки предохранителя для каждого рубильника
      for (let i = 0; i < 3; i++) {
        autoAddedFuses.push({
          ...matchingFuse,
          // Добавляем уникальный идентификатор для каждого экземпляра
          id: `${matchingFuse.id}_auto_${index}_${i}`,
          name: `${matchingFuse.name} (авто для ${rubilnik})`,
        });
      }
    }
  });

  return autoAddedFuses;
}