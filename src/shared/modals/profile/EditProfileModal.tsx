'use client';

import { useState } from 'react';
import { UpdateProfileRequest } from '@/api/users';
import { showToast } from '@/shared/modals/ToastProvider';
import { X, User, Mail, Phone, Building, MapPin } from 'lucide-react';

interface Props {
  user: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    position: string;
    country: string;
    city: string;
    postalCode: string;
  };
  onClose: () => void;
  onUpdate: (data: UpdateProfileRequest) => Promise<void>;
}

export default function EditProfileModal({ user, onClose, onUpdate }: Props) {
  const [form, setForm] = useState<UpdateProfileRequest>({
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,
    position: user.position,
    country: user.country,
    city: user.city,
    postalCode: user.postalCode,
  });

  const [loading, setLoading] = useState(false);

  // Проверка, изменились ли данные
  const hasChanges = 
    (form.firstName || '') !== (user.firstName || '') ||
    (form.lastName || '') !== (user.lastName || '') ||
    (form.email || '') !== (user.email || '') ||
    (form.phone || '') !== (user.phone || '') ||
    (form.position || '') !== (user.position || '') ||
    (form.country || '') !== (user.country || '') ||
    (form.city || '') !== (user.city || '') ||
    (form.postalCode || '') !== (user.postalCode || '');

  const handleSubmit = async () => {
    if (!form.firstName || !form.lastName || !form.email) {
      showToast('Заполните обязательные поля', 'error');
      return;
    }

    setLoading(true);
    try {
      await onUpdate(form);
      onClose();
    } catch (error: any) {
      showToast(error.message || 'Ошибка при обновлении профиля', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Редактировать профиль</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Personal Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-[#8eba1e]" />
              Личная информация
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Имя <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Введите имя"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8eba1e] focus:border-[#8eba1e] transition-all"
                  value={form.firstName || ''}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Фамилия <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Введите фамилию"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8eba1e] focus:border-[#8eba1e] transition-all"
                  value={form.lastName || ''}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Mail className="w-5 h-5 text-[#8eba1e]" />
              Контактная информация
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  placeholder="example@email.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8eba1e] focus:border-[#8eba1e] transition-all"
                  value={form.email || ''}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Телефон
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="tel"
                    placeholder="+7 (700) 123-45-67"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8eba1e] focus:border-[#8eba1e] transition-all"
                    value={form.phone || ''}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Work Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Building className="w-5 h-5 text-[#8eba1e]" />
              Рабочая информация
            </h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Должность
              </label>
              <input
                type="text"
                placeholder="Введите должность"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8eba1e] focus:border-[#8eba1e] transition-all"
                value={form.position || ''}
                onChange={(e) => setForm({ ...form, position: e.target.value })}
              />
            </div>
          </div>

          {/* Location Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#8eba1e]" />
              Местоположение
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Страна
                </label>
                <input
                  type="text"
                  placeholder="Введите страну"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8eba1e] focus:border-[#8eba1e] transition-all"
                  value={form.country || ''}
                  onChange={(e) => setForm({ ...form, country: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Город
                </label>
                <input
                  type="text"
                  placeholder="Введите город"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8eba1e] focus:border-[#8eba1e] transition-all"
                  value={form.city || ''}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Почтовый индекс
                </label>
                <input
                  type="text"
                  placeholder="010000"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8eba1e] focus:border-[#8eba1e] transition-all"
                  value={form.postalCode || ''}
                  onChange={(e) => setForm({ ...form, postalCode: e.target.value })}
                />
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4">
          {!hasChanges && !loading && (
            <p className="text-sm text-gray-500 mb-3 text-center">
              Внесите изменения для активации кнопки сохранения
            </p>
          )}
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all"
              disabled={loading}
            >
              Отмена
            </button>
            <button
              onClick={handleSubmit}
              className="px-6 py-2 bg-[#8eba1e] text-white rounded-lg hover:bg-[#7aa31a] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              disabled={!hasChanges || loading}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Сохранение...
                </>
              ) : (
                'Сохранить изменения'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

