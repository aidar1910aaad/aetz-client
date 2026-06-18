'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import Header from '@/shared/layout/Header';
import Sidebar from '@/shared/layout/Sidebar';

// Функция для анализа JWT токена
const analyzeToken = (token: string) => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const createdAt = new Date(payload.iat * 1000);
    const expiresAt = new Date(payload.exp * 1000);
    const now = new Date();

    const hoursUntilExpiry = (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60);
    const totalHours = (expiresAt.getTime() - createdAt.getTime()) / (1000 * 60 * 60);



    return {
      createdAt,
      expiresAt,
      hoursUntilExpiry,
      totalHours,
      payload,
    };
  } catch (error) {
    console.error('❌ Ошибка при анализе токена:', error);
    return null;
  }
};

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      router.push('/');
      return;
    }

    try {
      // Анализируем токен
      const tokenAnalysis = analyzeToken(token);

      if (!tokenAnalysis) {
        localStorage.removeItem('token');
        router.push('/');
        return;
      }

      // Проверяем истечение токена используя реальное время из JWT
      const now = new Date();
      const isExpired = now.getTime() > tokenAnalysis.expiresAt.getTime();

      if (isExpired) {
        console.log('❌ Токен истек, перенаправляем на главную страницу');
        localStorage.removeItem('token');
        router.push('/');
      } else {
    
      }
    } catch {
      localStorage.removeItem('token');
      router.push('/');
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-100 text-black">
      <Header />

      <div className="flex min-h-[calc(100vh-4rem)] pt-16">
        <Sidebar />
        <main className="flex-1 overflow-y-auto outline-none focus:outline-none">{children}</main>
      </div>
    </div>
  );
}
