import { API_URL } from '@/config';
import { Material } from '@/types/calculation';

export async function getMaterials(token: string): Promise<Material[]> {
  try {
    const response = await fetch(`${API_URL}/materials`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch materials');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching materials:', error);
    return [];
  }
}

export async function getMaterialsByType(token: string, type: Material['type']): Promise<Material[]> {
  try {
    const response = await fetch(`${API_URL}/materials?type=${type}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch materials');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching materials:', error);
    return [];
  }
} 