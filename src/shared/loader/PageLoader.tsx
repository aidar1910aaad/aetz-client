// src/components/PageLoader.tsx
'use client';

export default function PageLoader() {
  return (
    <div className="flex flex-col justify-center items-center h-80 w-full gap-4">
      <div className="h-14 w-14 border-4 border-[#3A55DF] border-t-transparent rounded-full animate-spin" />
      <p className="text-[#3A55DF] text-sm animate-pulse">Загружаем данные...</p>
    </div>
  );
}
