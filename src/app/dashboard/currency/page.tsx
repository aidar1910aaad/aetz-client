'use client';

import { useEffect, useState } from 'react';
import { showToast } from '@/shared/modals/ToastProvider';
import { showConfirm } from '@/shared/modals/ConfirmModal';
import { CurrencySettings } from '@/types/api/currency';
import { currencyApi } from '@/api/currency';

export default function CurrencyPage() {
  const [settings, setSettings] = useState<CurrencySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isChanged, setIsChanged] = useState(false);
  const [tempSettings, setTempSettings] = useState<CurrencySettings | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const data = await currencyApi.getSettings();
      setSettings(data);
      setTempSettings(data);
    } catch (err) {
      setError('Ошибка при загрузке настроек');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof CurrencySettings, value: string) => {
    if (!tempSettings) return;

    const newSettings = {
      ...tempSettings,
      [field]: value
    };
    setTempSettings(newSettings);
    setIsChanged(true);
  };

  const handleSave = async () => {
    if (!tempSettings) return;

    try {
      const confirmed = await showConfirm({
        title: 'Сохранить настройки?',
        message: 'Вы уверены, что хотите сохранить изменения?',
      });

      if (!confirmed) return;

      const updatedSettings = await currencyApi.updateSettings({
        usdRate: parseFloat(tempSettings.usdRate),
        eurRate: parseFloat(tempSettings.eurRate),
        rubRate: parseFloat(tempSettings.rubRate),
        hourlyWage: parseFloat(tempSettings.hourlyWage),
        vatRate: parseFloat(tempSettings.vatRate),
        administrativeExpenses: parseFloat(tempSettings.administrativeExpenses),
        plannedSavings: parseFloat(tempSettings.plannedSavings),
        productionExpenses: parseFloat(tempSettings.productionExpenses)
      });

      setSettings(updatedSettings);
      setTempSettings(updatedSettings);
      setIsChanged(false);
      showToast('Настройки успешно сохранены', 'success');
    } catch (err) {
      setError('Ошибка при обновлении настроек');
      console.error(err);
      showToast('Ошибка при обновлении настроек', 'error');
    }
  };

  if (loading) {
    return (
      <div className="h-[calc(100vh-110px)] overflow-y-auto px-6 py-6 bg-gray-50">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-[calc(100vh-110px)] overflow-y-auto px-6 py-6 bg-gray-50">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      </div>
    );
  }

  if (!tempSettings) return null;

  return (
    <div className="h-[calc(100vh-110px)] overflow-y-auto px-6 py-6 bg-gray-50">
      <h2 className="text-2xl font-semibold mt-2">Курсы валют и настройки</h2>
      <p className="text-sm text-gray-600 mt-1">
        Укажите актуальные курсы валют и настройки
      </p>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { label: 'Доллар США (USD)', key: 'usdRate' },
          { label: 'Евро (EUR)', key: 'eurRate' },
          { label: 'Российский рубль (RUB)', key: 'rubRate' },
        ].map(({ label, key }) => (
          <div key={key} className="bg-white p-5 border rounded-xl shadow-sm space-y-2">
            <label className="block text-sm font-medium text-gray-700">{label}</label>
            <input
              type="number"
              value={tempSettings[key as keyof CurrencySettings]}
              onChange={(e) => handleChange(key as keyof CurrencySettings, e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3A55DF]"
              step="0.01"
              min="0"
            />
          </div>
        ))}
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">Настройки расчетов</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { label: 'Часовая заработная плата (₸)', key: 'hourlyWage' },
            { label: 'НДС (%)', key: 'vatRate' },
            { label: 'Административные расходы (%)', key: 'administrativeExpenses' },
            { label: 'Плановые накопления (%)', key: 'plannedSavings' },
            { label: 'Производственные расходы (%)', key: 'productionExpenses' },
          ].map(({ label, key }) => (
            <div key={key} className="bg-white p-5 border rounded-xl shadow-sm space-y-2">
              <label className="block text-sm font-medium text-gray-700">{label}</label>
              <input
                type="number"
                value={tempSettings[key as keyof CurrencySettings]}
                onChange={(e) => handleChange(key as keyof CurrencySettings, e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3A55DF]"
                step="0.01"
                min="0"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <button
          onClick={handleSave}
          disabled={!isChanged}
          className={`px-6 py-2 rounded-lg transition duration-150 ${
            isChanged
              ? 'bg-[#3A55DF] text-white hover:bg-[#2e46c5]'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
          }`}
        >
          Сохранить
        </button>
      </div>
    </div>
  );
}
