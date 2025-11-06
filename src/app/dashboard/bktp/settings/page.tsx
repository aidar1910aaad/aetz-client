'use client';

import { useRouter } from 'next/navigation';
import { Building2, Zap, Power, Battery, Wrench, HardHat, ChevronLeft, Cable } from 'lucide-react';
import RoleGuard from '@/components/common/RoleGuard';
import { UserRole } from '@/types/user';

export default function SettingsPage() {
  const router = useRouter();

  const sections = [
    {
      title: 'БМЗ',
      description: 'Настройки БМЗ',
      path: '/dashboard/settings/bmz',
      icon: Building2,
      color: 'bg-blue-50 text-blue-600',
    },
    {
      title: 'Трансформатор',
      description: 'Настройки трансформатора',
      path: '/dashboard/settings/transformer',
      icon: Zap,
      color: 'bg-yellow-50 text-yellow-600',
    },
    {
      title: 'РУСН',
      description: 'Настройки РУСН',
      path: '/dashboard/settings/rusn',
      icon: Power,
      color: 'bg-red-50 text-red-600',
    },
    {
      title: 'РУНН',
      description: 'Настройки РУНН',
      path: '/dashboard/bktp/settings/runn',
      icon: Battery,
      color: 'bg-green-50 text-green-600',
    },
    {
      title: 'Сборные шины РУНН',
      description: 'Настройка сборных шин РУНН',
      path: '/dashboard/bktp/settings/runn-busbar',
      icon: Cable,
      color: 'bg-indigo-50 text-indigo-600',
    },
    {
      title: 'Сборные шины',
      description: 'Настройка сборных шин',
      path: '/dashboard/bktp/settings/busbar',
      icon: Cable,
      color: 'bg-indigo-50 text-indigo-600',
    },
    {
      title: 'Дополнительное оборудование',
      description: 'Настройки дополнительного оборудования',
      path: '/dashboard/settings/additional',
      icon: Wrench,
      color: 'bg-purple-50 text-purple-600',
    },
    {
      title: 'Работы',
      description: 'Настройки работ',
      path: '/dashboard/settings/works',
      icon: HardHat,
      color: 'bg-orange-50 text-orange-600',
    },
  ];

  return (
    <RoleGuard
      allowedRoles={[UserRole.ADMIN, UserRole.PTO]}
      redirectTo="/dashboard"
      pagePath="/dashboard/bktp/settings"
    >
      <div className="h-[calc(100vh-64px)] bg-white overflow-y-auto">
        <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => router.back()}
              className="p-3 bg-gray-100 hover:bg-[#8eba1e] rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600 hover:text-white" />
            </button>
            <div className="p-3 bg-gray-100 rounded-xl">
              <Wrench className="w-6 h-6 text-[#8eba1e]" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Настройки БКТП</h1>
              <p className="text-gray-600">Управление настройками системы</p>
            </div>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sections.map((section, index) => (
            <button
              key={index}
              onClick={() => router.push(section.path)}
              className="group relative bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 hover:border-[#8eba1e]/30 hover:scale-[1.02]"
            >
              {/* Декоративный акцент сверху */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-[#8eba1e] opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
              
              <div className="p-6">
                <div className="flex items-start gap-4">
                  <div className={`p-4 rounded-2xl ${section.color} group-hover:bg-[#8eba1e] group-hover:text-white transition-all duration-300`}>
                    <section.icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-lg font-bold text-gray-900 group-hover:text-[#8eba1e] transition-colors duration-200">
                      {section.title}
                    </h2>
                    <p className="text-sm text-gray-600 mt-2">{section.description}</p>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
            <div className="w-16 h-16 bg-[#8eba1e] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Wrench className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Настройки системы</h3>
            <p className="text-sm text-gray-600">Выберите раздел для настройки параметров БКТП</p>
          </div>
        </div>
      </div>
    </div>
    </RoleGuard>
  );
}
