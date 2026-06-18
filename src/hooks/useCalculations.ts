import { useEffect, useState, useCallback, useRef } from 'react';
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

  const [groupsLoading, setGroupsLoading] = useState(true);
  const [calculationsLoading, setCalculationsLoading] = useState(false);
  const [loadedGroupSlug, setLoadedGroupSlug] = useState<string | null>(null);
  const [selectedCalculation, setSelectedCalculation] = useState<Calculation | null>(null);
  const didInitialGroupsFetch = useRef(false);

  // ✅ Загрузка групп калькуляций
  const fetchGroups = useCallback(async () => {
    setGroupsLoading(true);
    try {
      const token = localStorage.getItem('token') || '';
      const result = await getAllCalculationGroups(token);
      setGroups(result);
    } catch (err: unknown) {
      const error = err as Error;
      console.error('Error fetching groups:', error);
      showToast(error.message || 'Ошибка при загрузке групп', 'error');
    } finally {
      setGroupsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (didInitialGroupsFetch.current) {
      return;
    }
    didInitialGroupsFetch.current = true;
    fetchGroups();
  }, [fetchGroups]);

  // ✅ Загрузка калькуляций по выбранной группе
  const fetchCalculations = useCallback(async () => {
    if (!selectedGroup) {
      setCalculations([]);
      setLoadedGroupSlug(null);
      return;
    }
    setCalculationsLoading(true);
    setLoadedGroupSlug(null);
    try {
      const token = localStorage.getItem('token') || '';
      const result = await getCalculationsByGroup(selectedGroup.slug, token);
      
      
      setCalculations(result);
      setLoadedGroupSlug(selectedGroup.slug);
    } catch (err: unknown) {
      const error = err as Error;
      console.error('Error fetching calculations:', error);
      showToast(error.message || 'Ошибка при загрузке калькуляций', 'error');
      setCalculations([]);
      setLoadedGroupSlug(selectedGroup.slug);
    } finally {
      setCalculationsLoading(false);
    }
  }, [selectedGroup]);

  useEffect(() => {
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

  const loading = groupsLoading || calculationsLoading;

  return {
    groups,
    calculations,
    selectedGroup,
    setSelectedGroup,
    search,
    setSearch,
    debouncedSearch,
    loading,
    groupsLoading,
    calculationsLoading,
    loadedGroupSlug,
    handleCreateGroup,
    handleUpdateGroup,
    handleDeleteGroup,
    handleCreateCalculation,
    fetchCalculation,
    selectedCalculation,
  };
}
