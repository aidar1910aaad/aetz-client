'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { Package, X, Search, ChevronDown } from 'lucide-react';
import { CreateMaterialRequest } from '@/api/material/index';
import { useMaterials } from '@/hooks/useMaterials';
import { showToast } from '@/shared/modals/ToastProvider';
import { currencyApi } from '@/api/currency';
import { CurrencySettings } from '@/types/api/currency';

interface Props {
  onClose: () => void;
  onCreate: (data: CreateMaterialRequest) => Promise<void>;
}

export default function CreateMaterialModal({ onClose, onCreate }: Props) {
  const { allCategories } = useMaterials();

  const [form, setForm] = useState<CreateMaterialRequest>({
    name: '',
    unit: '',
    priceInCurrency: 0,
    currency: 'KZT',
    categoryId: undefined,
    code: '',
  });

  const [search, setSearch] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [currencyDropdownOpen, setCurrencyDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rates, setRates] = useState<CurrencySettings | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);
  const currencyDropdownRef = useRef<HTMLDivElement>(null);
  const currencyOptions: CreateMaterialRequest['currency'][] = ['KZT', 'RUB', 'USD', 'EUR', 'CNY'];

  const filteredCategories = allCategories.filter((cat) =>
    cat.name.toLowerCase().includes(search.toLowerCase())
  );

  const selectedCategory = allCategories.find((cat) => cat.id === form.categoryId);

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const data = await currencyApi.getSettings();
        setRates(data);
      } catch {
        setRates(null);
      }
    };
    fetchRates();
  }, []);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        categoryDropdownRef.current &&
        !categoryDropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
      if (
        currencyDropdownRef.current &&
        !currencyDropdownRef.current.contains(event.target as Node)
      ) {
        setCurrencyDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  const approxPriceKzt = useMemo(() => {
    if (!rates || !form.priceInCurrency || form.currency === 'KZT') return null;

    const rateByCurrency = {
      RUB: Number(rates.rubRate),
      USD: Number(rates.usdRate),
      EUR: Number(rates.eurRate),
      CNY: Number(rates.cnyRate),
      KZT: 1,
    };

    const rate = rateByCurrency[form.currency];
    if (!rate || Number.isNaN(rate)) return null;

    return form.priceInCurrency * rate;
  }, [form.currency, form.priceInCurrency, rates]);

  const handleSubmit = async () => {
    if (!form.name || !form.unit || !form.priceInCurrency || !form.currency) {
      showToast('Пожалуйста, заполните обязательные поля', 'error');
      return;
    }

    const dataToSend: CreateMaterialRequest = {
      name: form.name.trim(),
      unit: form.unit.trim(),
      currency: form.currency,
      priceInCurrency: form.priceInCurrency,
      ...(form.code?.trim() ? { code: form.code.trim() } : {}),
      ...(form.categoryId ? { categoryId: form.categoryId } : {}),
    };
    setLoading(true);
    try {
      await onCreate(dataToSend);
      onClose();
    } catch {
      // Ошибка показывается в вызывающем обработчике
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div ref={modalRef} className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#8eba1e]/10">
              <Package className="w-5 h-5 text-[#8eba1e]" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Создать материал</h2>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Название <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Например: Кабель ВВГнг"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8eba1e] focus:border-[#8eba1e] transition-all"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Единица измерения <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="шт, м, кг"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8eba1e] focus:border-[#8eba1e] transition-all"
                value={form.unit}
                onChange={(e) => setForm({ ...form, unit: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Цена <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                placeholder="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8eba1e] focus:border-[#8eba1e] transition-all"
                value={form.priceInCurrency || ''}
                onChange={(e) => setForm({ ...form, priceInCurrency: +e.target.value })}
              />
              {approxPriceKzt !== null && (
                <p className="mt-1 text-xs text-gray-500">
                  По текущему курсу: примерно {approxPriceKzt.toLocaleString('ru-RU')} ₸
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Валюта <span className="text-red-500">*</span>
            </label>
            <div className="relative" ref={currencyDropdownRef}>
              <button
                type="button"
                onClick={() => setCurrencyDropdownOpen((prev) => !prev)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8eba1e] focus:border-[#8eba1e] transition-all bg-white text-left flex items-center justify-between"
              >
                <span>{form.currency}</span>
                <ChevronDown
                  className={`w-4 h-4 text-gray-500 transition-transform ${
                    currencyDropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {currencyDropdownOpen && (
                <ul className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg text-sm overflow-hidden">
                  {currencyOptions.map((currency) => (
                    <li
                      key={currency}
                      onClick={() => {
                        setForm({ ...form, currency });
                        setCurrencyDropdownOpen(false);
                      }}
                      className="px-4 py-2.5 hover:bg-[#8eba1e]/10 cursor-pointer transition-colors"
                    >
                      {currency}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Код (опционально)</label>
            <input
              type="text"
              placeholder="Внутренний код материала"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8eba1e] focus:border-[#8eba1e] transition-all"
              value={form.code || ''}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
            />
          </div>

          <div className="relative" ref={categoryDropdownRef}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Категория (опционально)
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Поиск категории..."
                className="w-full pl-9 pr-9 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8eba1e] focus:border-[#8eba1e] transition-all"
                value={search || selectedCategory?.name || ''}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setDropdownOpen(true);
                  setForm({ ...form, categoryId: undefined });
                }}
                onFocus={() => setDropdownOpen(true)}
              />
              {selectedCategory && (
                <button
                  onClick={() => {
                    setForm({ ...form, categoryId: undefined });
                    setSearch('');
                    setDropdownOpen(true);
                  }}
                  className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              )}
            </div>

            {dropdownOpen && (
              <ul className="absolute z-50 mt-1 w-full max-h-48 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg text-sm">
                {filteredCategories.length === 0 ? (
                  <li className="px-4 py-3 text-gray-500">Ничего не найдено</li>
                ) : (
                  filteredCategories.map((cat) => (
                    <li
                      key={cat.id}
                      onClick={() => {
                        setForm({ ...form, categoryId: cat.id });
                        setSearch(cat.name);
                        setDropdownOpen(false);
                      }}
                      className="px-4 py-2.5 hover:bg-[#8eba1e]/10 cursor-pointer transition-colors"
                    >
                      {cat.name}
                    </li>
                  ))
                )}
              </ul>
            )}
          </div>
        </div>

        <div className="bg-gray-50 border-t border-gray-200 px-6 py-4">
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-5 py-2 text-sm rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 transition-all disabled:opacity-50"
            >
              Отмена
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-5 py-2 text-sm rounded-lg bg-[#8eba1e] text-white hover:bg-[#7aa31a] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 min-w-[120px] justify-center"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Сохранение...
                </>
              ) : (
                'Создать'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
