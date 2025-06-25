import React from 'react';
import Breadcrumbs from '@/components/Breadcrumbs/Breadcrumbs';

export function TransformerLoading() {
  return (
    <div className="h-[calc(100vh-110px)] overflow-y-auto px-6 py-2 bg-gray-50">
      <div className="px-6 pt-6 pb-2">
        <Breadcrumbs />
        <h2 className="text-2xl font-semibold mt-2">Силовой трансформатор</h2>
        <div className="mt-4 text-center">Загрузка...</div>
      </div>
    </div>
  );
}
