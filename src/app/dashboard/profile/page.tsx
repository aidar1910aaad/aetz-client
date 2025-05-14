'use client';

import Image from 'next/image';
import { Pencil } from 'lucide-react';
import { useUserStore } from '@/store/useUserStore'; // 👈 zustand store

export default function ProfilePage() {
  const { user } = useUserStore(); // 👈 получаем пользователя

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <aside className="w-64 bg-[#f8f9fb]  p-6 space-y-6">
        <div className="space-y-4">
          <button className="flex items-center gap-2 font-medium text-[#3A55DF]">
            <Image
              src="/icons/profile-icon.png"
              alt="Профиль"
              width={20}
              height={20}
              className="w-5 h-5"
            />
            Мой профиль
          </button>

          <button className="flex items-center gap-2 text-black">
            <Image
              src="/icons/bell-icon.png"
              alt="Уведомления"
              width={20}
              height={20}
              className="w-5 h-5"
            />
            Уведомления
          </button>

          <button className="flex items-center gap-2 text-black">
            <Image
              src="/icons/history-icon.png"
              alt="История"
              width={20}
              height={20}
              className="w-5 h-5"
            />
            История действий
          </button>
        </div>

        <button className="mt-10 bg-[#3A55DF] text-white px-4 py-2 rounded hover:bg-blue-700 transition">
          Новая заявка
        </button>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6 space-y-6">
        <h1 className="text-2xl font-semibold">Мой профиль</h1>

        {/* Блок с фото и ФИО */}
        <div className="bg-white p-6 rounded-xl shadow flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Image
              src="/images/avatar.jpg"
              alt="Avatar"
              width={64}
              height={64}
              className="rounded-full"
            />
            <div>
              <h2 className="text-xl font-semibold">
                {user?.lastName} {user?.firstName}
              </h2>
              <p className="text-sm text-gray-600">{user?.position}</p>
              <p className="text-sm text-gray-600">
                {user?.city}, {user?.country}
              </p>
            </div>
          </div>
          <button className="flex items-center gap-1 text-sm text-gray-600 hover:text-black">
            <Pencil size={16} /> Исправить
          </button>
        </div>

        {/* Персональные данные */}
        <div className="bg-white p-6 rounded-xl shadow space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Персональные данные</h3>
            <button className="flex items-center gap-1 text-sm text-gray-600 hover:text-black">
              <Pencil size={16} /> Исправить
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm text-gray-800">
            <div>
              <p className="font-semibold">Имя</p>
              <p>{user?.firstName}</p>
            </div>
            <div>
              <p className="font-semibold">Фамилия</p>
              <p>{user?.lastName}</p>
            </div>
            <div>
              <p className="font-semibold">Email адрес</p>
              <p>{user?.email}</p>
            </div>
            <div>
              <p className="font-semibold">Телефон</p>
              <p>{user?.phone}</p>
            </div>
            <div>
              <p className="font-semibold">Должность</p>
              <p>{user?.position}</p>
            </div>
          </div>
        </div>

        {/* Адрес */}
        <div className="bg-white p-6 rounded-xl shadow space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Адрес</h3>
            <button className="flex items-center gap-1 text-sm text-gray-600 hover:text-black">
              <Pencil size={16} /> Исправить
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm text-gray-800">
            <div>
              <p className="font-semibold">Страна</p>
              <p>{user?.country}</p>
            </div>
            <div>
              <p className="font-semibold">Город</p>
              <p>{user?.city}</p>
            </div>
            <div>
              <p className="font-semibold">Почтовый индекс</p>
              <p>{user?.postalCode}</p>
            </div>
            <div>
              <p className="font-semibold">ID</p>
              <p>{user?.id}</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
