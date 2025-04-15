"use client";

import { useState } from "react";
import Link from "next/link";

type Category = {
  id: number;
  name: string;
};

export default function MaterialCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([
    { id: 1, name: "Кабель" },
    { id: 2, name: "Трансформатор" },
    { id: 3, name: "Автоматика" },
  ]);
  const [newCategory, setNewCategory] = useState("");

  const handleAddCategory = () => {
    const trimmed = newCategory.trim();
    if (!trimmed) return;
    const exists = categories.some((cat) => cat.name.toLowerCase() === trimmed.toLowerCase());
    if (exists) return alert("Такая категория уже существует");

    const newCat = {
      id: Date.now(),
      name: trimmed,
    };
    setCategories((prev) => [...prev, newCat]);
    setNewCategory("");
  };

  return (
    <div className="p-6">
      {/* Заголовок и кнопка перехода */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Категории материалов</h1>
        <Link
          href="/dashboard/materials"
          className="bg-[#3A55DF] text-white px-4 py-2 rounded hover:bg-blue-700 transition text-sm"
        >
          Перейти к материалам
        </Link>
      </div>

      {/* Форма создания */}
      <div className="mb-6 flex gap-2 items-center">
        <input
          type="text"
          placeholder="Новая категория"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          className="border border-gray-300 px-4 py-2 rounded w-64 text-sm focus:outline-[#3A55DF]"
        />
        <button
          onClick={handleAddCategory}
          className="bg-[#3A55DF] text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          Создать
        </button>
      </div>

      {/* Список категорий */}
      <ul className="space-y-2">
        {categories.map((cat) => (
          <li
            key={cat.id}
            className="px-4 py-2 bg-white border border-gray-200 rounded shadow-sm hover:bg-gray-50"
          >
            {cat.name}
          </li>
        ))}
      </ul>
    </div>
  );
}
