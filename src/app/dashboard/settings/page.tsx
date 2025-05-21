'use client';

import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const router = useRouter();

  const sections = [
    {
      title: 'БМЗ',
      description: 'Настройки БМЗ',
      path: '/dashboard/settings/bmz'
    },
    {
      title: 'Трансформатор',
      description: 'Настройки трансформатора',
      path: '/dashboard/settings/transformer'
    },
    {
      title: 'РУСН',
      description: 'Настройки РУСН',
      path: '/dashboard/settings/rusn'
    },
    {
      title: 'РУНН',
      description: 'Настройки РУНН',
      path: '/dashboard/settings/runn'
    },
    {
      title: 'Дополнительное оборудование',
      description: 'Настройки дополнительного оборудования',
      path: '/dashboard/settings/additional'
    },
    {
      title: 'Работы',
      description: 'Настройки работ',
      path: '/dashboard/settings/works'
    }
  ];

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
            />
          </svg>
        </button>
        <h1 className="text-2xl font-semibold">Настройки</h1>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sections.map((section, index) => (
            <button
              key={index}
              onClick={() => router.push(section.path)}
              className="p-4 bg-white border border-gray-200 rounded-lg hover:border-[#3A55DF] hover:shadow-md transition-all duration-200 text-left"
            >
              <h2 className="text-lg font-medium mb-2 text-gray-900">{section.title}</h2>
              <p className="text-sm text-gray-600">{section.description}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
} 