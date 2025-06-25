import { api } from '../baseUrl';

export interface CalculationGroup {
  id: number;
  name: string;
  slug: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Calculation {
  id: number;
  name: string;
  slug: string;
  data: any;
  group: CalculationGroup;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCalculationGroupRequest {
  name: string;
  slug?: string;
}

export interface CreateCalculationRequest {
  name: string;
  slug?: string;
  groupId: number;
  data: any;
}

export interface UpdateCalculationRequest {
  name?: string;
  slug?: string;
  data?: any;
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
