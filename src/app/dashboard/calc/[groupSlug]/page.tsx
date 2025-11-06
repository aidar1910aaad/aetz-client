'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useCalculations } from '@/hooks/useCalculations';
import { deleteCalculation } from '@/api/calculations';
import { FileText, Plus, Trash2, Calculator, ArrowLeft } from 'lucide-react';
import RoleGuard from '@/components/common/RoleGuard';
import { UserRole } from '@/types/user';

export default function GroupCalculationsPage() {
  const router = useRouter();
  const { groupSlug } = useParams() as { groupSlug: string };
  const { selectedGroup, setSelectedGroup, groups, calculations, loading } = useCalculations();
  const [deletingCalc, setDeletingCalc] = useState<string | null>(null); // ID калькуляции, которая удаляется
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Функция для показа уведомлений
  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000); // Автоматически скрыть через 3 секунды
  };

  useEffect(() => {
    const decodedSlug = decodeURIComponent(groupSlug);
    const group = groups.find((g) => g.slug === decodedSlug);
    if (group) {
      setSelectedGroup(group);
      
      // Логирование для группы "панель що 70"
      if (decodedSlug === 'panel-sho-70') {
        console.log('Открыта группа калькуляций: панель що 70');
      }
    }
  }, [groupSlug, groups, setSelectedGroup]);



  const handleOpenCalc = (calcSlug: string) => {
    router.push(`/dashboard/calc/${groupSlug}/${calcSlug}`);
  };

  const handleCreateNew = () => {
    router.push(`/dashboard/calc/${groupSlug}/new`);
  };

  const handleDelete = async (calcSlug: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Предотвращаем открытие калькуляции при клике на кнопку удаления
    
    if (!confirm('Вы уверены, что хотите удалить эту калькуляцию? Это действие нельзя отменить.')) {
      return;
    }

    try {
      setDeletingCalc(calcSlug); // Показываем состояние загрузки
      
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');

      await deleteCalculation(groupSlug, calcSlug, token);
      
      showToast('Калькуляция успешно удалена', 'success');
      
      // После удаления перезагрузить калькуляции
      window.location.reload(); // Простой способ перезагрузить данные
    } catch (error) {
      console.error('Ошибка при удалении калькуляции:', error);
      showToast('Ошибка при удалении калькуляции', 'error');
    } finally {
      setDeletingCalc(null); // Сбрасываем состояние загрузки
    }
  };

  const decodedGroupName = selectedGroup?.name || decodeURIComponent(groupSlug);

  return (
    <RoleGuard
      allowedRoles={[UserRole.ADMIN, UserRole.PTO]}
      redirectTo="/dashboard"
      pagePath={`/dashboard/calc/${groupSlug}`}
    >
      <div className="h-[calc(100vh-64px)] bg-white overflow-y-auto">
      <div className="p-6">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => router.back()}
              className="p-3 bg-gray-100 hover:bg-[#8eba1e] rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600 hover:text-white" />
            </button>
            <div className="p-3 bg-gray-100 rounded-xl">
              <Calculator className="w-6 h-6 text-[#8eba1e]" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Калькуляции</h1>
              <p className="text-gray-600">Группа: {decodedGroupName}</p>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="bg-gray-50 px-4 py-2 rounded-lg">
                <span className="text-sm text-gray-600">Всего расчетов: </span>
                <span className="font-semibold text-[#8eba1e]">{calculations.length}</span>
              </div>
            </div>
            <button
              onClick={handleCreateNew}
              className="flex items-center gap-2 bg-[#8eba1e] hover:bg-[#7aa31a] text-white px-6 py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Plus size={18} />
              Создать калькуляцию
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8eba1e] mx-auto mb-4"></div>
              <p className="text-gray-600">Загрузка расчетов...</p>
            </div>
          </div>
        ) : calculations.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Calculator className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Расчеты не найдены</h3>
            <p className="text-gray-600 mb-6">Создайте первый расчет для начала работы</p>
            <button
              onClick={handleCreateNew}
              className="inline-flex items-center gap-2 bg-[#8eba1e] hover:bg-[#7aa31a] text-white px-6 py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Plus size={18} />
              Создать расчет
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {calculations.map((calc) => (
              <div
                key={calc.id}
                className="group relative bg-white border border-gray-200 hover:border-[#8eba1e]/30 shadow-lg hover:shadow-xl rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02]"
              >
                {/* Декоративный акцент сверху */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-[#8eba1e] opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-t-2xl"></div>
                
                {/* Кнопка удаления */}
                <button
                  onClick={(e) => handleDelete(calc.slug, e)}
                  disabled={deletingCalc === calc.slug}
                  className={`absolute top-3 right-3 p-2 rounded-lg transition-all duration-200 ${
                    deletingCalc === calc.slug
                      ? 'text-gray-400 cursor-not-allowed bg-gray-100'
                      : 'text-red-500 hover:text-red-700 hover:bg-red-100'
                  }`}
                  title={deletingCalc === calc.slug ? 'Удаление...' : 'Удалить расчет'}
                >
                  {deletingCalc === calc.slug ? (
                    <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
                
                {/* Основной контент */}
                <div
                  onClick={() => handleOpenCalc(calc.slug)}
                  className="cursor-pointer"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-gray-100 group-hover:bg-[#8eba1e] rounded-lg transition-all duration-300">
                      <FileText className="w-5 h-5 text-[#8eba1e] group-hover:text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 group-hover:text-[#8eba1e] transition-colors pr-8">{calc.name}</h3>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Обновлено:</span> {calc.updatedAt?.split('T')[0]}
                    </p>
                    <p className="text-xs text-gray-500">Slug: {calc.slug}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Toast уведомления */}
        {toast && (
          <div
            className={`fixed bottom-4 right-4 px-6 py-3 rounded-xl shadow-xl z-50 ${
              toast.type === 'success' ? 'bg-[#8eba1e]' : 'bg-red-500'
            } text-white transition-all duration-300 transform hover:scale-105`}
          >
            <div className="flex items-center gap-2">
              {toast.type === 'success' ? (
                <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              ) : (
                <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
              <span className="font-medium">{toast.message}</span>
            </div>
          </div>
        )}
    </div>
    </div>
    </RoleGuard>
  );
}
