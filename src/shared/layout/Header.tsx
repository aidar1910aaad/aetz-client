'use client';

import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/useUserStore'; // ← импорт zustand
import { useBktpStore } from '@/store/useBktpStore';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { taskNumber, client } = useBktpStore();

  const hasStarted = taskNumber.trim() !== '' || client.trim() !== '';
  const router = useRouter();
  const { user } = useUserStore(); // ← получаем пользователя
  console.log(user);
  // Закрытие меню при клике вне блока
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Форматирование имени
  const formattedName =
    user?.lastName && user?.firstName ? `${user.lastName} ${user.firstName[0]}.` : user?.username;

  return (
    <header className="h-16 bg-white fixed shadow flex items-center justify-between px-6 relative">
      {/* Левая часть */}
      <div className="flex items-center gap-6">
        <Link href="/dashboard" className="cursor-pointer">
          <Image src="/login/logo.png" alt="Лого" width={150} height={80} />
        </Link>
        <Link href="/dashboard/final">
          <button className="bg-[#3A55DF] text-white px-4 py-2 rounded-[20px] hover:bg-blue-700 transition">
            {hasStarted ? 'Текущая заявка' : 'Новая заявка'}
          </button>
        </Link>
      </div>

      {/* Правая часть */}
      <div className="flex items-center gap-6 relative" ref={menuRef}>
        <Image src="/icons/notification.png" alt="icon1" width={20} height={20} />
        <Image src="/icons/history.png" alt="icon2" width={24} height={24} />
        <Image src="/icons/mail.png" alt="icon3" width={24} height={24} />

        {/* Имя пользователя + стрелка */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex items-center gap-2 cursor-pointer hover:opacity-80"
        >
          <span className="font-medium border border-[#3A55DF] px-3 py-1 rounded-full transition-colors duration-200 hover:border-[#3A55DF] hover:text-[#3A55DF]">
            {formattedName || 'Пользователь'}
          </span>
          <ChevronDown
            size={16}
            className={`transition-transform ${menuOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {/* Выпадающее меню */}
        {menuOpen && (
          <div className="absolute top-14 right-0 bg-white border rounded shadow-md w-48 z-50">
            <ul className="flex flex-col">
              <li
                onClick={() => router.push('/dashboard/profile')}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              >
                Профиль
              </li>
              <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">Настройки</li>
              <li
                onClick={() => router.push('/')}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-red-500"
              >
                Выйти
              </li>
            </ul>
          </div>
        )}
      </div>
    </header>
  );
}
