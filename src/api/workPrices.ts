import { api } from '@/api/baseUrl';
import type {
  UpdateWorkPricesSettingsRequest,
  WorkPricesSettingsResponse,
} from '@/types/api/workPrices';

export const workPricesApi = {
  getSettings: async (): Promise<WorkPricesSettingsResponse> => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${api}/work-prices-settings`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Не удалось загрузить настройки цен работ');
    }

    return response.json();
  },

  updateSettings: async (
    data: UpdateWorkPricesSettingsRequest,
  ): Promise<WorkPricesSettingsResponse> => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${api}/work-prices-settings`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      throw new Error(errorText || 'Не удалось сохранить настройки цен работ');
    }

    return response.json();
  },
};
