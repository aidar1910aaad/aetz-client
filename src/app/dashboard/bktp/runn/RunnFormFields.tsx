'use client';

import { useState, useEffect } from 'react';
import { useRunnStore } from '@/store/useRunnStore';
import { useRunnSettings } from '@/hooks/useRunnSettings';
import { getMaterialsByCategoryId, Material } from '@/api/material';
import { getAllCategories } from '@/api/categories';
import { useAutoMaterialSelection } from '@/hooks/useAutoMaterialSelection';
import RunnGlobalConfig from './RunnGlobalConfig';
import RunnCellTable from './RunnCellTable';
import { RunnBusbarSystem } from '@/components/runn/RunnBusbarSystem';
import { RunnBusBridge } from '@/components/runn/RunnBusBridge';
import { RunnConfigTabs } from '@/components/runn/RunnConfigTabs';

type TabType = 'global' | 'cells' | 'bus-bridge';

export default function RunnFormFields() {
  const { global } = useRunnStore();
  const { selectedCategories } = useRunnSettings();

  // Состояние для материалов
  const [materials, setMaterials] = useState<Material[]>([]);
  const [materialsLoading, setMaterialsLoading] = useState(false);
  const [meterMaterials, setMeterMaterials] = useState<Material[]>([]);
  const [meterMaterialsLoading, setMeterMaterialsLoading] = useState(false);
  const [rpsLeftMaterials, setRpsLeftMaterials] = useState<Material[]>([]);
  const [rpsLeftMaterialsLoading, setRpsLeftMaterialsLoading] = useState(false);

  // Получаем автоматически выбранные материалы
  const {
    autoSelectedMaterial,
    autoSelectedSvMaterial,
    transformerPower,
    recommendedCurrent,
    recommendedSvCurrent,
  } = useAutoMaterialSelection({
    categoryMaterials: materials,
    categoryName: global.withdrawableBreaker || '',
  });

  // Сохраняем активную вкладку в localStorage
  const [activeTab, setActiveTab] = useState<TabType>(() => {
    if (typeof window !== 'undefined') {
      const savedTab = localStorage.getItem('runn-active-tab') as TabType;
      return savedTab || 'global';
    }
    return 'global';
  });

  // Функция для получения материалов по выбранной категории
  const fetchMaterialsByCategory = async (categoryName: string) => {
    if (!categoryName || !selectedCategories) {
      setMaterials([]);
      return;
    }

    setMaterialsLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('Токен не найден');
        return;
      }

      const category = selectedCategories.avtomatVyk?.find((cat) => cat.name === categoryName);
      if (!category) {
        setMaterials([]);
        return;
      }

      const materialsData = await getMaterialsByCategoryId(parseInt(category.id), token);
      setMaterials(materialsData);
    } catch (error) {
      console.error('Ошибка получения материалов:', error);
      setMaterials([]);
    } finally {
      setMaterialsLoading(false);
    }
  };

  // Функция для получения материалов счетчика
  const fetchMeterMaterialsByCategory = async (categoryName: string) => {
    if (!categoryName || !selectedCategories) {
      setMeterMaterials([]);
      return;
    }

    setMeterMaterialsLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('Токен не найден');
        return;
      }

      const category = selectedCategories.counter?.find((cat) => cat.name === categoryName);
      if (!category) {
        setMeterMaterials([]);
        return;
      }

      const materialsData = await getMaterialsByCategoryId(parseInt(category.id), token);
      setMeterMaterials(materialsData);
    } catch (error) {
      console.error('Ошибка получения материалов счетчика:', error);
      setMeterMaterials([]);
    } finally {
      setMeterMaterialsLoading(false);
    }
  };

  // Функция для получения материалов РПС левый
  const fetchRpsLeftMaterials = async () => {
    setRpsLeftMaterialsLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('Токен не найден');
        return;
      }

      console.log('🔍 Ищем категорию "РПС левый" среди всех категорий...');
      
      // Сначала получаем все категории
      const allCategories = await getAllCategories(token);
      console.log('📋 Все категории в системе:', allCategories.map(cat => `${cat.id}: ${cat.name}`));
      
      // Ищем категорию "РПС левый"
      const rpsLeftCategory = allCategories.find(cat => 
        cat.name.toLowerCase().includes('рпс') && cat.name.toLowerCase().includes('лев')
      );
      
      if (!rpsLeftCategory) {
        console.error('❌ Категория "РПС левый" не найдена в системе');
        console.log('📝 Доступные категории:', allCategories.map(cat => cat.name));
        setRpsLeftMaterials([]);
        return;
      }

      console.log('✅ Найдена категория РПС левый:', rpsLeftCategory);
      console.log('📦 Загружаем материалы из категории ID:', rpsLeftCategory.id);
      
      const materialsData = await getMaterialsByCategoryId(rpsLeftCategory.id, token);
      console.log('✅ Полученные материалы РПС левый:', materialsData);
      setRpsLeftMaterials(materialsData);
    } catch (error) {
      console.error('Ошибка получения материалов РПС левый:', error);
      setRpsLeftMaterials([]);
    } finally {
      setRpsLeftMaterialsLoading(false);
    }
  };

  // При изменении выбранной категории автомата выкатного
  useEffect(() => {
    if (global.withdrawableBreaker && selectedCategories) {
      fetchMaterialsByCategory(global.withdrawableBreaker);
    } else {
      setMaterials([]);
    }
  }, [global.withdrawableBreaker, selectedCategories]);

  // При изменении выбранной категории счетчика
  useEffect(() => {
    if (global.meterType && selectedCategories) {
      fetchMeterMaterialsByCategory(global.meterType);
    } else {
      setMeterMaterials([]);
    }
  }, [global.meterType, selectedCategories]);

  // Загружаем материалы РПС левый при монтировании компонента
  useEffect(() => {
    console.log('🔍 RunnFormFields: Загружаем материалы РПС левый при инициализации');
    fetchRpsLeftMaterials();
  }, []); // Пустой массив зависимостей - загружаем только один раз

  // Сохраняем активную вкладку при изменении
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    if (typeof window !== 'undefined') {
      localStorage.setItem('runn-active-tab', tab);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'global':
        return (
          <RunnGlobalConfig
            materials={materials}
            autoSelectedMaterial={autoSelectedMaterial}
            autoSelectedSvMaterial={autoSelectedSvMaterial}
            transformerPower={transformerPower}
            recommendedCurrent={recommendedCurrent}
            recommendedSvCurrent={recommendedSvCurrent}
          />
        );
      case 'cells':
        return (
          <RunnCellTable
            categoryMaterials={materials}
            autoSelectedMaterial={autoSelectedMaterial}
            autoSelectedSvMaterial={autoSelectedSvMaterial}
            meterMaterials={meterMaterials}
            meterMaterialsLoading={meterMaterialsLoading}
            rpsLeftMaterials={rpsLeftMaterials}
          />
        );
      case 'bus-bridge':
        return (
          <div className="space-y-8">
            <RunnBusbarSystem />
            <RunnBusBridge />
          </div>
        );
      default:
        return (
          <RunnGlobalConfig
            materials={materials}
            autoSelectedMaterial={autoSelectedMaterial}
            autoSelectedSvMaterial={autoSelectedSvMaterial}
            transformerPower={transformerPower}
            recommendedCurrent={recommendedCurrent}
            recommendedSvCurrent={recommendedSvCurrent}
          />
        );
    }
  };

  // Отладочная информация о состоянии материалов РПС
  console.log('🔧 RunnFormFields состояние RPS материалов:', {
    rpsLeftMaterials: rpsLeftMaterials.length,
    rpsLeftMaterialsLoading,
    selectedCategories: selectedCategories?.rpsLeft?.length || 0
  });

  return (
    <div className="space-y-6">
      {/* Tabs Navigation */}
      <RunnConfigTabs activeTab={activeTab} onTabChange={handleTabChange} />

      {/* Tab Content */}
      <div className="pt-4">{renderTabContent()}</div>
    </div>
  );
}
