"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import Link from "next/link";


type Material = {
  id: number;
  name: string;
  category: string;
  unit: string;
  date: string;
  price: number;
};

const mockMaterials: Material[] = [
  {
    id: 1,
    name: "Кабель ВВГ 3x2.5",
    category: "Кабель",
    unit: "м",
    date: "2024-04-15",
    price: 350,
  },
  {
    id: 2,
    name: "Трансформатор 100кВА",
    category: "Трансформатор",
    unit: "шт",
    date: "2024-04-10",
    price: 240000,
  },
  {
    id: 3,
    name: "Шкаф автоматики",
    category: "Автоматика",
    unit: "шт",
    date: "2024-04-12",
    price: 150000,
  },
];

export default function AllMaterialsPage() {
  const [materials, setMaterials] = useState<Material[]>(mockMaterials);
  const [selectedCategory, setSelectedCategory] = useState("Все");

  const categories = ["Все", ...new Set(materials.map((m) => m.category))];
  const filtered = selectedCategory === "Все"
    ? materials
    : materials.filter((m) => m.category === selectedCategory);

  return (
    <div className="p-6 h-[calc(100vh-124x)] flex flex-col">
      <div className="flex justify-between items-center mb-6">
  <h1 className="text-2xl font-semibold">Материалы</h1>

  <div className="flex items-center gap-3 ml-auto">
    <Link
      href="/dashboard/materials/categories"
      className="bg-[#3A55DF] text-white px-4 py-2 rounded hover:bg-blue-700 transition text-sm"
    >
      Перейти к категориям
    </Link>
    <button className="bg-[#3A55DF] text-white px-4 py-2 rounded hover:bg-blue-700 transition">
      Создать материал
    </button>
  </div>
</div>



      {/* Фильтр по категории */}
      <div className="mb-4">
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="border border-gray-300 px-4 py-2 rounded text-sm focus:outline-[#3A55DF]"
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Таблица */}
      <div className="flex-1 overflow-y-auto border border-gray-200 rounded">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 text-gray-600">
            <tr>
              <th className="text-left px-6 py-3">Название</th>
              <th className="text-left px-6 py-3">Категория</th>
              <th className="text-left px-6 py-3">Ед. изм.</th>
              <th className="text-left px-6 py-3">Дата</th>
              <th className="text-left px-6 py-3">Цена</th>
              <th className="text-left px-6 py-3">Изменить / Удалить</th>

            </tr>
          </thead>
          <tbody>
            {filtered.map((m) => (
              <tr key={m.id} className="border-gray-200 border-[1px]">
                <td className="px-6 py-3">{m.name}</td>
                <td className="px-6 py-3">{m.category}</td>
                <td className="px-6 py-3">{m.unit}</td>
                <td className="px-6 py-3">{m.date}</td>
                <td className="px-6 py-3">{m.price.toLocaleString()} ₸</td>
                <td className="px-6 py-3">
  <div className="flex gap-4 ml-[50px]">
    <button className="text-blue-600 hover:text-blue-800 transition">
      <Pencil size={18} />
    </button>
    <button className="text-red-600 hover:text-red-800 transition">
      <Trash2 size={18} />
    </button>
  </div>
</td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
