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
    const response = await fetch(`${api}/currency-settings`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error('Failed to update currency settings');
    }

    return response.json();
  }
}; 