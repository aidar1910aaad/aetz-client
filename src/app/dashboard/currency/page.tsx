'use client';

import { useEffect, useState } from 'react';
import { showToast } from '@/shared/modals/ToastProvider';
import { showConfirm } from '@/shared/modals/ConfirmModal';

const DEFAULT_RATES = {
  usd: 512.34,
  eur: 582.07,
  rub: 6.31,
};

export default function CurrencyPage() {
  const [rates, setRates] = useState(DEFAULT_RATES);
  const [initialRates, setInitialRates] = useState(DEFAULT_RATES);

  useEffect(() => {
    const stored = localStorage.getItem('currencyRates');
    if (stored) {
      const parsed = JSON.parse(stored);
      setRates(parsed);
      setInitialRates(parsed);
    }
  }, []);

  const handleChange = (key: keyof typeof rates, value: string) => {
    const numeric = parseFloat(value.replace(',', '.'));
    if (!isNaN(numeric)) {
      setRates((prev) => ({ ...prev, [key]: numeric }));
    }
  };

  const isChanged = JSON.stringify(rates) !== JSON.stringify(initialRates);

  const handleSave = async () => {
    const confirmed = await showConfirm({
      title: 'Сохранить курсы валют?',
      message: 'Вы уверены, что хотите сохранить изменения?',
    });

    if (!confirmed) return;

    localStorage.setItem('currencyRates', JSON.stringify(rates));
    setInitialRates(rates);
    showToast('Курсы валют успешно сохранены', 'success');
  };

  return (
    <div className="h-[calc(100vh-110px)] overflow-y-auto px-6 py-6 bg-gray-50">
      <h2 className="text-2xl font-semibold mt-2">Курсы валют</h2>
      <p className="text-sm text-gray-600 mt-1">
        Укажите актуальные курсы валют по отношению к тенге
      </p>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { label: 'Доллар США (USD)', key: 'usd' },
          { label: 'Евро (EUR)', key: 'eur' },
          { label: 'Российский рубль (RUB)', key: 'rub' },
        ].map(({ label, key }) => (
          <div key={key} className="bg-white p-5 border rounded-xl shadow-sm space-y-2">
            <label className="block text-sm font-medium text-gray-700">{label}</label>
            <input
              type="number"
              value={rates[key as keyof typeof rates]}
              onChange={(e) => handleChange(key as keyof typeof rates, e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3A55DF]"
              step="0.01"
              min="0"
            />
          </div>
        ))}
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
