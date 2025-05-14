'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getMaterialHistory, getMaterialById, MaterialHistoryItem, Material } from '@/api/material';
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
    <div className="p-6 h-[calc(100vh-120px)] overflow-y-auto">
      <h1 className="text-2xl font-semibold mb-6">
        История изменений: <span className="text-[#3A55DF]">{material?.name || '—'}</span>
      </h1>

      {/* 📊 График цены */}
      {priceHistory.length > 0 && <PriceHistoryChart data={priceHistory} />}

      {/* 🧾 Карточки истории */}
      <div className="space-y-4">
        {history.length === 0 ? (
          <p className="text-gray-500">Изменений пока нет.</p>
        ) : (
          history.map((item, idx) => (
            <div
              key={idx}
              className="border border-[#3A55DF]/20 bg-gradient-to-br from-white via-[#f9fafe] to-[#f0f4ff] p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-[#3A55DF] capitalize">
                  {item.fieldChanged === 'price'
                    ? 'Цена'
                    : item.fieldChanged === 'name'
                    ? 'Название'
                    : item.fieldChanged === 'unit'
                    ? 'Ед. изм.'
                    : item.fieldChanged === 'category'
                    ? 'Категория'
                    : item.fieldChanged}
                </span>
                <span className="text-xs text-gray-500">
                  {new Date(item.changedAt).toLocaleString()}
                </span>
              </div>

              <div className="mb-1">
                <span className="text-[13px] text-gray-600">Было: </span>
                <span className="font-medium">
                  {item.fieldChanged === 'price'
                    ? `${Number(item.oldValue).toLocaleString()} ₸`
                    : item.oldValue}
                </span>
              </div>
              <div className="mb-1">
                <span className="text-[13px] text-gray-600">Стало: </span>
                <span className="font-medium text-[#3A55DF]">
                  {item.fieldChanged === 'price'
                    ? `${Number(item.newValue).toLocaleString()} ₸`
                    : item.newValue}
                </span>
              </div>

              <div className="text-xs text-gray-500 mt-2">
                Изменил: <span className="text-gray-700">{item.changedBy}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
