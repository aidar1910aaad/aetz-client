'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PageLoader from '@/shared/loader/PageLoader';

interface TokenAnalysis {
  createdAt: Date;
  expiresAt: Date;
  hoursUntilExpiry: number;
  totalHours: number;
  payload: any;
  isValid: boolean;
}

export default function TokenDebugPage() {
  const router = useRouter();
  const [tokenAnalysis, setTokenAnalysis] = useState<TokenAnalysis | null>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      setError('Токен не найден');
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const createdAt = new Date(payload.iat * 1000);
      const expiresAt = new Date(payload.exp * 1000);
      const now = new Date();

      const hoursUntilExpiry = (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60);
      const totalHours = (expiresAt.getTime() - createdAt.getTime()) / (1000 * 60 * 60);

      setTokenAnalysis({
        createdAt,
        expiresAt,
        hoursUntilExpiry,
        totalHours,
        payload,
        isValid: now < expiresAt,
      });
    } catch (error) {
      setError('Ошибка при анализе токена');
    }
  }, []);

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Отладка токена</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  if (!tokenAnalysis) {
    return (
      <div className="h-[calc(100vh-64px)]">
        <PageLoader inline />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">🔍 Анализ JWT токена</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Основная информация */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">📊 Основная информация</h2>
          <div className="space-y-3">
            <div>
              <span className="font-medium">Статус:</span>
              <span
                className={`ml-2 px-2 py-1 rounded text-sm ${
                  tokenAnalysis.isValid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}
              >
                {tokenAnalysis.isValid ? '✅ Действителен' : '❌ Истек'}
              </span>
            </div>
            <div>
              <span className="font-medium">Время создания:</span>
              <div className="text-sm text-gray-600 mt-1">
                {tokenAnalysis.createdAt.toLocaleString()}
              </div>
            </div>
            <div>
              <span className="font-medium">Время истечения:</span>
              <div className="text-sm text-gray-600 mt-1">
                {tokenAnalysis.expiresAt.toLocaleString()}
              </div>
            </div>
            <div>
              <span className="font-medium">Часов до истечения:</span>
              <div className="text-sm text-gray-600 mt-1">
                {tokenAnalysis.hoursUntilExpiry.toFixed(2)} часов
              </div>
            </div>
            <div>
              <span className="font-medium">Общее время жизни:</span>
              <div className="text-sm text-gray-600 mt-1">
                {tokenAnalysis.totalHours.toFixed(2)} часов
              </div>
            </div>
          </div>
        </div>

        {/* Пользовательская информация */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">👤 Информация пользователя</h2>
          <div className="space-y-3">
            <div>
              <span className="font-medium">ID пользователя:</span>
              <div className="text-sm text-gray-600 mt-1">{tokenAnalysis.payload.sub}</div>
            </div>
            <div>
              <span className="font-medium">Имя пользователя:</span>
              <div className="text-sm text-gray-600 mt-1">{tokenAnalysis.payload.username}</div>
            </div>
            <div>
              <span className="font-medium">Роль:</span>
              <div className="text-sm text-gray-600 mt-1">{tokenAnalysis.payload.role}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Полный payload */}
      <div className="mt-6 bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">📋 Полный payload токена</h2>
        <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
          {JSON.stringify(tokenAnalysis.payload, null, 2)}
        </pre>
      </div>

      {/* Действия */}
      <div className="mt-6 flex gap-4">
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Назад
        </button>
        <button
          onClick={() => {
            localStorage.removeItem('token');
            router.push('/');
          }}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Удалить токен и выйти
        </button>
      </div>
    </div>
  );
}
 