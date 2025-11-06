'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getMaterialById, getMaterialHistory, MaterialHistoryItem, Material } from '@/api/material/exports';
import PageLoader from '@/shared/loader/PageLoader';
import PriceHistoryChart from '@/shared/charts/PriceHistoryChart';

export default function MaterialHistoryPage() {
  const { id } = useParams<{ id: string }>();
  const [material, setMaterial] = useState<Material | null>(null);
  const [history, setHistory] = useState<MaterialHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token') || '';
        const [materialData, historyData] = await Promise.all([
          getMaterialById(Number(id), token),
          getMaterialHistory(Number(id), token),
        ]);
        setMaterial(materialData);
        setHistory(historyData);
      } catch (err: any) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) return <PageLoader />;

  const priceHistory = history
    .filter((h) => h.fieldChanged === 'price')
    .map((h) => ({
      date: new Date(h.changedAt), // Сохраняем Date-объект
      price: Number(h.newValue),
    }))
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  return (
    <div className="p-6 h-[calc(100vh-65px)] overflow-y-auto bg-gradient-to-br from-white via-gray-50/30 to-blue-50/20">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-[#8eba1e] rounded-2xl flex items-center justify-center">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <h1 className="text-3xl font-bold text-[#8eba1e]">
            История изменений
          </h1>
          <p className="text-lg text-[#8eba1e] font-medium">
            {material?.name || '—'}
          </p>
        </div>
      </div>

      {/* 📊 График цены */}
      {priceHistory.length > 0 && <PriceHistoryChart data={priceHistory} />}

      {/* 🧾 Карточки истории */}
      <div className="space-y-4">
        {history.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-[#8eba1e]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-[#8eba1e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-gray-500 text-lg">Изменений пока нет</p>
            <p className="text-gray-400 text-sm">История изменений появится здесь</p>
          </div>
        ) : (
          history.map((item, idx) => (
            <div
              key={idx}
              className="group relative border border-[#8eba1e]/20 bg-white p-5 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.01] overflow-hidden max-w-2xl hover:border-[#8eba1e]/40"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-[#8eba1e] rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                  <span className="text-lg font-bold text-gray-800 capitalize">
                    {item.fieldChanged === 'price'
                      ? '💰 Цена'
                      : item.fieldChanged === 'name'
                      ? '📝 Название'
                      : item.fieldChanged === 'unit'
                      ? '📏 Ед. изм.'
                      : item.fieldChanged === 'category'
                      ? '📂 Категория'
                      : item.fieldChanged}
                  </span>
                </div>
                <div className="text-right bg-gray-50 rounded-lg px-3 py-2">
                  <div className="text-sm font-medium text-gray-600">
                    {new Date(item.changedAt).toLocaleDateString('ru-RU', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(item.changedAt).toLocaleTimeString('ru-RU', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <div className="text-sm font-medium text-gray-600 mb-1">Было</div>
                  <div className="text-sm font-semibold text-gray-800 break-words">
                    {item.fieldChanged === 'price'
                      ? `${Number(item.oldValue).toLocaleString('ru-RU')} ₸`
                      : item.oldValue}
                  </div>
                </div>
                
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <div className="text-sm font-medium text-gray-600 mb-1">Стало</div>
                  <div className="text-sm font-semibold text-gray-800 break-words">
                    {item.fieldChanged === 'price'
                      ? `${Number(item.newValue).toLocaleString('ru-RU')} ₸`
                      : item.newValue}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-2">
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>Изменил: <span className="font-semibold text-gray-800">{item.changedBy}</span></span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
