'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useCalculations } from '@/hooks/useCalculations';

export default function CalculationDetailPage() {
  const { groupSlug, calcSlug } = useParams() as { groupSlug: string; calcSlug: string };
  const { fetchCalculation, selectedCalculation } = useCalculations();

  useEffect(() => {
    if (groupSlug && calcSlug) {
      fetchCalculation(groupSlug, calcSlug);
    }
  }, [groupSlug, calcSlug]);

  if (!selectedCalculation) {
    return <div className="p-8 text-gray-500">Загрузка...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">{selectedCalculation.name}</h1>

      {selectedCalculation.data?.categories?.map((cat, idx) => (
        <div key={idx} className="mb-8">
          <h2 className="text-xl font-semibold mb-2">{cat.name}</h2>
          <table className="w-full text-sm border">
            <thead className="bg-gray-100">
              <tr>
                <th className="border p-2 text-left">Наименование</th>
                <th className="border p-2 text-left">Ед.</th>
                <th className="border p-2 text-right">Цена</th>
                <th className="border p-2 text-right">Кол-во</th>
                <th className="border p-2 text-right">Сумма</th>
              </tr>
            </thead>
            <tbody>
              {cat.items?.map((item, i) => (
                <tr key={i}>
                  <td className="border p-2">{item.name}</td>
                  <td className="border p-2">{item.unit}</td>
                  <td className="border p-2 text-right">{item.price.toLocaleString()}</td>
                  <td className="border p-2 text-right">{item.quantity}</td>
                  <td className="border p-2 text-right">
                    {(item.price * item.quantity).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}
