"use client";

import Image from "next/image";
import { Pencil } from "lucide-react";

export default function ProfilePage() {
  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <aside className="w-64 bg-[#f8f9fb] border-r p-6 space-y-6">
        <div className="space-y-4">
          <button className="flex items-center gap-2 font-medium text-[#3A55DF]">
            <Image src="/icons/profile-icon.png" width={20} height={20} alt="Профиль" />
            Мой профиль
          </button>
          <button className="flex items-center gap-2 text-black">
            <Image src="/icons/bell-icon.png" width={20} height={20} alt="Уведомления" />
            Уведомления
          </button>
          <button className="flex items-center gap-2 text-black">
            <Image src="/icons/history-icon.png" width={20} height={20} alt="История" />
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
              <h2 className="text-xl font-semibold">Дусембай Альтаир</h2>
              <p className="text-sm text-gray-600">Инженер ПТО</p>
              <p className="text-sm text-gray-600">Астана, Казахстан</p>
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
              <p>Альтаир</p>
            </div>
            <div>
              <p className="font-semibold">Фамилия</p>
              <p>Дусембай</p>
            </div>
            <div>
              <p className="font-semibold">Email адрес</p>
              <p>altairdusembay@gmail.com</p>
            </div>
            <div>
              <p className="font-semibold">Телефон</p>
              <p>+7 707 160 2888</p>
            </div>
            <div>
              <p className="font-semibold">Должность</p>
              <p>ПТО инженер</p>
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
              <p>Казахстан</p>
            </div>
            <div>
              <p className="font-semibold">Город</p>
              <p>Астана</p>
            </div>
            <div>
              <p className="font-semibold">Почтовый индекс</p>
              <p>010000</p>
            </div>
            <div>
              <p className="font-semibold">ID</p>
              <p>25252525</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}