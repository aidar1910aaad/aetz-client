'use client';

import { useRouter } from 'next/navigation';
import { 
  Building2, 
  Zap, 
  Power, 
  Battery, 
  Wrench, 
  HardHat,
  ChevronLeft
} from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();

  const sections = [
    {
      title: 'БМЗ',
      description: 'Настройки БМЗ',
      path: '/dashboard/settings/bmz',
      icon: Building2,
      color: 'bg-blue-50 text-blue-600'
    },
    {
      title: 'Трансформатор',
      description: 'Настройки трансформатора',
      path: '/dashboard/settings/transformer',
      icon: Zap,
      color: 'bg-yellow-50 text-yellow-600'
    },
    {
      title: 'РУСН',
      description: 'Настройки РУСН',
      path: '/dashboard/settings/rusn',
      icon: Power,
      color: 'bg-red-50 text-red-600'
    },
    {
      title: 'РУНН',
      description: 'Настройки РУНН',
      path: '/dashboard/settings/runn',
      icon: Battery,
      color: 'bg-green-50 text-green-600'
    },
    {
      title: 'Дополнительное оборудование',
      description: 'Настройки дополнительного оборудования',
      path: '/dashboard/settings/additional',
      icon: Wrench,
      color: 'bg-purple-50 text-purple-600'
    },
    {
      title: 'Работы',
      description: 'Настройки работ',
      path: '/dashboard/settings/works',
      icon: HardHat,
      color: 'bg-orange-50 text-orange-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-white rounded-full transition-colors duration-200"
          >
            <ChevronLeft className="w-6 h-6 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Настройки</h1>
            <p className="text-sm text-gray-500 mt-1">Управление настройками системы</p>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sections.map((section, index) => (
            <button
              key={index}
              onClick={() => router.push(section.path)}
              className="group relative bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg ${section.color}`}>
                    <section.icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold text-gray-900 group-hover:text-[#3A55DF] transition-colors duration-200">
                      {section.title}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      {section.description}
                    </p>
                  </div>
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#3A55DF] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Выберите раздел для настройки параметров</p>
        </div>
      </div>
    </div>
  );
}