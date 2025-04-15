"use client";

import { useState } from "react";
import clsx from "clsx";

const statuses = ["Все", "В обработке", "Завершено"];

const requests = [
  { id: 1, date: "2024-04-01", status: "В обработке", amount: "1 200 000 ₸", author: "Алия С." },
  { id: 2, date: "2024-04-05", status: "Завершено", amount: "850 000 ₸", author: "Бауыржан Т." },
  { id: 3, date: "2024-04-10", status: "В обработке", amount: "3 400 000 ₸", author: "Елена М." },
  { id: 4, date: "2024-04-12", status: "Завершено", amount: "1 750 000 ₸", author: "Дуйсембай А." },
  { id: 5, date: "2024-04-14", status: "В обработке", amount: "620 000 ₸", author: "Алия С." },
  { id: 6, date: "2024-04-01", status: "В обработке", amount: "1 200 000 ₸", author: "Алия С." },
  { id: 7, date: "2024-04-05", status: "Завершено", amount: "850 000 ₸", author: "Бауыржан Т." },
  { id: 8, date: "2024-04-10", status: "В обработке", amount: "3 400 000 ₸", author: "Елена М." },
  { id: 9, date: "2024-04-12", status: "Завершено", amount: "1 750 000 ₸", author: "Дуйсембай А." },
  { id: 10, date: "2024-04-14", status: "В обработке", amount: "620 000 ₸", author: "Алия С." },
  { id: 11, date: "2024-04-01", status: "В обработке", amount: "1 200 000 ₸", author: "Алия С." },
  { id: 12, date: "2024-04-05", status: "Завершено", amount: "850 000 ₸", author: "Бауыржан Т." },
  { id: 13, date: "2024-04-10", status: "В обработке", amount: "3 400 000 ₸", author: "Елена М." },
  { id: 14, date: "2024-04-12", status: "Завершено", amount: "1 750 000 ₸", author: "Дуйсембай А." },
  { id: 15, date: "2024-04-14", status: "В обработке", amount: "620 000 ₸", author: "Алия С." },
];

export default function RequestsPage() {
  const [selectedStatus, setSelectedStatus] = useState("Все");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const filtered = requests.filter((r) => {
    const matchesStatus = selectedStatus === "Все" || r.status === selectedStatus;
    const inDateRange =
      (!fromDate || r.date >= fromDate) && (!toDate || r.date <= toDate);
    return matchesStatus && inDateRange;
  });

  return (
    <div className="h-[calc(100vh-124px)] flex flex-col p-6">
      {/* Заголовок + фильтры */}
      <div className="mb-4">
        <h1 className="text-2xl font-semibold mb-4">Заявки</h1>
  
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div className="flex flex-wrap gap-2 items-center">
            {/* Select статус */}
            <div className="relative w-52">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="appearance-none w-full cursor-pointer rounded-full border border-[#C8D1E0] bg-white px-4 py-2 pr-10 text-sm text-gray-800 shadow-sm 
                  focus:outline-none focus:ring-2 focus:ring-[#3A55DF] transition"
              >
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-xs">▼</div>
            </div>
  
            {/* Даты */}
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-[#3A55DF]"
            />
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-[#3A55DF]"
            />
          </div>
  
          {/* Кнопка */}
          <button className="bg-[#3A55DF] text-white px-4 py-2 rounded-full hover:bg-blue-700 transition">
            Создать новую заявку
          </button>
        </div>
      </div>
  
      {/* Прокручиваемый блок с таблицей и пагинацией */}
      <div className="flex-1 overflow-y-auto">
        <div className="rounded-xl border border-gray-200">
          <table className="min-w-full table-auto text-sm">
            <thead className="bg-gray-100 text-gray-600 text-left">
              <tr>
                <th className="px-6 py-3">Дата</th>
                <th className="px-6 py-3">Статус</th>
                <th className="px-6 py-3">Сумма</th>
                <th className="px-6 py-3">Автор</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((req, idx) => (
                <tr key={`${req.id}-${idx}`} className="border-t">
                  <td className="px-6 py-4">{req.date}</td>
                  <td className="px-6 py-4">
                    <span
                      className={clsx(
                        "px-3 py-1 rounded-full text-xs",
                        req.status === "Завершено"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      )}
                    >
                      {req.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">{req.amount}</td>
                  <td className="px-6 py-4">{req.author}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
  
        {/* Пагинация */}
        <div className="mt-4 flex justify-center gap-2">
          <button className="px-3 py-1 rounded border border-gray-300 hover:bg-gray-100">1</button>
          <button className="px-3 py-1 rounded border border-gray-300 hover:bg-gray-100">2</button>
          <button className="px-3 py-1 rounded border border-gray-300 hover:bg-gray-100">3</button>
          <button className="px-3 py-1 rounded border border-gray-300 hover:bg-gray-100">Вперёд</button>
        </div>
      </div>
    </div>
  );
  
  
}
