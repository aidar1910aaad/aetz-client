'use client';

import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { ChevronDown, History, User, Settings, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/useUserStore';
import { useBktpStore } from '@/store/useBktpStore';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { taskNumber, client } = useBktpStore();

  const hasStarted = taskNumber.trim() !== '' || client.trim() !== '';
  const router = useRouter();
  const { user } = useUserStore();

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
    <header className="h-16 bg-white fixed border-b border-gray-200 flex items-center justify-between px-6 relative z-50">
      {/* Левая часть */}
      <div className="flex items-center gap-6">
        <Link href="/dashboard" className="cursor-pointer hover:opacity-80 transition-opacity">
          <Image 
            src="/login/logo.png" 
            alt="Лого" 
            width={120} 
            height={60} 
            style={{ width: "auto", height: "auto" }} 
          />
        </Link>
        <Link href={hasStarted ? "/dashboard/final" : "/dashboard/bktp"}>
          <button className="bg-[#8eba1e] text-white px-6 py-3 rounded-2xl hover:bg-[#7aa31a] transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-medium">
            {hasStarted ? 'Текущая заявка' : 'Новая заявка'}
          </button>
        </Link>
      </div>

      {/* Правая часть */}
      <div className="flex items-center gap-4 relative" ref={menuRef}>
        {/* История заявок */}
        <Link href="/dashboard/requests" className="group">
          <div className="p-3 bg-gray-100 hover:bg-[#8eba1e] rounded-xl transition-all duration-200 hover:scale-110 shadow-sm hover:shadow-md">
            <History className="w-5 h-5 text-gray-600 group-hover:text-white" />
          </div>
        </Link>

        {/* Имя пользователя + стрелка */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="flex items-center gap-3 bg-white hover:bg-gray-50 px-4 py-2 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200 hover:border-[#8eba1e]">
            <div className="w-8 h-8 bg-[#8eba1e] rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <span className="font-medium text-gray-700 group-hover:text-[#8eba1e] transition-colors">
              {formattedName || 'Пользователь'}
            </span>
            <ChevronDown
              size={16}
              className={`text-[#8eba1e] transition-transform duration-200 ${menuOpen ? 'rotate-180' : ''}`}
            />
          </div>
        </button>

        {/* Выпадающее меню */}
        {menuOpen && (
          <div className="absolute top-16 right-0 bg-white border border-gray-200 rounded-2xl shadow-xl w-56 z-50 overflow-hidden">
            <div className="p-2">
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                <p className="text-sm text-gray-600">Добро пожаловать</p>
                <p className="font-semibold text-gray-900">{formattedName || 'Пользователь'}</p>
              </div>
              
              <ul className="py-2">
                <li
                  onClick={() => {
                    router.push('/dashboard/profile');
                    setMenuOpen(false);
                  }}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors group"
                >
                  <User className="w-4 h-4 text-[#8eba1e] group-hover:text-[#7aa31a]" />
                  <span className="text-gray-700 group-hover:text-[#8eba1e]">Профиль</span>
                </li>
                
                <li className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors group">
                  <Settings className="w-4 h-4 text-[#8eba1e] group-hover:text-[#7aa31a]" />
                  <span className="text-gray-700 group-hover:text-[#8eba1e]">Настройки</span>
                </li>
                
                <div className="border-t border-gray-200 my-2"></div>
                
                <li
                  onClick={() => {
                    router.push('/');
                    setMenuOpen(false);
                  }}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-red-50 cursor-pointer transition-colors group"
                >
                  <LogOut className="w-4 h-4 text-red-500 group-hover:text-red-600" />
                  <span className="text-red-500 group-hover:text-red-600">Выйти</span>
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
