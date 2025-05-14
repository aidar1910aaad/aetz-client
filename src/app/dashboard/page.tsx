'use client';

import Link from 'next/link';

const cards = [
  { title: 'БКТП', type: 'bktp', href: '/dashboard/bktp' },
  { title: 'КТП', type: 'ktp', href: '/dashboard/ktp' },
];

export default function DashboardHome() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Основные модули</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {cards.map((card, index) => (
          <Link key={index} href={card.href}>
            <div
              className="w-[376px] h-[160px] bg-[#EDEDED] rounded-xl shadow-md p-4 flex flex-col justify-center
                         transition-transform duration-300 hover:scale-[1.02] cursor-pointer
                         hover:outline hover:outline-2 hover:outline-[#3A55DF]"
            >
              <span className="text-xl font-medium text-center">{card.title}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
