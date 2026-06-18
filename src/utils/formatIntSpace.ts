/** Оставить только цифры (ввод цен). */
export function digitsOnly(s: string): string {
  return s.replace(/\D/g, '');
}

/**
 * Целое число с пробелом между разрядами тысяч: 1000 → «1 000», 10000 → «10 000».
 * Для строки из цифр: пустая строка → «» (пустое поле ввода).
 */
export function formatIntSpace(value: number | string): string {
  if (typeof value === 'string') {
    const d = digitsOnly(value);
    if (!d) return '';
    return d.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  }
  if (!Number.isFinite(value)) return '0';
  const n = Math.trunc(value);
  return String(Math.abs(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}
