'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Breadcrumbs from '@/components/Breadcrumbs/Breadcrumbs';
import { useWorksStore } from '@/store/useWorksStore';
import { useWorkVisibilityStore } from '@/store/useWorkVisibilityStore';
import { useBmzStore } from '@/store/useBmzStore';
import { useAutoWorksCalculation } from '@/hooks/useAutoWorksCalculation';
import WorksTable from '@/components/FinalReview/WorksTable';
import WorkTypesManager from './components/WorkTypesManager';
import InstallationTables from './components/InstallationTables';
import FoundationInstallationTab from './components/FoundationInstallationTab';
import CommissioningWorksTab from './components/CommissioningWorksTab';
import BusinessTravelTab from './components/BusinessTravelTab';

export default function WorkPage() {
  const { 
    selected, 
    worksList, 
    isEnabled, 
    setEnabled, 
    toggleWork, 
    updateWorkCount,
    setWorksList,
    forceUpdateWorksList
  } = useWorksStore();

  // Отладочная информация о состоянии store
  console.log('WorkPage: selected works:', Object.keys(selected).filter(key => selected[key]?.checked));
  console.log('WorkPage: worksList:', worksList.map(w => w.name));
  console.log('WorkPage: worksList details:', worksList);
  console.log('WorkPage: selected state:', selected);

  // Принудительно обновляем worksList если в нем нет пусконаладочных работ
  useEffect(() => {
    if (worksList.length < 2 || !worksList.some(w => w.name === 'Пусконаладочные работы')) {
      console.log('WorkPage: Forcing update of worksList');
      forceUpdateWorksList();
    }
  }, [worksList, forceUpdateWorksList]);
  
  const { 
    isWorksEnabled, 
    isPageVisible 
  } = useWorkVisibilityStore();

  const bmzStore = useBmzStore();

  // Ref для отслеживания предыдущих значений BMZ
  const prevBmzValues = useRef({ length: 0, width: 0 });

  // Состояние для отслеживания выбранных типов работ
  const [hasSelectedWorkTypes, setHasSelectedWorkTypes] = useState(false);
  
  // Состояние для отслеживания открытия вкладки фундамента
  const [isFoundationTabOpen, setIsFoundationTabOpen] = useState(false);
  
  // Состояние для отслеживания открытия вкладки пусконаладочных работ
  const [isCommissioningTabOpen, setIsCommissioningTabOpen] = useState(false);
  
  // Состояние для отслеживания открытия вкладки командировочных расходов
  const [isBusinessTravelTabOpen, setIsBusinessTravelTabOpen] = useState(false);
  
  // Состояние для отслеживания показа InstallationTables
  const [shouldShowInstallationTables, setShouldShowInstallationTables] = useState(false);
  
  // Состояние для суммы командировочных расходов
  const [businessTravelTotal, setBusinessTravelTotal] = useState(0);

  // Флаг для отслеживания инициализации командировочных
  const [isBusinessTravelInitialized, setIsBusinessTravelInitialized] = useState(false);

  // Восстанавливаем сумму командировочных из localStorage при загрузке
  useEffect(() => {
    if (typeof window !== 'undefined' && !isBusinessTravelInitialized) {
      const saved = localStorage.getItem('businessTravelTotal');
      if (saved) {
        try {
          const total = Number(saved);
          setBusinessTravelTotal(total);
        } catch (error) {
          console.error('Ошибка при восстановлении суммы командировочных:', error);
        }
      }
      setIsBusinessTravelInitialized(true);
    }
  }, [isBusinessTravelInitialized]);

  // Сохраняем сумму командировочных в localStorage только после инициализации
  useEffect(() => {
    if (typeof window !== 'undefined' && isBusinessTravelInitialized) {
      localStorage.setItem('businessTravelTotal', businessTravelTotal.toString());
    }
  }, [businessTravelTotal, isBusinessTravelInitialized]);

  // Callback для обновления суммы командировочных
  const handleBusinessTravelTotalChange = useCallback((total: number) => {
    setBusinessTravelTotal(total);
  }, []);

  // Автоматически рассчитываем работы на основе проекта
  useAutoWorksCalculation();

  // Восстанавливаем состояние вкладок при загрузке страницы
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedState = localStorage.getItem('workTypesState');
      console.log('WorkPage: Восстанавливаем состояние вкладок, savedState:', savedState);
      if (savedState) {
        try {
          const workTypes = JSON.parse(savedState);
          console.log('WorkPage: Восстановленные типы работ:', workTypes);
          
          // Открываем соответствующие вкладки если они были включены
          if (workTypes.foundationConstruction) {
            console.log('WorkPage: Восстанавливаем вкладку фундамента');
            // Добавляем небольшую задержку для восстановления BMZ store
            setTimeout(() => {
              handleFoundationTabOpen();
            }, 100);
          }
          if (workTypes.commissioningWorks) {
            console.log('WorkPage: Восстанавливаем вкладку пусконаладочных работ');
            handleCommissioningTabOpen();
          }
          if (workTypes.businessTravel) {
            console.log('WorkPage: Восстанавливаем вкладку командировочных');
            handleBusinessTravelTabOpen();
          }
        } catch (error) {
          console.error('Ошибка при восстановлении состояния:', error);
        }
      }
    }
  }, []); // Пустой массив зависимостей - выполняется только при монтировании

  // Отслеживаем изменения размеров БМЗ и обновляем количество фундамента
  useEffect(() => {
    const foundationWorkName = 'Монтаж фундамента (с материалами) за м²';
    
    // Если работа фундамента выбрана, обновляем её количество
    if (selected[foundationWorkName]?.checked) {
      const lengthMm = bmzStore.length || 0;
      const widthMm = bmzStore.width || 0;
      
      // Проверяем, изменились ли размеры БМЗ
      const hasChanged = 
        prevBmzValues.current.length !== lengthMm || 
        prevBmzValues.current.width !== widthMm;
      
      if (hasChanged) {
        const areaM2 = lengthMm > 0 && widthMm > 0 
          ? Math.round((lengthMm * widthMm) / 1000000 * 100) / 100
          : 1;
        
        // Обновляем количество только если оно изменилось
        const currentCount = selected[foundationWorkName]?.count || 1;
        if (Math.abs(currentCount - areaM2) > 0.01) {
          updateWorkCount(foundationWorkName, areaM2);
        }
        
        // Обновляем предыдущие значения
        prevBmzValues.current = { length: lengthMm, width: widthMm };
      }
    }
  }, [bmzStore.length, bmzStore.width, selected, updateWorkCount]);

  // Дополнительная проверка для восстановления работы по фундаменту
  useEffect(() => {
    const foundationWorkName = 'Монтаж фундамента (с материалами) за м²';
    
    // Если работа фундамента выбрана, но количество равно 1 (значит BMZ не загружен)
    if (selected[foundationWorkName]?.checked && selected[foundationWorkName]?.count === 1) {
      const lengthMm = bmzStore.length || 0;
      const widthMm = bmzStore.width || 0;
      
      // Если размеры БМЗ загружены, обновляем количество
      if (lengthMm > 0 && widthMm > 0) {
        const areaM2 = Math.round((lengthMm * widthMm) / 1000000 * 100) / 100;
        updateWorkCount(foundationWorkName, areaM2);
      }
    }
  }, [bmzStore.length, bmzStore.width, selected, updateWorkCount]);

  // Обработчик изменения типов работ
  const handleWorkTypesChange = useCallback((hasSelectedTypes: boolean) => {
    setHasSelectedWorkTypes(hasSelectedTypes);
  }, []);

  // Обработчик изменения показа InstallationTables
  const handleInstallationTablesChange = useCallback((shouldShow: boolean) => {
    setShouldShowInstallationTables(shouldShow);
    
    // Включаем/выключаем работы в store
    setEnabled(shouldShow);
    console.log('handleInstallationTablesChange: setEnabled called with:', shouldShow);
  }, [setEnabled]);

  // Обработчики открытия и закрытия вкладки фундамента
  const handleFoundationTabOpen = useCallback(() => {
    setIsFoundationTabOpen(true);
    console.log('handleFoundationTabOpen: Открываем вкладку фундамента');
    
    // Получаем данные из BMZ store для расчета площади
    const bmzStore = useBmzStore.getState();
    const lengthMm = bmzStore.length || 0;
    const widthMm = bmzStore.width || 0;
    
    console.log('handleFoundationTabOpen: BMZ размеры:', { lengthMm, widthMm });
    
    // Конвертируем в квадратные метры
    const areaM2 = lengthMm > 0 && widthMm > 0 
      ? Math.round((lengthMm * widthMm) / 1000000 * 100) / 100
      : 1;
    
    console.log('handleFoundationTabOpen: Площадь фундамента:', areaM2);
    
    const foundationWorkName = 'Монтаж фундамента (с материалами) за м²';
    const workPricePerM2 = 50000;
    const totalWorkCost = areaM2 * workPricePerM2;
    
    // Получаем актуальное состояние из store
    const currentState = useWorksStore.getState();
    const currentWork = currentState.selected[foundationWorkName];
    
    // Обновляем цену работы в worksList на итоговую сумму
    const updatedWorksList = currentState.worksList.map(work => {
      if (work.name === foundationWorkName) {
        return {
          ...work,
          price: totalWorkCost,
          unit: 'раб'
        };
      }
      return work;
    });
    
    setWorksList(updatedWorksList);
    
    // Работа по фундаменту уже есть в worksList, просто выбираем её
    console.log('handleFoundationTabOpen: Текущее состояние selected:', currentWork);
    if (!currentWork?.checked) {
      console.log('handleFoundationTabOpen: Работа не выбрана, выбираем её');
      toggleWork(foundationWorkName);
    } else {
      console.log('handleFoundationTabOpen: Работа уже выбрана');
    }
    
    // Устанавливаем количество всегда 1
    console.log('handleFoundationTabOpen: Устанавливаем количество на 1');
    updateWorkCount(foundationWorkName, 1);
    
    // Проверяем состояние после обновления
    setTimeout(() => {
      const currentState = useWorksStore.getState();
      console.log('handleFoundationTabOpen: Состояние после обновления:', currentState.selected[foundationWorkName]);
    }, 100);
  }, [toggleWork, updateWorkCount, setWorksList]);
  
  const handleFoundationTabClose = useCallback(() => {
    setIsFoundationTabOpen(false);
    
    // Отключаем работу "Монтаж фундамента" при закрытии вкладки
    const foundationWorkName = 'Монтаж фундамента (с материалами) за м²';
    if (selected[foundationWorkName]?.checked) {
      toggleWork(foundationWorkName);
    }
  }, [selected, toggleWork]);

  // Обработчики открытия и закрытия вкладки пусконаладочных работ
  const handleCommissioningTabOpen = useCallback(() => {
    setIsCommissioningTabOpen(true);
    console.log('handleCommissioningTabOpen: Открываем вкладку пусконаладочных работ');
    
    const commissioningWorkName = 'Пусконаладочные работы';
    
    // Получаем актуальное состояние из store
    const currentState = useWorksStore.getState();
    const currentWork = currentState.selected[commissioningWorkName];
    
    console.log('handleCommissioningTabOpen: Текущее состояние selected:', currentWork);
    if (!currentWork?.checked) {
      console.log('handleCommissioningTabOpen: Работа не выбрана, выбираем её');
      toggleWork(commissioningWorkName);
    } else {
      console.log('handleCommissioningTabOpen: Работа уже выбрана');
    }
    
    // Проверяем состояние после обновления
    setTimeout(() => {
      const currentState = useWorksStore.getState();
      console.log('handleCommissioningTabOpen: Состояние после обновления:', currentState.selected[commissioningWorkName]);
    }, 100);
  }, [toggleWork]);
  
  const handleCommissioningTabClose = useCallback(() => {
    setIsCommissioningTabOpen(false);
    
    // Отключаем работу "Пусконаладочные работы" при закрытии вкладки
    const commissioningWorkName = 'Пусконаладочные работы';
    const currentState = useWorksStore.getState();
    const currentWork = currentState.selected[commissioningWorkName];
    
    if (currentWork?.checked) {
      toggleWork(commissioningWorkName);
    }
  }, [toggleWork]);

  // Обработчики открытия и закрытия вкладки командировочных расходов
  const handleBusinessTravelTabOpen = useCallback(() => {
    setIsBusinessTravelTabOpen(true);
  }, []);
  
  const handleBusinessTravelTabClose = useCallback(() => {
    setIsBusinessTravelTabOpen(false);
    
    // Очищаем все данные командировочных при отключении
    if (typeof window !== 'undefined') {
      localStorage.removeItem('businessTravelBrigades');
      localStorage.removeItem('businessTravelTotal');
      console.log('Данные командировочных очищены при отключении');
    }
    
    // Сбрасываем сумму командировочных в состоянии
    setBusinessTravelTotal(0);
  }, []);

  // Callback для сброса данных командировочных
  const handleBusinessTravelReset = useCallback(() => {
    // Сброс данных командировочных
  }, []);

  // Callback для выбора работы по фундаменту
  const handleFoundationWorkSelect = useCallback(() => {
    const foundationWorkName = 'Монтаж фундамента (с материалами) за м²';
    console.log('handleFoundationWorkSelect: Выбираем работу по фундаменту');
    console.log('handleFoundationWorkSelect: Текущее состояние selected:', selected[foundationWorkName]);
    
    // Получаем данные из BMZ store для расчета площади
    const bmzStore = useBmzStore.getState();
    const lengthMm = bmzStore.length || 0;
    const widthMm = bmzStore.width || 0;
    
    console.log('handleFoundationWorkSelect: BMZ размеры:', { lengthMm, widthMm });
    
    // Конвертируем в квадратные метры
    const areaM2 = lengthMm > 0 && widthMm > 0 
      ? Math.round((lengthMm * widthMm) / 1000000 * 100) / 100
      : 1;
    
    console.log('handleFoundationWorkSelect: Площадь фундамента:', areaM2);
    
    const workPricePerM2 = 50000;
    const totalWorkCost = areaM2 * workPricePerM2;
    
    // Обновляем цену работы в worksList на итоговую сумму
    const currentState = useWorksStore.getState();
    const updatedWorksList = currentState.worksList.map(work => {
      if (work.name === foundationWorkName) {
        return {
          ...work,
          price: totalWorkCost,
          unit: 'раб'
        };
      }
      return work;
    });
    
    setWorksList(updatedWorksList);
    
    // Выбираем работу и устанавливаем количество
    if (!selected[foundationWorkName]?.checked) {
      console.log('handleFoundationWorkSelect: Работа не выбрана, выбираем её');
      toggleWork(foundationWorkName);
    } else {
      console.log('handleFoundationWorkSelect: Работа уже выбрана, только обновляем количество');
    }
    
    // Устанавливаем количество всегда 1
    console.log('handleFoundationWorkSelect: Устанавливаем количество на 1');
    updateWorkCount(foundationWorkName, 1);
    
    // Проверяем состояние после обновления
    setTimeout(() => {
      const currentState = useWorksStore.getState();
      console.log('handleFoundationWorkSelect: Состояние после обновления:', currentState.selected[foundationWorkName]);
    }, 100);
  }, [selected, toggleWork, updateWorkCount, setWorksList]);

  return (
    <div className="h-[calc(100vh-64px)] bg-white flex flex-col">
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          <Breadcrumbs />
          
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-gray-100 rounded-xl">
                <svg className="w-6 h-6 text-[#8eba1e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Работы и монтаж</h1>
                <p className="text-gray-600">Настройте работы и монтажные операции</p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
          {/* Компонент с типами работ */}
          <WorkTypesManager 
            onWorkTypesChange={handleWorkTypesChange} 
            onFoundationTabOpen={handleFoundationTabOpen}
            onFoundationTabClose={handleFoundationTabClose}
            onCommissioningTabOpen={handleCommissioningTabOpen}
            onCommissioningTabClose={handleCommissioningTabClose}
            onBusinessTravelTabOpen={handleBusinessTravelTabOpen}
            onBusinessTravelTabClose={handleBusinessTravelTabClose}
            onBusinessTravelReset={handleBusinessTravelReset}
            onInstallationTablesChange={handleInstallationTablesChange}
          />

          {/* Вкладка монтажа фундамента */}
          <FoundationInstallationTab 
            isVisible={isFoundationTabOpen} 
          />

          {/* Вкладка пусконаладочных работ */}
          <CommissioningWorksTab 
            isVisible={isCommissioningTabOpen} 
          />

          {/* Вкладка командировочных расходов */}
          <BusinessTravelTab 
            isVisible={isBusinessTravelTabOpen}
            onTotalChange={handleBusinessTravelTotalChange}
            onReset={handleBusinessTravelReset}
          />

          {/* Компонент с таблицами монтажа - показывается только если выбраны соответствующие типы работ */}
          <InstallationTables isVisible={shouldShowInstallationTables} />

          {/* Показываем таблицу работ если выбраны любые типы работ или есть командировочные */}
          {(hasSelectedWorkTypes || businessTravelTotal > 0) && (
            <div className="w-full mt-12">
              <div className=" mx-auto">
                <WorksTable selected={selected} worksList={worksList} businessTravelTotal={businessTravelTotal} />
              </div>
            </div>
          )}
          
          {/* Отладочная информация */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-4 p-4 bg-gray-100 rounded-lg text-sm">
              <div>hasSelectedWorkTypes: {hasSelectedWorkTypes ? 'true' : 'false'}</div>
              <div>businessTravelTotal: {businessTravelTotal}</div>
              <div>isBusinessTravelTabOpen: {isBusinessTravelTabOpen ? 'true' : 'false'}</div>
            </div>
          )}

          </div>
        </div>
      </div>

      {/* Кнопка "Добавить в спецификацию" - прижата к низу экрана */}
      <div className="bg-white pt-6 pb-6 px-6">
        <div className="flex justify-start">
          <button 
            onClick={() => {
              window.location.href = '/dashboard/final';
            }}
            className="flex items-center gap-2 bg-[#8eba1e] hover:bg-[#7aa31a] text-white font-semibold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 text-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Добавить в спецификацию
          </button>
        </div>
      </div>
    </div>
  );
}
