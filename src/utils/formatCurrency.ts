/** Форматирование сумм в тенге (без лишних знаков после запятой) */
export function formatKzt(value: number): string {
  return (value || 0).toLocaleString('ru-RU', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}
