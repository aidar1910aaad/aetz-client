const ALMATY_FORMATTER = new Intl.DateTimeFormat('ru-RU', {
  timeZone: 'Asia/Almaty',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false,
});

export function formatAlmatyDateTime(value: Date | string | null | undefined): string {
  if (!value) {
    return '—';
  }

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return typeof value === 'string' ? value : '—';
  }

  return ALMATY_FORMATTER.format(date);
}
