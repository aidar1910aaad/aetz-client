import { api } from '../baseUrl';

export interface Transformer {
  id: number;
  model: string;
  voltage: string;
  type: string;
  power: number;
  manufacturer: string;
  price: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTransformerDto {
  model: string;
  voltage: string;
  type: string;
  power: number;
  manufacturer: string;
  price: number;
}

export interface UpdateTransformerDto extends Partial<CreateTransformerDto> {}

export const transformersApi = {
  // Get all transformers
  getAll: async (): Promise<Transformer[]> => {
    try {
      const response = await fetch(`${api}/transformers`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch transformers');
      }
      return response.json();
    } catch (error) {
      console.error('Error fetching transformers:', error);
      throw error;
    }
  },

  // Get transformer by ID
  getById: async (id: number): Promise<Transformer> => {
    try {
      const response = await fetch(`${api}/transformers/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch transformer ${id}`);
      }
      return response.json();
    } catch (error) {
      console.error(`Error fetching transformer ${id}:`, error);
      throw error;
    }
  },

  // Get transformers by voltage
  getByVoltage: async (voltage: string): Promise<Transformer[]> => {
    try {
      const response = await fetch(`${api}/transformers/voltage/${voltage}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch transformers by voltage ${voltage}`);
      }
      return response.json();
    } catch (error) {
      console.error(`Error fetching transformers by voltage ${voltage}:`, error);
      throw error;
    }
  },

  // Get transformers by type
  getByType: async (type: string): Promise<Transformer[]> => {
    try {
      const response = await fetch(`${api}/transformers/type/${type}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch transformers by type ${type}`);
      }
      return response.json();
    } catch (error) {
      console.error(`Error fetching transformers by type ${type}:`, error);
      throw error;
    }
  },

  // Get transformers by manufacturer
  getByManufacturer: async (manufacturer: string): Promise<Transformer[]> => {
    try {
      const response = await fetch(`${api}/transformers/manufacturer/${manufacturer}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch transformers by manufacturer ${manufacturer}`);
      }
      return response.json();
    } catch (error) {
      console.error(`Error fetching transformers by manufacturer ${manufacturer}:`, error);
      throw error;
    }
  },

  // Create new transformer
  create: async (data: CreateTransformerDto): Promise<Transformer> => {
    try {
      const response = await fetch(`${api}/transformers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error('Failed to create transformer');
      }
      return response.json();
    } catch (error) {
      console.error('Error creating transformer:', error);
      throw error;
    }
  },

  // Update transformer
  update: async (id: number, data: UpdateTransformerDto): Promise<Transformer> => {
    try {
      const response = await fetch(`${api}/transformers/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error(`Failed to update transformer ${id}`);
      }
      return response.json();
    } catch (error) {
      console.error(`Error updating transformer ${id}:`, error);
      throw error;
    }
  },

  // Delete transformer
  delete: async (id: number): Promise<void> => {
    try {
      const response = await fetch(`${api}/transformers/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!response.ok) {
        throw new Error(`Failed to delete transformer ${id}`);
      }
    } catch (error) {
      console.error(`Error deleting transformer ${id}:`, error);
      throw error;
    }
  },
};
