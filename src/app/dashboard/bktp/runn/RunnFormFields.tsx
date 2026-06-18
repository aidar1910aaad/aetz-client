'use client';

import { useState, useEffect } from 'react';
import { useRunnStore } from '@/store/useRunnStore';
import { useRunnSettings } from '@/hooks/useRunnSettings';
import { useRunnMaterials } from '@/hooks/useRunnMaterials';
import { useRunnBreakerCalculation, useRunnCounterCalculation, useRunnSectionSwitchCalculation, useRunnOutgoingCalculation } from '@/hooks/useRunnInputCalculation';
import { useRunnBusbarBridgeCalculation } from '@/hooks/useRunnBusbarBridgeCalculation';
import { getMaterialsByCategoryId, Material } from '@/api/material';
import { useAutoMaterialSelection } from '@/hooks/useAutoMaterialSelection';
import RunnGlobalConfig from './RunnGlobalConfig';
import RunnCellTable from './RunnCellTable';
import RunnGeneralSummary from './components/summary/RunnGeneralSummary';
import { RunnConfigTabs } from '@/components/runn/RunnConfigTabs';
import { BusbarSystemContainer } from '@/components/runn/BusbarSystem/BusbarSystemContainer';
import { BusbarBridgeCalculation } from '@/components/runn/BusbarBridge/BusbarBridgeCalculation';
import RunnDguSection from './components/RunnDguSection';

export type RunnTabType = 'main' | 'dgu';

interface RunnFormFieldsProps {
  activeTab: RunnTabType;
  onTabChange: (tab: RunnTabType) => void;
}

export default function RunnFormFields({ activeTab, onTabChange }: RunnFormFieldsProps) {
  const { global, cellConfigs } = useRunnStore();
  const { selectedCategories, loading: settingsLoading } = useRunnSettings({
    skipMaterialsLoad: true,
  });
  const { materials: runnMaterials, loading: runnMaterialsLoading } = useRunnMaterials();
  
  // Инициализируем расчеты для шинных мостов
  useRunnBusbarBridgeCalculation();
  
  // Получаем калькуляции для разных типов ячеек
  const inputCell = cellConfigs.find(cell => cell.purpose === 'Ввод');
  const sectionSwitchCell = cellConfigs.find(cell => cell.purpose === 'Секционный выключатель');
  
  const { calculation: breakerCalculation } = useRunnBreakerCalculation(inputCell || null);
  const { calculation: counterCalculation } = useRunnCounterCalculation(inputCell || null);
  const { calculation: sectionSwitchCalculation } = useRunnSectionSwitchCalculation(sectionSwitchCell || null, inputCell || null);
  const { calculation: outgoingCalculation } = useRunnOutgoingCalculation(inputCell || null);

  // Упрощенное состояние для материалов
  const [materials, setMaterials] = useState<Material[]>([]);
  const [meterMaterials, setMeterMaterials] = useState<Material[]>([]);
  const [materialsLoading, setMaterialsLoading] = useState(false);
  
  // Определяем общее состояние загрузки
  const isAnyLoading = runnMaterialsLoading || materialsLoading;

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


  // Универсальная функция для получения материалов
  const fetchMaterials = async (categoryName: string, categoryType: 'avtomatVyk' | 'counter' | 'avtomatLity', setter: (materials: Material[]) => void) => {
    if (!categoryName || !selectedCategories) {
      setter([]);
      return;
    }

    setMaterialsLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('Токен не найден');
        return;
      }

      const category = selectedCategories[categoryType]?.find((cat) => cat.name === categoryName);
      
      if (!category) {
        setter([]);
        return;
      }

      const categoryId = parseInt(category.id);

      if (isNaN(categoryId) || categoryId <= 0 || categoryId > 2147483647) {
        console.error(`Неправильный ID категории: ${category.id} (${category.name}). ID должен быть числом от 1 до 2147483647.`);
        setter([]);
        return;
      }

      const materialsData = await getMaterialsByCategoryId(categoryId, token);
      setter(materialsData);
    } catch (error) {
      console.error('Ошибка получения материалов:', error);
      setter([]);
    } finally {
      setMaterialsLoading(false);
    }
  };

  // При изменении выбранной категории автомата выкатного
  useEffect(() => {
    if (global.withdrawableBreaker && selectedCategories) {
      fetchMaterials(global.withdrawableBreaker, 'avtomatVyk', setMaterials);
    } else {
      setMaterials([]);
    }
  }, [global.withdrawableBreaker, selectedCategories]);

  // При изменении выбранной категории счетчика
  useEffect(() => {
    if (global.meterType && selectedCategories) {
      fetchMaterials(global.meterType, 'counter', setMeterMaterials);
    } else {
      setMeterMaterials([]);
    }
  }, [global.meterType, selectedCategories]);


  const summaryBlock = (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Общая сводка</h3>
      <RunnGeneralSummary
        cellConfigs={cellConfigs}
        breakerCalculation={breakerCalculation}
        counterCalculation={counterCalculation}
        sectionSwitchCalculation={sectionSwitchCalculation}
        outgoingCalculation={outgoingCalculation}
        runnMaterials={runnMaterials}
      />
    </div>
  );

  const renderTabContent = () => {
    if (activeTab === 'dgu') {
      return (
        <div className="space-y-8">
          <RunnDguSection
            categoryMaterials={materials}
            meterMaterials={meterMaterials}
            meterMaterialsLoading={materialsLoading}
            rpsLeftMaterials={runnMaterials.rpsLeft}
            runnMaterials={runnMaterials}
          />
        </div>
      );
    }

    return (
      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Общие настройки</h3>
          <RunnGlobalConfig
            materials={materials}
            selectedCategories={selectedCategories}
            settingsLoading={settingsLoading}
          />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Ячейки</h3>
              <RunnCellTable
                categoryMaterials={materials}
                autoSelectedMaterial={autoSelectedMaterial}
                autoSelectedSvMaterial={autoSelectedSvMaterial}
                meterMaterials={meterMaterials}
                rpsLeftMaterials={runnMaterials.rpsLeft}
                fusesPnMaterials={runnMaterials.fusesPn}
                avtomatLityMaterials={runnMaterials.avtomatLity}
                runnMaterials={runnMaterials}
              />
        </div>
        <BusbarSystemContainer />
        <BusbarBridgeCalculation />
        {summaryBlock}
      </div>
    );
  };



  return (
    <div className="space-y-6">
      {/* Tabs Navigation */}
      <RunnConfigTabs activeTab={activeTab} onTabChange={onTabChange} />

      {/* Loading Indicator */}
      {isAnyLoading && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent"></div>
            <span className="text-blue-700 font-medium">Загрузка конфигурации...</span>
          </div>
        </div>
      )}

      {/* Tab Content */}
      <div className="pt-4">{renderTabContent()}</div>
    </div>
  );
}
