import { API_URL } from '@/config';

export interface CategorySetting {
  categoryId: number;
  type: 'switch' | 'rza' | 'counter' | 'sr' | 'tsn' | 'tn' | 'tt';
  isVisible: boolean;
}

export interface Settings {
  id: number;
  settings: {
    rusn: CategorySetting[];
    runn: CategorySetting[];
    bmz: CategorySetting[];
    sr: CategorySetting[];
    tsn: CategorySetting[];
    tn: CategorySetting[];
    tt: CategorySetting[];
  };
}

export async function getSettings(token: string): Promise<Settings | null> {
  try {
    const response = await fetch(`${API_URL}/settings`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch settings');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching settings:', error);
    return null;
  }
}

export async function saveSettings(
  id: number,
  settings: Omit<Settings, 'id'>,
  token: string
): Promise<void> {
  const response = await fetch(`${API_URL}/settings/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(settings),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to save settings');
  }
}
