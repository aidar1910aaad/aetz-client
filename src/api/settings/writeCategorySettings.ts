import { saveSettings, type SettingsPayload } from '@/api/settings/index';

/**
 * Запись глобальных настроек категорий (РУСН / РУНН).
 * Импортировать только из hooks/settings/*Editor.ts — страницы конфигуратора БКТП не должны вызывать это.
 */
export async function writeCategorySettings(payload: SettingsPayload, token: string) {
  return saveSettings(payload, token);
}
