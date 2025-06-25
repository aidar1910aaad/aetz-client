import { api } from '../baseUrl/index';

// Интерфейсы
export interface CategorySetting {
  categoryId: number;
  type: 'switch' | 'rza' | 'counter' | 'sr' | 'tsn' | 'tn';
  isVisible: boolean;
}

export interface Settings {
  id: string;
  createdAt: string;
  updatedAt: string;
  settings: {
    rusn: CategorySetting[];
    bmz: CategorySetting[];
    runn: CategorySetting[];
    work: CategorySetting[];
    transformer: CategorySetting[];
    additionalEquipment: CategorySetting[];
    sr: CategorySetting[];
    tsn: CategorySetting[];
    tn: CategorySetting[];
  };
}

export interface SettingsPayload {
  settings: {
    rusn: CategorySetting[];
    bmz: CategorySetting[];
    runn: CategorySetting[];
  };
}

export interface SettingsResponse {
  settings: Settings;
}

// Функции для работы с API
export const createSettings = async (settings: SettingsPayload, token: string): Promise<void> => {
  try {
    const response = await fetch(`${api}/settings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(settings)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || `Ошибка при создании настроек: ${response.status}`);
    }
  } catch (error) {
    console.error('Error creating settings:', error);
    throw error;
  }
};

export const updateSettings = async (id: number, settings: SettingsPayload, token: string): Promise<void> => {
  try {
    const response = await fetch(`${api}/settings/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(settings)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || `Ошибка при обновлении настроек: ${response.status}`);
    }
  } catch (error) {
    console.error('Error updating settings:', error);
    throw error;
  }
};

export const getSettings = async (token: string): Promise<Settings> => {
  try {
    const response = await fetch(`${api}/settings`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Ошибка при получении настроек: ${response.status}`);
    }

    const data = await response.json();
    console.log('Get settings response:', data);
    return data;
  } catch (error) {
    console.error('Error in getSettings:', error);
    throw error;
  }
};

export const saveSettings = async (settings: {
  settings: {
    rusn?: CategorySetting[];
    bmz?: CategorySetting[];
    runn?: CategorySetting[];
    work?: CategorySetting[];
    transformer?: CategorySetting[];
    additionalEquipment?: CategorySetting[];
    sr?: CategorySetting[];
    tsn?: CategorySetting[];
    tn?: CategorySetting[];
  }
}, token: string): Promise<Settings> => {
  try {
    const url = `${api}/settings`;
    
    const headers = {
      'accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };

    console.log('Saving settings with:', {
      url,
      method: 'PUT',
      headers,
      body: settings
    });

    const response = await fetch(url, {
      method: 'PUT',
      headers,
      body: JSON.stringify(settings),
      mode: 'cors',
      credentials: 'include'
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error('Error response:', errorData);
      throw new Error(errorData?.message || `Ошибка при сохранении настроек: ${response.status}`);
    }

    const data = await response.json();
    console.log('Save settings success response:', data);
    return data;
  } catch (error) {
    console.error('Error in saveSettings:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack
      });
    }
    throw error;
  }
};