export function getBktpNow(): { date: string; time: string } {
  const now = new Date();
  return {
    date: now.toISOString().split('T')[0],
    time: now.toTimeString().slice(0, 5),
  };
}

export function formatBktpDate(date: string): string {
  if (!date) return '—';
  const [y, m, d] = date.split('-');
  if (!y || !m || !d) return date;
  return `${d}.${m}.${y}`;
}

export function formatBktpDateTime(date: string, time: string): string {
  const datePart = formatBktpDate(date);
  return time ? `${datePart}, ${time}` : datePart;
}
