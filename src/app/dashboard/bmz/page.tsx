'use client';

import { useEffect } from 'react';
import { useBmzStore } from '@/store/useBmzStore';
import BmzForm from '@/components/BmzForm/BmzForm';
import BmzSection from '@/components/FinalReview/BmzSection';
import Breadcrumbs from '@/components/Breadcrumbs/Breadcrumbs';
import { bmzApi } from '@/api/bmz';

export default function BmzPage() {
  const bmz = useBmzStore();

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await bmzApi.getSettings();
        bmz.setSettings(settings);
      } catch (error) {
        console.error('Failed to load BMZ settings:', error);
      }
    };

    loadSettings();
  }, [bmz]);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-10">
      <Breadcrumbs />
      <div className="grid grid-cols-2 gap-8">
        <div>
          <h1 className="text-2xl font-bold mb-6">Здание</h1>
          <BmzForm />
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-6">Предварительный просмотр</h2>
          <BmzSection bmz={bmz} />
        </div>
      </div>
    </div>
  );
}
