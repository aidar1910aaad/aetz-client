import { api } from '../baseUrl/index';

// Интерфейсы
export interface CategorySetting {
  categoryId: number;
  type: 'switch' | 'rza' | 'counter';
  isVisible: boolean;
}

export interface SettingsData {
  id: number;
  settings: {
    rusn: CategorySetting[];
    bmz: CategorySetting[];
    runn?: CategorySetting[]; // опционально, так как в примере его нет
  };
  createdAt: string;
  updatedAt: string;
}

export interface SettingsPayload {
  settings: {
    rusn: CategorySetting[];
    bmz: CategorySetting[];
    runn: CategorySetting[];
  };
}

export interface Settings {
  rusn: CategorySetting[];
  bmz: CategorySetting[];
  transformer?: CategorySetting[];
  runn?: CategorySetting[];
  additional?: CategorySetting[];
  works?: CategorySetting[];
}

export interface SettingsResponse {
  settings: Settings;
}

// Функции для работы с API
export const createSettings = async (settings: SettingsPayload, token: string): Promise<void> => {
  try {
    const response = await fetch('/api/settings', {
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
    const response = await fetch(`/api/settings/${id}`, {
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

export const getSettings = async (token: string): Promise<SettingsData> => {
  try {
    const response = await fetch('http://localhost:3001/settings', {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('Get settings response status:', response.status);
    
    if (!response.ok) {
      throw new Error(`Ошибка при получении настроек: ${response.status}`);
    }

    const data = await response.json();
    console.log('Get settings response:', data);

    // Проверяем, что data это массив и берем только первую настройку
    if (!Array.isArray(data) || data.length === 0) {
      console.error('No settings found');
      return {
        id: 1,
        settings: {
          rusn: [],
          bmz: [],
          runn: []
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    }

    // Возвращаем только первую настройку
    return data[0];
  } catch (error) {
    console.error('Error in getSettings:', error);
    throw error;
  }
};

export const saveSettings = async (id: number, settings: {
  settings: {
    rusn: CategorySetting[];
    bmz: CategorySetting[];
    runn?: CategorySetting[];
  }
}, token: string): Promise<void> => {
  try {
    const response = await fetch(`http://localhost:3001/settings/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(settings)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || `Ошибка при сохранении настроек: ${response.status}`);
    }

    const data = await response.json();
    console.log('Save settings response:', data);
  } catch (error) {
    console.error('Error in saveSettings:', error);
    throw error;
  }
};