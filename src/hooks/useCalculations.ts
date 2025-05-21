import { useEffect, useState, useCallback } from 'react';
import {
  getAllCalculationGroups,
  createCalculationGroup,
  createCalculation,
  getCalculationsByGroup,
  getCalculationBySlugs,
  Calculation,
  CalculationGroup,
  CreateCalculationGroupRequest,
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
      const result = await getAllCalculationGroups(token);
      setGroups(result);
    } catch (err: any) {
      showToast(err.message || 'Ошибка при загрузке групп', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  // ✅ Загрузка калькуляций по выбранной группе
  const fetchCalculations = useCallback(async () => {
    if (!selectedGroup) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('token') || '';
      const result = await getCalculationsByGroup(selectedGroup.slug, token);
      setCalculations(result);
    } catch (err: any) {
      showToast(err.message || 'Ошибка при загрузке калькуляций', 'error');
    } finally {
      setLoading(false);
    }
  }, [selectedGroup]);

  useEffect(() => {
    fetchCalculations();
  }, [fetchCalculations]);

  // ✅ Создание группы
  const handleCreateGroup = async (data: CreateCalculationGroupRequest) => {
    try {
      const token = localStorage.getItem('token') || '';
      await createCalculationGroup(data, token);
      await fetchGroups();
      showToast('Группа создана!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Ошибка при создании группы', 'error');
    }
  };

  // ✅ Создание калькуляции
  const handleCreateCalculation = async (data: CreateCalculationRequest) => {
    try {
      const token = localStorage.getItem('token') || '';
      await createCalculation(data, token);
      await fetchCalculations();
      showToast('Калькуляция создана!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Ошибка при создании калькуляции', 'error');
    }
  };

  // ✅ Получение конкретной калькуляции
  const fetchCalculation = async (groupSlug: string, calcSlug: string) => {
    try {
      const token = localStorage.getItem('token') || '';
      const calc = await getCalculationBySlugs(groupSlug, calcSlug, token);
      setSelectedCalculation(calc);
      return calc;
    } catch (err: any) {
      showToast(err.message || 'Ошибка при получении калькуляции', 'error');
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
    handleCreateCalculation,
    fetchCalculation,
    selectedCalculation,
  };
}
