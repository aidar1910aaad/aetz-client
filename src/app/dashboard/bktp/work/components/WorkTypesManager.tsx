'use client';

import { useState, useEffect } from 'react';
import WorkTypeToggle from './WorkTypeToggle';

interface WorkTypesState {
  equipmentInstallation: boolean;
  commissioningWorks: boolean;
  foundationConstruction: boolean;
  businessTravel: boolean;
}

interface WorkTypesManagerProps {
  onWorkTypesChange?: (hasSelectedTypes: boolean) => void;
  onFoundationTabOpen?: () => void;
  onFoundationTabClose?: () => void;
  onCommissioningTabOpen?: () => void;
  onCommissioningTabClose?: () => void;
  onBusinessTravelTabOpen?: () => void;
  onBusinessTravelTabClose?: () => void;
  onBusinessTravelReset?: () => void; // Добавляем callback для сброса данных
  onInstallationTablesChange?: (shouldShow: boolean) => void;
}

export default function WorkTypesManager({ 
  onWorkTypesChange, 
  onFoundationTabOpen, 
  onFoundationTabClose,
  onCommissioningTabOpen,
  onCommissioningTabClose,
  onBusinessTravelTabOpen,
  onBusinessTravelTabClose,
  onBusinessTravelReset,
  onInstallationTablesChange
}: WorkTypesManagerProps) {
  // Загружаем сохраненное состояние из localStorage
  const getInitialState = (): WorkTypesState => {
    if (typeof window === 'undefined') {
      return {
        equipmentInstallation: false,
        commissioningWorks: false,
        foundationConstruction: false,
        businessTravel: false,
      };
    }
    
    const saved = localStorage.getItem('workTypesState');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return {
          equipmentInstallation: false,
          commissioningWorks: false,
          foundationConstruction: false,
          businessTravel: false,
        };
      }
    }
    
    return {
      equipmentInstallation: false,
      commissioningWorks: false,
      foundationConstruction: false,
      businessTravel: false,
    };
  };

  const [workTypes, setWorkTypes] = useState<WorkTypesState>(getInitialState);

  const handleToggle = (type: keyof WorkTypesState, enabled: boolean) => {
    console.log('WorkTypesManager: handleToggle called for:', type, 'enabled:', enabled);
    
    const newState = {
      ...workTypes,
      [type]: enabled
    };
    
    setWorkTypes(newState);
    
    // Сохраняем состояние в localStorage
    localStorage.setItem('workTypesState', JSON.stringify(newState));
    
    // Если включается строительство фундамента, открываем новую вкладку
    if (type === 'foundationConstruction' && enabled) {
      console.log('WorkTypesManager: Включаем строительство фундамента');
      onFoundationTabOpen?.();
    }
    
    // Если отключается строительство фундамента, закрываем вкладку
    if (type === 'foundationConstruction' && !enabled) {
      console.log('WorkTypesManager: Отключаем строительство фундамента');
      onFoundationTabClose?.();
    }
    
    // Если включаются пусконаладочные работы, открываем новую вкладку
    if (type === 'commissioningWorks' && enabled) {
      console.log('WorkTypesManager: Включаем пусконаладочные работы');
      onCommissioningTabOpen?.();
    }
    
    // Если отключаются пусконаладочные работы, закрываем вкладку
    if (type === 'commissioningWorks' && !enabled) {
      console.log('WorkTypesManager: Отключаем пусконаладочные работы');
      onCommissioningTabClose?.();
    }
    
    // Если включаются командировочные, открываем новую вкладку
    if (type === 'businessTravel' && enabled) {
      onBusinessTravelTabOpen?.();
    }
    
    // Если отключаются командировочные, закрываем вкладку и сбрасываем данные
    if (type === 'businessTravel' && !enabled) {
      onBusinessTravelTabClose?.();
      onBusinessTravelReset?.();
    }
    
    // Если включается монтаж оборудования, открываем таблицы монтажа
    if (type === 'equipmentInstallation' && enabled) {
      console.log('WorkTypesManager: Включаем монтаж оборудования');
      onInstallationTablesChange?.(true);
    }
    
    // Если отключается монтаж оборудования, закрываем таблицы монтажа
    if (type === 'equipmentInstallation' && !enabled) {
      console.log('WorkTypesManager: Отключаем монтаж оборудования');
      onInstallationTablesChange?.(false);
    }
  };

  // Отслеживаем изменения в типах работ и уведомляем родительский компонент
  useEffect(() => {
    const hasSelectedTypes = Object.values(workTypes).some(Boolean);
    onWorkTypesChange?.(hasSelectedTypes);
    
    // Показываем InstallationTables только если выбран "Монтаж Оборудования"
    const shouldShowInstallationTables = workTypes.equipmentInstallation;
    onInstallationTablesChange?.(shouldShowInstallationTables);
  }, [workTypes, onWorkTypesChange, onInstallationTablesChange]);

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Типы работ</h2>
        <p className="text-gray-600">Выберите необходимые типы работ для включения в спецификацию</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <WorkTypeToggle
          title="Монтаж Оборудования"
          description="Включить работы по монтажу оборудования в спецификацию"
          isEnabled={workTypes.equipmentInstallation}
          onToggle={(enabled) => handleToggle('equipmentInstallation', enabled)}
          icon={
            <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          }
        />

        <WorkTypeToggle
          title="Пусконаладочные работы"
          description="Включить пусконаладочные работы в спецификацию"
          isEnabled={workTypes.commissioningWorks}
          onToggle={(enabled) => handleToggle('commissioningWorks', enabled)}
          icon={
            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />

        <WorkTypeToggle
          title="Строительство фундамента"
          description="Включить работы по строительству фундамента в спецификацию"
          isEnabled={workTypes.foundationConstruction}
          onToggle={(enabled) => handleToggle('foundationConstruction', enabled)}
          icon={
            <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          }
        />

        <WorkTypeToggle
          title="Командировочные"
          description="Включить командировочные расходы в спецификацию"
          isEnabled={workTypes.businessTravel}
          onToggle={(enabled) => handleToggle('businessTravel', enabled)}
          icon={
            <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          }
        />
      </div>
    </div>
  );
}
