// app/not-found.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '@/shared/layout/Header';
import Sidebar from '@/shared/layout/Sidebar';

export default function NotFoundPage() {
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuth(!!token);
  }, []);

  const Content = (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center gap-4">
      <h1 className="text-3xl font-bold text-[#3A55DF]">Страница не найдена</h1>
      <p className="text-gray-600">Возможно, вы перешли по несуществующему адресу.</p>
      <Link
        href={isAuth ? '/dashboard' : '/'}
        className="mt-2 px-6 py-2 bg-[#3A55DF] text-white rounded hover:bg-blue-700 transition"
      >
        {isAuth ? 'На главную панель' : 'На главную'}
      </Link>
    </div>
  );

  if (isAuth) {
    return (
      <div className="min-h-screen bg-gray-100 text-black flex flex-col">
        <Header />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-y-auto p-6">{Content}</main>
        </div>
      </div>
    );
  }

  return <div className="min-h-screen flex items-center justify-center p-6">{Content}</div>;
}
