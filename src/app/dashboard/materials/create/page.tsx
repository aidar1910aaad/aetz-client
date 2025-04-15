"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const categories = ["Кабель", "Трансформатор", "Автоматика"];
const units = ["шт", "м", "кг"];

export default function CreateMaterialPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [unit, setUnit] = useState("");
  const [date, setDate] = useState("");
  const [price, setPrice] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !category || !unit || !date || !price) {
      alert("Пожалуйста, заполните все поля");
      return;
    }

    const newMaterial = {
      id: Date.now(),
      name,
      category,
      unit,
      date,
      price: parseFloat(price),
    };

    console.log("Создан материал:", newMaterial);
    router.push("/dashboard/materials");
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6">Создание материала</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 text-sm font-medium">Название</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-[#3A55DF]"
          />
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium">Категория</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-[#3A55DF]"
          >
            <option value="">Выберите категорию</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium">Единица измерения</label>
          <select
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-[#3A55DF]"
          >
            <option value="">Выберите единицу</option>
            {units.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium">Дата добавления</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-[#3A55DF]"
          />
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium">Цена (₸)</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-[#3A55DF]"
          />
        </div>

        <button
          type="submit"
          className="bg-[#3A55DF] text-white px-6 py-2 rounded hover:bg-blue-700 transition"
        >
          Сохранить
        </button>
      </form>
    </div>
  );
}