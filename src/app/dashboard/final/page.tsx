'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTransformerStore } from '@/store/useTransformerStore';
import { useRusnStore } from '@/store/useRusnStore';
import { useBmzStore } from '@/store/useBmzStore';
import Breadcrumbs from '@/components/Breadcrumbs/Breadcrumbs';
import TransformerSection from '@/components/FinalReview/TransformerSection';
import RusnSection from '@/components/FinalReview/RusnSection';
import BmzSection from '@/components/FinalReview/BmzSection';

export default function FinalReview() {
  const { selectedTransformer } = useTransformerStore();
  const { global: rusn } = useRusnStore();
  const bmzStore = useBmzStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = () => {
      try {
        const data = localStorage.getItem('currentRequest');
        if (data) {
          JSON.parse(data);
        }
      } catch (error) {
        console.error('Error parsing current request data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
    window.addEventListener('storage', loadData);

    return () => {
      window.removeEventListener('storage', loadData);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="h-[calc(100vh-110px)] overflow-y-auto px-6 py-6 bg-gray-50">
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3A55DF]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-110px)] overflow-y-auto px-6 py-6 bg-gray-50">
      <Breadcrumbs />
      <h1 className="text-2xl font-bold mb-4">Итоговая спецификация</h1>

      <div className="space-y-6">
        <BmzSection bmz={bmzStore} />
        <TransformerSection transformer={selectedTransformer} />
        <RusnSection rusn={rusn} />
      </div>
    </div>
  );
}
