'use client';

import { useEffect, useState } from 'react';
import { DollarSign, Save, Settings } from 'lucide-react';
import { showToast } from '@/shared/modals/ToastProvider';
import { showConfirm } from '@/shared/modals/ConfirmModal';
import { CurrencySettings } from '@/types/api/currency';
import { currencyApi } from '@/api/currency';
import { useRoleCheck } from '@/hooks/useRoleCheck';
import { UserRole } from '@/types/user';

export default function CurrencyPage() {
  const { isManagerUser, isAdminUser, isPTOUser } = useRoleCheck();
  const [settings, setSettings] = useState<CurrencySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isChanged, setIsChanged] = useState(false);
  const [tempSettings, setTempSettings] = useState<CurrencySettings | null>(null);
  
  // Менеджер может только просматривать, не может редактировать
  const canEdit = isAdminUser || isPTOUser;

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
    if (!tempSettings || !canEdit) return;

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
      <div className="h-[calc(100vh-64px)] bg-white overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8eba1e] mx-auto mb-4"></div>
              <p className="text-gray-600">Загрузка настроек валют...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-[calc(100vh-64px)] bg-white overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="text-red-500 text-6xl mb-4">⚠️</div>
              <p className="text-red-600 text-lg mb-2">Ошибка загрузки</p>
              <p className="text-gray-600">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!tempSettings) return null;

  return (
    <div className="h-[calc(100vh-64px)] bg-white overflow-y-auto">
      <div className="p-6">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-gray-100 rounded-xl">
              <DollarSign className="w-6 h-6 text-[#8eba1e]" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Курсы валют и настройки</h1>
              <p className="text-gray-600">Укажите актуальные курсы валют и настройки расчетов</p>
            </div>
          </div>
        </div>

        {/* Курсы валют */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gray-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-[#8eba1e]" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Курсы валют</h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { label: 'Доллар США (USD)', key: 'usdRate' },
              { label: 'Евро (EUR)', key: 'eurRate' },
              { label: 'Российский рубль (RUB)', key: 'rubRate' },
            ].map(({ label, key }) => (
              <div key={key} className="bg-white p-6 border border-gray-200 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:border-[#8eba1e]/30">
                <label className="block text-sm font-medium text-gray-700 mb-3">{label}</label>
                <input
                  type="number"
                  value={tempSettings[key as keyof CurrencySettings]}
                  onChange={(e) => handleChange(key as keyof CurrencySettings, e.target.value)}
                  disabled={!canEdit}
                  readOnly={!canEdit}
                  className={`w-full border border-gray-300 rounded-lg px-4 py-3 text-sm transition-all duration-200 ${
                    canEdit
                      ? 'focus:outline-none focus:ring-2 focus:ring-[#8eba1e] focus:border-[#8eba1e]'
                      : 'bg-gray-100 cursor-not-allowed opacity-75'
                  }`}
                  step="0.01"
                  min="0"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Настройки расчетов */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Settings className="w-5 h-5 text-[#8eba1e]" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Настройки расчетов</h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { label: 'Часовая заработная плата (₸)', key: 'hourlyWage' },
              { label: 'НДС (%)', key: 'vatRate' },
              { label: 'Административные расходы (%)', key: 'administrativeExpenses' },
              { label: 'Плановые накопления (%)', key: 'plannedSavings' },
              { label: 'Производственные расходы (%)', key: 'productionExpenses' },
            ].map(({ label, key }) => (
              <div key={key} className="bg-white p-6 border border-gray-200 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:border-[#8eba1e]/30">
                <label className="block text-sm font-medium text-gray-700 mb-3">{label}</label>
                <input
                  type="number"
                  value={tempSettings[key as keyof CurrencySettings]}
                  onChange={(e) => handleChange(key as keyof CurrencySettings, e.target.value)}
                  disabled={!canEdit}
                  readOnly={!canEdit}
                  className={`w-full border border-gray-300 rounded-lg px-4 py-3 text-sm transition-all duration-200 ${
                    canEdit
                      ? 'focus:outline-none focus:ring-2 focus:ring-[#8eba1e] focus:border-[#8eba1e]'
                      : 'bg-gray-100 cursor-not-allowed opacity-75'
                  }`}
                  step="0.01"
                  min="0"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Кнопка сохранения - только для админов и ПТО */}
        {canEdit && (
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={!isChanged}
              className={`flex items-center gap-2 px-8 py-4 rounded-xl transition-all duration-200 shadow-lg ${
                isChanged
                  ? 'bg-[#8eba1e] text-white hover:bg-[#7aa31a] hover:shadow-xl transform hover:scale-105'
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }`}
            >
              <Save size={18} />
              {isChanged ? 'Сохранить изменения' : 'Нет изменений'}
            </button>
          </div>
        )}
        
        {/* Информационное сообщение для менеджера */}
        {isManagerUser && (
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Settings className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-blue-900 mb-1">
                  Только просмотр
                </p>
                <p className="text-sm text-blue-700">
                  У вас нет прав на редактирование курсов валют. Обратитесь к администратору или пользователю ПТО для внесения изменений.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
