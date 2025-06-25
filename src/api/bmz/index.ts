import { api } from '../baseUrl';

export interface AreaPriceRange {
  minArea: number;
  maxArea: number;
  minWallThickness: number;
  maxWallThickness: number;
  pricePerSquareMeter: number;
}

export interface Equipment {
  name: string;
  priceType: 'perSquareMeter' | 'perHalfSquareMeter' | 'fixed';
  pricePerSquareMeter?: number;
  fixedPrice?: number;
  description?: string;
}

export interface BmzSettings {
  id: number;
  basePricePerSquareMeter: string | number;
  areaPriceRanges: AreaPriceRange[];
  equipment: Equipment[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateBmzSettingsDto {
  basePricePerSquareMeter: number;
  areaPriceRanges: AreaPriceRange[];
  equipment: Equipment[];
  isActive: boolean;
}

export interface AreaPrice {
  id: number;
  minArea: number;
  maxArea: number;
  minWallThickness: number;
  maxWallThickness: number;
  basePricePerSquareMeter: number;
}

export interface CreateAreaPriceDto {
  minArea: number;
  maxArea: number;
  minWallThickness: number;
  maxWallThickness: number;
  basePricePerSquareMeter: number;
}

export interface CreateEquipmentDto {
  name: string;
  priceType: 'perSquareMeter' | 'perHalfSquareMeter' | 'fixed';
  pricePerSquareMeter?: number;
  fixedPrice?: number;
  description?: string;
}

export const bmzApi = {
  // Получить настройки БМЗ
  getSettings: async (): Promise<BmzSettings> => {
    const response = await fetch(`${api}/bmz/settings`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch BMZ settings');
    }
    return response.json();
  },

  // Обновить настройки БМЗ
  updateSettings: async (data: UpdateBmzSettingsDto): Promise<BmzSettings> => {
    const response = await fetch(`${api}/bmz/settings`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({
        ...data,
        basePricePerSquareMeter: Number(data.basePricePerSquareMeter),
      }),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || 'Failed to update BMZ settings');
    }
    return response.json();
  },

  // Получить все настройки БМЗ
  getAllSettings: async (): Promise<{
    settings: BmzSettings;
    areaPrices: AreaPrice[];
    equipment: Equipment[];
  }> => {
    const response = await fetch(`${api}/bmz/settings/all`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch all BMZ settings');
    }
    return response.json();
  },

  // Создать новый диапазон цен
  createAreaPrice: async (data: CreateAreaPriceDto): Promise<AreaPrice> => {
    const response = await fetch(`${api}/bmz/settings/area-prices`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to create area price');
    }
    return response.json();
  },

  // Удалить диапазон цен
  deleteAreaPrice: async (id: number): Promise<void> => {
    const response = await fetch(`${api}/bmz/settings/area-prices/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    if (!response.ok) {
      throw new Error('Failed to delete area price');
    }
  },

  // Создать новое оборудование
  createEquipment: async (data: CreateEquipmentDto): Promise<Equipment> => {
    const response = await fetch(`${api}/bmz/settings/equipment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to create equipment');
    }
    return response.json();
  },

  // Удалить оборудование
  deleteEquipment: async (id: number): Promise<void> => {
    const response = await fetch(`${api}/bmz/settings/equipment/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    if (!response.ok) {
      throw new Error('Failed to delete equipment');
    }
  },
};
