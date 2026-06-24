'use client';

import Link from 'next/link';
import {
  Building2,
  Zap,
  Power,
  Battery,
  Wrench,
  HardHat,
  Cable,
  ChevronRight,
  Settings,
  LayoutGrid,
  Network,
  ArrowRight,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import RoleGuard from '@/components/common/RoleGuard';
import { UserRole } from '@/types/user';

type SettingsSection = {
  title: string;
  shortLabel: string;
  description: string;
  path: string;
  icon: LucideIcon;
  step: number;
  tag?: string;
  accent: {
    icon: string;
    badge: string;
    border: string;
    step: string;
  };
};

type SettingsGroup = {
  id: string;
  title: string;
  description: string;
  accentBar: string;
  sections: SettingsSection[];
};

const settingsGroups: SettingsGroup[] = [
  {
    id: 'equipment',
    title: '1. Оборудование',
    description: 'С чего начинается состав БКТП',
    accentBar: 'bg-blue-500',
    sections: [
      {
        step: 1,
        title: 'БМЗ',
        shortLabel: 'БМЗ',
        description: 'Типы зданий, размеры и параметры блок-модуля',
        path: '/dashboard/settings/bmz',
        icon: Building2,
        tag: 'Здание',
        accent: {
          icon: 'bg-blue-50 text-blue-600 ring-blue-200/70',
          badge: 'bg-blue-50 text-blue-700 ring-blue-200/60',
          border: 'hover:border-blue-300',
          step: 'bg-blue-600 text-white',
        },
      },
      {
        step: 2,
        title: 'Трансформатор',
        shortLabel: 'ТМ',
        description: 'Мощность, напряжение и правила подбора',
        path: '/dashboard/settings/transformer',
        icon: Zap,
        tag: 'Силовой',
        accent: {
          icon: 'bg-amber-50 text-amber-600 ring-amber-200/70',
          badge: 'bg-amber-50 text-amber-700 ring-amber-200/60',
          border: 'hover:border-amber-300',
          step: 'bg-amber-500 text-white',
        },
      },
    ],
  },
  {
    id: 'switchgear',
    title: '2. Распределительные устройства',
    description: 'РУ среднего и низкого напряжения',
    accentBar: 'bg-red-500',
    sections: [
      {
        step: 3,
        title: 'РУСН',
        shortLabel: 'РУСН',
        description: 'Ячейки, коммутация и материалы среднего напряжения',
        path: '/dashboard/settings/rusn',
        icon: Power,
        tag: '6–20 кВ',
        accent: {
          icon: 'bg-red-50 text-red-600 ring-red-200/70',
          badge: 'bg-red-50 text-red-700 ring-red-200/60',
          border: 'hover:border-red-300',
          step: 'bg-red-500 text-white',
        },
      },
      {
        step: 4,
        title: 'РУНН',
        shortLabel: 'РУНН',
        description: 'Ячейки, автоматы и конфигурация 0,4 кВ',
        path: '/dashboard/bktp/settings/runn',
        icon: Battery,
        tag: '0,4 кВ',
        accent: {
          icon: 'bg-emerald-50 text-emerald-600 ring-emerald-200/70',
          badge: 'bg-emerald-50 text-emerald-700 ring-emerald-200/60',
          border: 'hover:border-emerald-300',
          step: 'bg-emerald-600 text-white',
        },
      },
    ],
  },
  {
    id: 'busbars',
    title: '3. Сборные шины',
    description: 'Шинные системы и их конфигурация',
    accentBar: 'bg-indigo-500',
    sections: [
      {
        step: 5,
        title: 'Сборные шины РУНН',
        shortLabel: 'Шины РУНН',
        description: 'Шины распределительного устройства низкого напряжения',
        path: '/dashboard/bktp/settings/runn-busbar',
        icon: Network,
        tag: '0,4 кВ',
        accent: {
          icon: 'bg-indigo-50 text-indigo-600 ring-indigo-200/70',
          badge: 'bg-indigo-50 text-indigo-700 ring-indigo-200/60',
          border: 'hover:border-indigo-300',
          step: 'bg-indigo-600 text-white',
        },
      },
      {
        step: 6,
        title: 'Сборные шины',
        shortLabel: 'Шины',
        description: 'Общие настройки сборных шин',
        path: '/dashboard/bktp/settings/busbar',
        icon: Cable,
        tag: 'Общие',
        accent: {
          icon: 'bg-violet-50 text-violet-600 ring-violet-200/70',
          badge: 'bg-violet-50 text-violet-700 ring-violet-200/60',
          border: 'hover:border-violet-300',
          step: 'bg-violet-600 text-white',
        },
      },
    ],
  },
  {
    id: 'extra',
    title: '4. Дополнительно',
    description: 'Сопутствующее оборудование и работы',
    accentBar: 'bg-orange-500',
    sections: [
      {
        step: 7,
        title: 'Дополнительное оборудование',
        shortLabel: 'Доп. оборуд.',
        description: 'Перечень и параметры дополнительного оборудования',
        path: '/dashboard/settings/additional',
        icon: Wrench,
        tag: 'Опции',
        accent: {
          icon: 'bg-purple-50 text-purple-600 ring-purple-200/70',
          badge: 'bg-purple-50 text-purple-700 ring-purple-200/60',
          border: 'hover:border-purple-300',
          step: 'bg-purple-600 text-white',
        },
      },
      {
        step: 8,
        title: 'Работы',
        shortLabel: 'Работы',
        description: 'Монтаж, пусконаладка и сопутствующие работы',
        path: '/dashboard/settings/works',
        icon: HardHat,
        tag: 'СМР',
        accent: {
          icon: 'bg-orange-50 text-orange-600 ring-orange-200/70',
          badge: 'bg-orange-50 text-orange-700 ring-orange-200/60',
          border: 'hover:border-orange-300',
          step: 'bg-orange-500 text-white',
        },
      },
    ],
  },
];

const allSections = settingsGroups.flatMap((group) => group.sections);

function SettingsCard({ section }: { section: SettingsSection }) {
  const Icon = section.icon;

  return (
    <Link
      href={section.path}
      className={`group relative flex h-full flex-col overflow-hidden rounded-xl border border-gray-200 bg-white transition-all hover:shadow-md ${section.accent.border}`}
    >
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${section.accent.step}`}
            >
              {section.step}
            </span>
            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1 ${section.accent.icon}`}
            >
              <Icon className="h-5 w-5" />
            </div>
          </div>
          {section.tag && (
            <span
              className={`inline-flex shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${section.accent.badge}`}
            >
              {section.tag}
            </span>
          )}
        </div>

        <h3 className="text-lg font-semibold text-gray-900">{section.title}</h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-gray-500">{section.description}</p>

        <div className="mt-4 flex items-center gap-1.5 text-sm font-medium text-[#8eba1e] opacity-80 transition-opacity group-hover:opacity-100">
          Открыть настройки
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </div>
      </div>
    </Link>
  );
}

function FlowStrip() {
  return (
    <div className="overflow-x-auto pb-1">
      <div className="flex min-w-max items-center gap-1.5 px-1">
        {allSections.map((section, index) => (
          <div key={section.path} className="flex items-center gap-1.5">
            <Link
              href={section.path}
              title={section.title}
              className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium ring-1 transition-colors hover:shadow-sm ${section.accent.badge}`}
            >
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${section.accent.step}`}
              >
                {section.step}
              </span>
              {section.shortLabel}
            </Link>
            {index < allSections.length - 1 && (
              <ChevronRight className="h-4 w-4 shrink-0 text-gray-300" aria-hidden />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <RoleGuard
      allowedRoles={[UserRole.ADMIN, UserRole.PTO]}
      redirectTo="/dashboard"
      pagePath="/dashboard/bktp/settings"
    >
      <div className="h-[calc(100vh-64px)] overflow-y-auto bg-gray-50">
        <div className="border-b border-[#7aa31a]/30 bg-gradient-to-r from-[#7aa31a] to-[#8eba1e]">
          <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:px-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-sm text-white/80">
                <Link href="/dashboard" className="transition-colors hover:text-white">
                  Главная
                </Link>
                <span>/</span>
                <span className="text-white">Настройки БКТП</span>
              </div>
              <h1 className="mt-1 text-2xl font-semibold text-white">Настройки БКТП</h1>
              <p className="mt-1 text-sm text-white/85">
                Справочники и параметры для каждого модуля заявки
              </p>
            </div>
            <Link
              href="/dashboard/bktp"
              className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-white/30 bg-white/10 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/20"
            >
              <LayoutGrid size={16} />
              К формированию БКТП
            </Link>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
          {/* Подсказка + схема порядка */}
          <div className="mb-6 rounded-xl border border-[#8eba1e]/25 bg-white p-5 shadow-sm">
            <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-900">Порядок модулей в БКТП</p>
                <p className="text-sm text-gray-500">
                  Нажмите на модуль в схеме или выберите карточку ниже
                </p>
              </div>
              <span className="inline-flex w-fit items-center rounded-full bg-[#8eba1e]/10 px-3 py-1 text-xs font-medium text-[#6b8f16] ring-1 ring-[#8eba1e]/20">
                8 разделов настроек
              </span>
            </div>
            <FlowStrip />
          </div>

          {/* Группы */}
          <div className="space-y-6">
            {settingsGroups.map((group) => (
              <section
                key={group.id}
                className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
              >
                <div className="flex items-stretch border-b border-gray-100">
                  <div className={`w-1.5 shrink-0 ${group.accentBar}`} aria-hidden />
                  <div className="flex flex-1 flex-col gap-0.5 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h2 className="text-base font-semibold text-gray-900">{group.title}</h2>
                      <p className="text-sm text-gray-500">{group.description}</p>
                    </div>
                    <span className="mt-1 text-xs font-medium text-gray-400 sm:mt-0">
                      шаги {group.sections[0].step}–{group.sections[group.sections.length - 1].step}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2">
                  {group.sections.map((section) => (
                    <SettingsCard key={section.path} section={section} />
                  ))}
                </div>
              </section>
            ))}
          </div>

          <div className="mt-6 flex items-start gap-3 rounded-xl border border-gray-200 bg-white px-5 py-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-500">
              <Settings className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-900">Изменения сохраняются в справочниках</p>
              <p className="mt-0.5 text-sm text-gray-500">
                Новые параметры будут использоваться при формировании следующих заявок БКТП
              </p>
            </div>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}
