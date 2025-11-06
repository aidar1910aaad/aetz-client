/**
 * Определяет размер корпуса на основе тока автомата выкатного
 * @param current Ток в амперах
 * @returns Размер корпуса
 */
export function getCaseSize(current: number): string {
  if (current >= 630 && current <= 2000) {
    return '600';
  } else if (current >= 2500 && current <= 3200) {
    return '700';
  } else if (current >= 4000) {
    return '800';
  }
  
  return 'Не определен';
}

/**
 * Извлекает ток из названия автомата
 * @param breakerName Название автомата (например, "Автоматический воздушный выключатель (CHINT) NA 4000 -4000, 4000 A")
 * @returns Ток в амперах или null, если не удалось извлечь
 */
export function extractCurrentFromBreakerName(breakerName: string): number | null {
  // Ищем ток в формате "4000 A" или "4000A"
  const currentMatch = breakerName.match(/(\d+)\s*[АA]/);
  if (currentMatch) {
    return parseInt(currentMatch[1]);
  }
  
  // Ищем ток в формате "NA 4000" или "NA4000"
  const naMatch = breakerName.match(/NA\s*(\d+)/);
  if (naMatch) {
    return parseInt(naMatch[1]);
  }
  
  return null;
}

/**
 * Получает информацию о корпусе на основе названия автомата
 * @param breakerName Название автомата
 * @returns Объект с информацией о корпусе
 */
export function getCaseInfo(breakerName: string): {
  current: number | null;
  caseSize: string;
  isValid: boolean;
} {
  const current = extractCurrentFromBreakerName(breakerName);
  
  if (current === null) {
    return {
      current: null,
      caseSize: 'Не определен',
      isValid: false
    };
  }
  
  const caseSize = getCaseSize(current);
  
  return {
    current,
    caseSize,
    isValid: true
  };
} 