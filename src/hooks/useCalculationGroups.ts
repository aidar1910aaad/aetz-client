import { useState, useEffect } from 'react';
import { getAllCalculationGroups, CalculationGroup } from '@/api/calculations';

export function useCalculationGroups() {
  const [groups, setGroups] = useState<CalculationGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem('token') || '';
        console.log('Fetching calculation groups...');
        const response = await getAllCalculationGroups(token);
        console.log('Calculation groups response:', response);

        if (!response || !Array.isArray(response)) {
          throw new Error('Invalid calculation groups response format');
        }

        setGroups(response);
      } catch (err) {
        console.error('Error in useCalculationGroups:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch calculation groups');
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, []);

  return { groups, loading, error };
}
