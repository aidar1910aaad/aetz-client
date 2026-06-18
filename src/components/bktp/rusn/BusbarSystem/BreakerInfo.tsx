import React from 'react';

interface BreakerInfoProps {
  selectedBreaker?: {
    name: string;
  };
  getBreakerCurrent: (name: string) => number | null;
}

export const BreakerInfo: React.FC<BreakerInfoProps> = ({ selectedBreaker, getBreakerCurrent }) => {
  if (!selectedBreaker) return null;

  const current = getBreakerCurrent(selectedBreaker.name);

  return (
    <div className="rounded-xl border border-[#8eba1e]/25 bg-[#8eba1e]/5 px-4 py-3">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Выключатель</p>
      <p className="mt-1 text-sm font-semibold text-gray-900">
        {selectedBreaker.name}
        {current != null && <span className="font-normal text-gray-600"> · {current} А</span>}
      </p>
    </div>
  );
};
