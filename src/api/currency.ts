import { CurrencySettings, UpdateCurrencySettingsRequest } from '@/types/api/currency';
import { api } from '@/api/baseUrl';

export const currencyApi = {
  getSettings: async (): Promise<CurrencySettings> => {
    const response = await fetch(`${api}/currency-settings`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch currency settings');
    }

    return response.json();
  },

  updateSettings: async (data: UpdateCurrencySettingsRequest): Promise<CurrencySettings> => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${api}/currency-settings`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      throw new Error(errorText || 'Failed to update currency settings via PUT');
    }

    if (response.status === 204) {
      return data as unknown as CurrencySettings;
    }

    const text = await response.text();
    if (!text) {
      return data as unknown as CurrencySettings;
    }

    return JSON.parse(text) as CurrencySettings;
  }
}; 