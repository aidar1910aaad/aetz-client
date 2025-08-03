import { api } from '../baseUrl/index';

export interface CalculationGroup {
  id: number;
  name: string;
  slug: string;
  voltageType?: number | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CalculationData {
  categories: Array<{
    name: string;
    items: Array<{
      name: string;
      unit: string;
      price: number;
      quantity: number;
    }>;
  }>;
  calculation?: {
    manufacturingHours?: number;
    hourlyRate?: number;
    overheadPercentage?: number;
    adminPercentage?: number;
    plannedProfitPercentage?: number;
    ndsPercentage?: number;
  };
  cellConfig?: {
    type?: string;
    materials?: Record<string, unknown>;
  };
}

export interface Calculation {
  id: number;
  name: string;
  slug: string;
  data: CalculationData;
  group: CalculationGroup;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCalculationGroupRequest {
  name: string;
  slug?: string;
  voltageType?: number | null;
}

export interface UpdateCalculationGroupRequest {
  name?: string;
  voltageType?: number | null;
}

export interface CreateCalculationRequest {
  name: string;
  slug?: string;
  groupId: number;
  data: CalculationData;
}

export interface UpdateCalculationRequest {
  name?: string;
  slug?: string;
  data?: Partial<CalculationData>;
}

export async function createCalculationGroup(
  group: CreateCalculationGroupRequest,
  token: string
): Promise<CalculationGroup> {
  try {
    console.log('Creating calculation group:', group);
    const response = await fetch(`${api}/calculations/groups`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(group),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      console.error('Error creating group:', error);
      throw new Error(error.message || 'Ошибка при создании группы калькуляций');
    }

    const result = await response.json();
    console.log('Created group:', result);
    return result as CalculationGroup;
  } catch (err: unknown) {
    const error = err as Error;
    console.error('Error in createCalculationGroup:', error);
    throw new Error(error.message);
  }
}

export async function updateCalculationGroup(
  slug: string,
  data: UpdateCalculationGroupRequest,
  token: string
): Promise<CalculationGroup> {
  try {
    console.log('Updating calculation group:', { slug, data });
    const response = await fetch(`${api}/calculations/groups/${slug}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      console.error('Error updating group:', error);
      throw new Error(error.message || 'Ошибка при обновлении группы калькуляций');
    }

    const result = await response.json();
    console.log('Updated group:', result);
    return result as CalculationGroup;
  } catch (err: unknown) {
    const error = err as Error;
    console.error('Error in updateCalculationGroup:', error);
    throw new Error(error.message);
  }
}

export async function deleteCalculationGroup(id: number, token: string): Promise<void> {
  try {
    console.log('Deleting calculation group:', id);
    const response = await fetch(`${api}/calculations/groups/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      console.error('Error deleting group:', error);
      throw new Error(error.message || 'Ошибка при удалении группы калькуляций');
    }

    console.log('Group deleted successfully');
  } catch (err: unknown) {
    const error = err as Error;
    console.error('Error in deleteCalculationGroup:', error);
    throw new Error(error.message);
  }
}

export async function getAllCalculationGroups(token: string): Promise<CalculationGroup[]> {
  try {
    console.log('Fetching all calculation groups...');
    const response = await fetch(`${api}/calculations/groups`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      console.error('Error fetching groups:', error);
      throw new Error(error.message || 'Ошибка при получении групп калькуляций');
    }

    const result = await response.json();
    console.log('Fetched groups:', result);
    return result as CalculationGroup[];
  } catch (err: unknown) {
    const error = err as Error;
    console.error('Error in getAllCalculationGroups:', error);
    throw new Error(error.message);
  }
}

export async function createCalculation(
  data: CreateCalculationRequest,
  token: string
): Promise<Calculation> {
  try {
    console.log('Creating calculation:', data);
    const response = await fetch(`${api}/calculations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      console.error('Error creating calculation:', error);
      throw new Error(error.message || 'Ошибка при создании калькуляции');
    }

    const result = await response.json();
    console.log('Created calculation:', result);
    return result as Calculation;
  } catch (err: unknown) {
    const error = err as Error;
    console.error('Error in createCalculation:', error);
    throw new Error(error.message);
  }
}

export async function getCalculationsByGroup(
  groupSlug: string,
  token: string
): Promise<Calculation[]> {
  try {
    console.log('Fetching calculations for group:', groupSlug);
    const response = await fetch(`${api}/calculations/groups/${groupSlug}/calculations`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      console.error('Error fetching calculations:', error);
      throw new Error(error.message || 'Ошибка при получении калькуляций в группе');
    }

    const result = await response.json();
    console.log('Fetched calculations:', result);
    return result as Calculation[];
  } catch (err: unknown) {
    const error = err as Error;
    console.error('Error in getCalculationsByGroup:', error);
    throw new Error(error.message);
  }
}

export async function getCalculationBySlugs(
  groupSlug: string,
  calcSlug: string,
  token: string
): Promise<Calculation> {
  try {
    console.log('Fetching calculation:', { groupSlug, calcSlug });
    const response = await fetch(`${api}/calculations/${groupSlug}/${calcSlug}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      console.error('Error fetching calculation:', error);
      throw new Error(error.message || 'Ошибка при получении калькуляции');
    }

    const result = await response.json();
    console.log('Fetched calculation:', result);
    return result as Calculation;
  } catch (err: unknown) {
    const error = err as Error;
    console.error('Error in getCalculationBySlugs:', error);
    throw new Error(error.message);
  }
}

export async function updateCalculation(
  groupSlug: string,
  calcSlug: string,
  data: UpdateCalculationRequest,
  token: string
): Promise<Calculation> {
  try {
    console.log('Updating calculation:', { groupSlug, calcSlug, data });
    const response = await fetch(`${api}/calculations/${groupSlug}/${calcSlug}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      console.error('Error updating calculation:', error);
      throw new Error(error.message || 'Ошибка при обновлении калькуляции');
    }

    const result = await response.json();
    console.log('Updated calculation:', result);
    return result as Calculation;
  } catch (err: unknown) {
    const error = err as Error;
    console.error('Error in updateCalculation:', error);
    throw new Error(error.message);
  }
}
