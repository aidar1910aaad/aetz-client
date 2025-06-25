import { useState, useEffect } from 'react';
import {
  transformersApi,
  Transformer,
  CreateTransformerDto,
  UpdateTransformerDto,
} from '@/api/transformers';

export const useTransformers = () => {
  const [transformers, setTransformers] = useState<Transformer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransformers = async () => {
    try {
      setLoading(true);
      const data = await transformersApi.getAll();
      setTransformers(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch transformers');
      console.error('Error fetching transformers:', err);
    } finally {
      setLoading(false);
    }
  };

  const createTransformer = async (data: CreateTransformerDto) => {
    try {
      const newTransformer = await transformersApi.create(data);
      setTransformers((prev) => [...prev, newTransformer]);
      return newTransformer;
    } catch (err) {
      setError('Failed to create transformer');
      console.error('Error creating transformer:', err);
      throw err;
    }
  };

  const updateTransformer = async (id: number, data: UpdateTransformerDto) => {
    try {
      const updatedTransformer = await transformersApi.update(id, data);
      setTransformers((prev) =>
        prev.map((transformer) => (transformer.id === id ? updatedTransformer : transformer))
      );
      return updatedTransformer;
    } catch (err) {
      setError('Failed to update transformer');
      console.error('Error updating transformer:', err);
      throw err;
    }
  };

  const deleteTransformer = async (id: number) => {
    try {
      await transformersApi.delete(id);
      setTransformers((prev) => prev.filter((transformer) => transformer.id !== id));
    } catch (err) {
      setError('Failed to delete transformer');
      console.error('Error deleting transformer:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchTransformers();
  }, []);

  return {
    transformers,
    loading,
    error,
    createTransformer,
    updateTransformer,
    deleteTransformer,
    refreshTransformers: fetchTransformers,
  };
};
