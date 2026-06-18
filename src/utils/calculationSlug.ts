export function generateCalculationSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9а-яё]/gi, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}
