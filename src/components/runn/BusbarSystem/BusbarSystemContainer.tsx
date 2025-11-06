import React, { useEffect } from 'react';
import { useRunnStore, BusMaterial } from '@/store/useRunnStore';
import { useRunnBusbarCalculation } from '@/hooks/useRunnBusbarCalculation';
import { useZeroBusbarCalculation } from '@/hooks/useZeroBusbarCalculation';
import { BusbarResults } from './BusbarResults';

export const BusbarSystemContainer = () => {
  const runn = useRunnStore();

  // Хук для основных сборных шин
  const {
    selectedBreaker,
    matchingConfig,
    totalWeight,
    totalPrice,
    materialCost,
    cellDetails,
    busbarCalculationFromApi,
    busbarCalculationResult,
    busMaterial,
    getBreakerCurrent,
    getPricePerKg,
    transformerPower,
    calculationsLoading,
  } = useRunnBusbarCalculation();

  // Хук для нулевых шин
  const {
    matchingConfig: zeroMatchingConfig,
    totalWeight: zeroTotalWeight,
    totalPrice: zeroTotalPrice,
    materialCost: zeroMaterialCost,
    pricePerKg: zeroPricePerKg,
    cellDetails: zeroCellDetails,
    hasMatchingConfig: zeroHasMatchingConfig,
    transformerPower: zeroTransformerPower,
    selectedTransformer,
    busbarCalculationResult: zeroBusbarCalculationResult,
  } = useZeroBusbarCalculation();

  // Сохраняем сводки в store
  useEffect(() => {
    if (totalPrice > 0 && matchingConfig) {
      // Формируем название в формате: "Сборные шины ЩО 70 (шина МТ3 (120x10мм) 5200A)"
      // Преобразуем "Панель ЩО-70" -> "ЩО 70"
      const panelName = matchingConfig.type.replace('Панель ', '').replace('-', ' ');
      const busbarSize = matchingConfig.busbar ? `${matchingConfig.busbar}мм` : '';
      const amperage = matchingConfig.amperage ? `${matchingConfig.amperage}A` : '';
      const group = matchingConfig.group || '';
      
      // Формируем название с правильным форматированием
      // Формат: "Сборные шины ЩО 70 (шина МТ3 (120x10мм) 5200A)"
      const innerParts = [
        `шина ${group}`,
        busbarSize ? `(${busbarSize})` : '',
        amperage
      ].filter(Boolean); // Убираем пустые строки
      
      const busbarName = `Сборные шины ${panelName} (${innerParts.join(' ')})`;
      
      runn.setBusbarSummary({
        name: busbarName,
        quantity: 1,
        pricePerUnit: totalPrice,
        totalPrice: totalPrice,
      });
    }
  }, [totalPrice, matchingConfig, busMaterial]);

  // Сохраняем сводку для нулевых шин
  useEffect(() => {
    if (zeroTotalPrice > 0 && zeroMatchingConfig) {
      // Формируем название в формате: "Шина N ЩО 70 (шина МТ3 (120x10мм) 5200A)"
      // Преобразуем "Панель ЩО-70N" -> "ЩО 70"
      const panelName = zeroMatchingConfig.type
        ? zeroMatchingConfig.type.replace('Панель ', '').replace('-70N', ' 70').replace('-70', ' 70')
        : 'ЩО 70';
      const busbarSize = zeroMatchingConfig.busbar ? `${zeroMatchingConfig.busbar}мм` : '';
      const amperage = zeroMatchingConfig.amperage ? `${zeroMatchingConfig.amperage}A` : '';
      const group = zeroMatchingConfig.group || '';
      
      // Формируем название с правильным форматированием
      // Формат: "Шина N ЩО 70 (шина МТ3 (120x10мм) 5200A)"
      const innerParts = [
        `шина ${group}`,
        busbarSize ? `(${busbarSize})` : '',
        amperage
      ].filter(Boolean); // Убираем пустые строки
      
      const zeroBusbarName = `Шина N ${panelName} (${innerParts.join(' ')})`;
      
      // Создаем отдельную сводку для нулевых шин
      const zeroBusbarSummary = {
        name: zeroBusbarName,
        quantity: 1,
        pricePerUnit: zeroTotalPrice,
        totalPrice: zeroTotalPrice,
      };
      
      // Используем функциональное обновление для получения актуального состояния
      runn.setBusBridgeSummaries((existingSummaries) => {
        const summaries = existingSummaries || [];
        // Фильтруем ВСЕ старые записи нулевых шин (старый и новый формат)
        // Удаляем все записи, которые содержат "Сборные шины N" или "Шина N"
        const nonZeroSummaries = summaries.filter(summary => 
          !summary.name.includes('Шина N') && 
          !summary.name.includes('Сборные шины N')
        );
        
        // Всегда добавляем новую сводку с правильным названием
        return [...nonZeroSummaries, zeroBusbarSummary];
      });
    } else if (!zeroMatchingConfig || zeroTotalPrice === 0) {
      // Если нет конфигурации или цена 0, очищаем только нулевые шины
      // Используем функциональное обновление для получения актуального состояния
      runn.setBusBridgeSummaries((existingSummaries) => {
        const summaries = existingSummaries || [];
        return summaries.filter(summary => 
          !summary.name.includes('Шина N') && 
          !summary.name.includes('Сборные шины N')
        );
      });
    }
  }, [zeroTotalPrice, zeroMatchingConfig, selectedTransformer?.busbars]);

  // Показываем индикатор загрузки если идет загрузка расчетов
  if (calculationsLoading) {
    return (
      <div className="space-y-8">
        {/* Основные сборные шины */}
        <div className="bg-white border border-gray-300 shadow-sm">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-blue-200">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-blue-700">Сборные шины РУНН</h3>
                <p className="text-sm text-blue-600">Основная система сборных шин</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center gap-3">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent"></div>
                <span className="text-blue-700 font-medium">Загрузка конфигурации...</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Основные сборные шины */}
      <div className="bg-white border border-gray-300 shadow-sm">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-blue-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-blue-700">Сборные шины РУНН</h3>
              <p className="text-sm text-blue-600">Основная система сборных шин</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <BusbarResults
            title="сборным шинам РУНН"
            matchingConfig={matchingConfig}
            totalWeight={totalWeight}
            totalPrice={totalPrice}
            materialCost={materialCost}
            pricePerKg={getPricePerKg(busMaterial)}
            hasMatchingConfig={!!matchingConfig}
            transformerPower={transformerPower}
            selectedTransformer={selectedTransformer}
            cellDetails={cellDetails}
            busbarCalculationResult={busbarCalculationResult}
          />
        </div>
      </div>

      {/* Сборные шины N */}
      <div className="bg-white border border-gray-300 shadow-sm">
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b border-green-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-green-700">Сборные шины N</h3>
              <p className="text-sm text-green-600">Конфигурация нулевых шин</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <BusbarResults
            title="сборным шинам N"
            matchingConfig={zeroMatchingConfig}
            totalWeight={zeroTotalWeight}
            totalPrice={zeroTotalPrice}
            materialCost={zeroMaterialCost}
            pricePerKg={zeroPricePerKg}
            hasMatchingConfig={zeroHasMatchingConfig}
            transformerPower={zeroTransformerPower}
            selectedTransformer={selectedTransformer}
            cellDetails={zeroCellDetails}
            busbarCalculationResult={zeroBusbarCalculationResult}
          />
        </div>
      </div>
    </div>
  );
};