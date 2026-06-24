import React from 'react';
import { normalizeBusbarSection } from '@/utils/busbarSectionUtils';

interface BusbarSectionSelectorProps {
  availableSections: string[];
  selectedSection: string | null;
  recommendedSection?: string | null;
  onSectionChange: (section: string) => void;
}

export const BusbarSectionSelector: React.FC<BusbarSectionSelectorProps> = ({
  availableSections,
  selectedSection,
  recommendedSection,
  onSectionChange,
}) => {
  const normalizedSelected = selectedSection
    ? normalizeBusbarSection(selectedSection)
    : null;

  const normalizedRecommended = recommendedSection
    ? normalizeBusbarSection(recommendedSection)
    : null;

  return (
    <div className="space-y-3">
      <span className="text-sm font-medium text-gray-700">Сечение шины</span>
      <div className="flex flex-wrap gap-2">
        {availableSections.map((section) => {
          const normalized = normalizeBusbarSection(section);
          const selected = normalizedSelected === normalized;
          const recommended = normalizedRecommended === normalized;

          return (
            <button
              key={section}
              type="button"
              onClick={() => onSectionChange(section)}
              className={`relative rounded-xl border-2 px-4 py-2.5 text-sm font-medium transition-all ${
                selected
                  ? 'border-[#8eba1e] bg-[#8eba1e]/5 text-gray-900 shadow-sm'
                  : recommended
                    ? 'border-[#8eba1e]/50 bg-[#8eba1e]/[0.07] text-gray-900 hover:border-[#8eba1e] hover:bg-[#8eba1e]/10'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <span className="flex items-center gap-1.5">
                {section} мм
                {recommended && (
                  <span
                    className={`rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                      selected
                        ? 'bg-[#8eba1e] text-white'
                        : 'bg-[#8eba1e]/15 text-[#6b8f16]'
                    }`}
                  >
                    реком.
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>

      {normalizedRecommended && (
        <p className="text-xs text-gray-500">
          Сечение с меткой{' '}
          <span className="rounded bg-[#8eba1e]/15 px-1 py-0.5 text-[10px] font-semibold uppercase text-[#6b8f16]">
            реком.
          </span>{' '}
          — рекомендуется для выбранного выключателя и материала
        </p>
      )}
    </div>
  );
};
