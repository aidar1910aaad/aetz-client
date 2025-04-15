import type { ReactNode } from "react";
import Header from "@/shared/layout/Header";
import Sidebar from "@/shared/layout/Sidebar";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-100 text-black  flex flex-col">
      {/* Хедер */}
      <Header />

      {/* Контент под хедером */}
      <div className="flex flex-1 overflow-hidden">
        {/* Сайдбар */}
        <Sidebar />

        {/* Основной контент */}
        <main className="flex-1 overflow-y-auto p-6 ">
          {children}
        </main>
      </div>
    </div>
  );
}
