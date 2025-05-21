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

export async function createCalculationGroup(
  group: CreateCalculationGroupRequest,
  token: string
): Promise<CalculationGroup> {
  try {
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
      throw new Error(error.message || 'Ошибка при создании группы калькуляций');
    }

    return (await response.json()) as CalculationGroup;
  } catch (err: unknown) {
    const error = err as Error;
    throw new Error(error.message);
  }
}

export async function getAllCalculationGroups(token: string): Promise<CalculationGroup[]> {
  try {
    const response = await fetch(`${api}/calculations/groups`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Ошибка при получении групп калькуляций');
    }

    return (await response.json()) as CalculationGroup[];
  } catch (err: unknown) {
    const error = err as Error;
    throw new Error(error.message);
  }
}

export async function createCalculation(
  data: CreateCalculationRequest,
  token: string
): Promise<Calculation> {
  try {
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
      throw new Error(error.message || 'Ошибка при создании калькуляции');
    }

    return (await response.json()) as Calculation;
  } catch (err: unknown) {
    const error = err as Error;
    throw new Error(error.message);
  }
}

export async function getCalculationsByGroup(
  groupSlug: string,
  token: string
): Promise<Calculation[]> {
  try {
    const response = await fetch(`${api}/calculations/groups/${groupSlug}/calculations`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Ошибка при получении калькуляций в группе');
    }

    return (await response.json()) as Calculation[];
  } catch (err: unknown) {
    const error = err as Error;
    throw new Error(error.message);
  }
}

export async function getCalculationBySlugs(
  groupSlug: string,
  calcSlug: string,
  token: string
): Promise<Calculation> {
  try {
    const response = await fetch(`${api}/calculations/${groupSlug}/${calcSlug}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Ошибка при получении калькуляции');
    }

    return (await response.json()) as Calculation;
  } catch (err: unknown) {
    const error = err as Error;
    throw new Error(error.message);
  }
}
