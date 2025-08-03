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

    console.log('🔍 Анализ JWT токена:');
    console.log('📅 Время создания:', createdAt.toLocaleString());
    console.log('⏰ Время истечения:', expiresAt.toLocaleString());
    console.log('🕐 Текущее время:', now.toLocaleString());
    console.log('⏳ Часов до истечения:', hoursUntilExpiry.toFixed(2));
    console.log('📊 Общее время жизни токена (часов):', totalHours.toFixed(2));
    console.log('📋 Полный payload:', payload);

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
      const isExpired = Date.now() > tokenAnalysis.expiresAt.getTime();

      if (isExpired) {
        console.log('❌ Токен истек, перенаправляем на главную страницу');
        localStorage.removeItem('token');
        router.push('/');
      } else {
        console.log('✅ Токен действителен');
      }
    } catch {
      localStorage.removeItem('token');
      router.push('/');
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-100 text-black flex flex-col">
      <Header />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
