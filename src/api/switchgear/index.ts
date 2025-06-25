import { api } from '../baseUrl';

export interface SwitchgearCell {
  name: string;
  quantity: number;
}

export interface Switchgear {
  id: number;
  type: string;
  breaker: string;
  amperage: number;
  group: string;
  busbar: string;
  cells: SwitchgearCell[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateSwitchgearDto {
  type: string;
  breaker: string;
  amperage: number;
  group: string;
  busbar: string;
  cells: SwitchgearCell[];
}

export interface UpdateSwitchgearDto extends CreateSwitchgearDto {}

export interface SwitchgearFilters {
  type?: string;
  amperage?: number;
  group?: string;
}

export const switchgearApi = {
  create: async (data: CreateSwitchgearDto): Promise<Switchgear> => {
    const response = await fetch(`${api}/switchgear`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to create switchgear configuration');
    }

    return response.json();
  },

  getAll: async (filters?: SwitchgearFilters): Promise<Switchgear[]> => {
    const query = new URLSearchParams();
    if (filters?.type) query.append('type', filters.type);
    if (filters?.amperage) query.append('amperage', filters.amperage.toString());
    if (filters?.group) query.append('group', filters.group);

    const response = await fetch(`${api}/switchgear?${query.toString()}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch switchgear configurations');
    }

    return response.json();
  },

  getById: async (id: number): Promise<Switchgear> => {
    const response = await fetch(`${api}/switchgear/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch switchgear configuration');
    }

    return response.json();
  },

  update: async (id: number, data: UpdateSwitchgearDto): Promise<Switchgear> => {
    const response = await fetch(`${api}/switchgear/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to update switchgear configuration');
    }

    return response.json();
  },

  delete: async (id: number): Promise<void> => {
    const response = await fetch(`${api}/switchgear/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('DELETE /switchgear/', id, 'status:', response.status, 'text:', text);
      throw new Error('Failed to delete switchgear configuration');
    }
  },
};
