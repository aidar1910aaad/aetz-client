"use client";

import Image from "next/image";
import Link from "next/link";

const cards = [
  { title: "Трансформатор", iconTop: "/moduleIcons/icon1.png", iconBottom: "/icons/rightArr.png" },
  { title: "Среднее напряжение", iconTop: "/moduleIcons/icon2.png", iconBottom: "/icons/rightArr.png" },
  { title: "Низкое напряжение", iconTop: "/moduleIcons/icon3.png", iconBottom: "/icons/rightArr.png" },
  { title: "БМЗ", iconTop: "/moduleIcons/icon4.png", iconBottom: "/icons/rightArr.png" },
  { title: "Материалы", iconTop: "/moduleIcons/icon5.png", iconBottom: "/icons/rightArr.png", href: "/dashboard/materials" },
  { title: "Заявки", iconTop: "/moduleIcons/icon6.png", iconBottom: "/icons/rightArr.png", href: "/dashboard/requests" },
  { title: "Категории", iconTop: "/moduleIcons/icon7.png", iconBottom: "/icons/rightArr.png", href: "/dashboard/materials/categories" },
];

export default function DashboardHome() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Основные модули</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {cards.map((card, index) => {
          const cardContent = (
            <div
              className="w-[376px] h-[200px] bg-[#EDEDED] rounded-xl shadow-md p-4 flex flex-col justify-between
                         transition-transform duration-300 hover:scale-[1.02] cursor-pointer
                         hover:outline hover:outline-2 hover:outline-[#3A55DF]"
            >
              <Image src={card.iconTop} alt="top icon" width={32} height={32} />

              <div className="flex items-center justify-between mt-auto">
                <span className="text-lg font-medium">{card.title}</span>
                <Image src={card.iconBottom} alt="bottom icon" width={30} height={30} />
              </div>
            </div>
          );

          return card.href ? (
            <Link key={index} href={card.href}>
              {cardContent}
            </Link>
          ) : (
            <div key={index}>{cardContent}</div>
          );
        })}
      </div>
    </div>
  );
}
