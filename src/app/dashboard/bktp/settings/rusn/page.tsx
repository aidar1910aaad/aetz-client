'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Save, Power, Settings2, Gauge } from 'lucide-react';
import { Category } from '@/api/categories';
import { getAllCategories } from '@/api/categories';
import { showToast } from '@/shared/modals/ToastProvider';

interface CategorySettings {
  id: number;
  name: string;
  isVisible: boolean;
}

export default function RusnSettingsPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<CategorySettings[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token') || '';
      const data = await getAllCategories(token);
      
      const settingsData = data.map(cat => ({
        id: cat.id,
        name: cat.name,
        isVisible: true
      }));
      
      setCategories(settingsData);
      setLoading(false);
    } catch (error: any) {
      showToast(error.message || 'Ошибка при загрузке категорий', 'error');
      setLoading(false);
    }
  };

  const handleToggleVisibility = (categoryId: number) => {
    setCategories(prev => 
      prev.map(cat => 
        cat.id === categoryId 
          ? { ...cat, isVisible: !cat.isVisible }
          : cat
      )
    );
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token') || '';
      const settings = categories.map(cat => ({
        categoryId: cat.id,
        isVisible: cat.isVisible
      }));
      
      // TODO: Добавить API для сохранения настроек
      await new Promise(resolve => setTimeout(resolve, 1000)); // Имитация запроса
      
      showToast('Настройки сохранены', 'success');
      setHasChanges(false);
    } catch (error: any) {
      showToast(error.message || 'Ошибка при сохранении настроек', 'error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3A55DF]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-white rounded-full transition-colors duration-200"
            >
              <ChevronLeft className="w-6 h-6 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Настройки РУСН</h1>
              <p className="text-sm text-gray-500 mt-1">Управление настройками РУСН</p>
            </div>
          </div>
          <button
            onClick={handleSave}
            disabled={!hasChanges}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
              hasChanges 
                ? 'bg-[#3A55DF] text-white hover:bg-[#2e46c5]' 
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            <Save className="w-5 h-5" />
            Сохранить
          </button>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Выключатель */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-red-50 rounded-lg">
                <Power className="w-6 h-6 text-red-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Выключатель</h2>
            </div>
            <div className="space-y-3">
              {categories.map(category => (
                <div 
                  key={category.id} 
                  className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                >
                  <span className="text-gray-700">{category.name}</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={category.isVisible}
                      onChange={() => handleToggleVisibility(category.id)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#3A55DF]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#3A55DF]"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* РЗА */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Settings2 className="w-6 h-6 text-blue-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">РЗА</h2>
            </div>
            <div className="space-y-3">
              {categories.map(category => (
                <div 
                  key={category.id} 
                  className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                >
                  <span className="text-gray-700">{category.name}</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={category.isVisible}
                      onChange={() => handleToggleVisibility(category.id)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#3A55DF]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#3A55DF]"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Счетчик */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-green-50 rounded-lg">
                <Gauge className="w-6 h-6 text-green-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Счетчик</h2>
            </div>
            <div className="space-y-3">
              {categories.map(category => (
                <div 
                  key={category.id} 
                  className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                >
                  <span className="text-gray-700">{category.name}</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={category.isVisible}
                      onChange={() => handleToggleVisibility(category.id)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#3A55DF]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#3A55DF]"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}