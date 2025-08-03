import { useEffect, useState, useCallback } from 'react';
import {
  getAllCalculationGroups,
  createCalculationGroup,
  updateCalculationGroup,
  deleteCalculationGroup,
  createCalculation,
  getCalculationsByGroup,
  getCalculationBySlugs,
  Calculation,
  CalculationGroup,
  CreateCalculationGroupRequest,
  UpdateCalculationGroupRequest,
  CreateCalculationRequest,
} from '@/api/calculations';
import { showToast } from '@/shared/modals/ToastProvider';
import { showConfirm } from '@/shared/modals/ConfirmModal';
import { useDebounce } from '@/hooks/useDebounce';

export function useCalculations() {
  const [groups, setGroups] = useState<CalculationGroup[]>([]);
  const [calculations, setCalculations] = useState<Calculation[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<CalculationGroup | null>(null);

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 500);

  const [loading, setLoading] = useState(true);
  const [selectedCalculation, setSelectedCalculation] = useState<Calculation | null>(null);

  // ✅ Загрузка групп калькуляций
  const fetchGroups = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token') || '';
      console.log('Fetching calculation groups...');
      const result = await getAllCalculationGroups(token);
      console.log('Fetched groups:', result);
      setGroups(result);
    } catch (err: unknown) {
      const error = err as Error;
      console.error('Error fetching groups:', error);
      showToast(error.message || 'Ошибка при загрузке групп', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    console.log('Initial fetchGroups effect triggered');
    fetchGroups();
  }, [fetchGroups]);

  // ✅ Загрузка калькуляций по выбранной группе
  const fetchCalculations = useCallback(async () => {
    if (!selectedGroup) {
      console.log('No selected group, skipping calculations fetch');
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem('token') || '';
      console.log('Fetching calculations for group:', selectedGroup.slug);
      const result = await getCalculationsByGroup(selectedGroup.slug, token);
      console.log('Fetched calculations:', result);
      setCalculations(result);
    } catch (err: unknown) {
      const error = err as Error;
      console.error('Error fetching calculations:', error);
      showToast(error.message || 'Ошибка при загрузке калькуляций', 'error');
    } finally {
      setLoading(false);
    }
  }, [selectedGroup]);

  useEffect(() => {
    console.log('Selected group changed:', selectedGroup);
    fetchCalculations();
  }, [fetchCalculations, selectedGroup]);

  // ✅ Создание группы
  const handleCreateGroup = async (data: CreateCalculationGroupRequest) => {
    try {
      const token = localStorage.getItem('token') || '';
      await createCalculationGroup(data, token);
      await fetchGroups();
      showToast('Группа создана!', 'success');
    } catch (err: unknown) {
      const error = err as Error;
      showToast(error.message || 'Ошибка при создании группы', 'error');
    }
  };

  // ✅ Обновление группы
  const handleUpdateGroup = async (slug: string, data: UpdateCalculationGroupRequest) => {
    try {
      const token = localStorage.getItem('token') || '';
      await updateCalculationGroup(slug, data, token);
      await fetchGroups();
      showToast('Группа обновлена!', 'success');
    } catch (err: unknown) {
      const error = err as Error;
      showToast(error.message || 'Ошибка при обновлении группы', 'error');
    }
  };

  // ✅ Удаление группы
  const handleDeleteGroup = async (id: number) => {
    try {
      const token = localStorage.getItem('token') || '';
      await deleteCalculationGroup(id, token);
      await fetchGroups();
      showToast('Группа удалена!', 'success');
    } catch (err: unknown) {
      const error = err as Error;
      showToast(error.message || 'Ошибка при удалении группы', 'error');
    }
  };

  // ✅ Создание калькуляции
  const handleCreateCalculation = async (data: CreateCalculationRequest) => {
    try {
      const token = localStorage.getItem('token') || '';
      await createCalculation(data, token);
      await fetchCalculations();
      showToast('Калькуляция создана!', 'success');
    } catch (err: unknown) {
      const error = err as Error;
      showToast(error.message || 'Ошибка при создании калькуляции', 'error');
    }
  };

  // ✅ Получение конкретной калькуляции
  const fetchCalculation = async (groupSlug: string, calcSlug: string) => {
    try {
      const token = localStorage.getItem('token') || '';
      const calc = await getCalculationBySlugs(groupSlug, calcSlug, token);
      setSelectedCalculation(calc);
      return calc;
    } catch (err: unknown) {
      const error = err as Error;
      showToast(error.message || 'Ошибка при получении калькуляции', 'error');
      return null;
    }
  };

  return {
    groups,
    calculations,
    selectedGroup,
    setSelectedGroup,
    search,
    setSearch,
    debouncedSearch,
    loading,
    handleCreateGroup,
    handleUpdateGroup,
    handleDeleteGroup,
    handleCreateCalculation,
    fetchCalculation,
    selectedCalculation,
  };
}
