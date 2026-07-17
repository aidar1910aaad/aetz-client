export const CUSTOM_PERCENTAGES_GROUP_SLUG = 'shkafy-dlya-dop-komplektacii';

export function isCustomPercentagesGroup(groupSlug?: string | null): boolean {
  if (!groupSlug) return false;
  return decodeURIComponent(groupSlug) === CUSTOM_PERCENTAGES_GROUP_SLUG;
}
