'use client';

import { useState } from 'react';
import { Pencil, User, Mail, Phone, MapPin, Calendar, Shield, Building } from 'lucide-react';
import { useUserStore } from '@/store/useUserStore';
import { updateMyProfile, UpdateProfileRequest } from '@/api/users';
import { showToast } from '@/shared/modals/ToastProvider';
import EditProfileModal from '@/shared/modals/profile/EditProfileModal';
import ChangePasswordModal from '@/shared/modals/profile/ChangePasswordModal';
import { getRoleDisplayName } from '@/types/user';

export default function ProfilePage() {
  const { user, setUser } = useUserStore();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);

  if (!user) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка профиля...</p>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleUpdateProfile = async (data: UpdateProfileRequest) => {
    try {
      const token = localStorage.getItem('token') || '';
      const updatedUser = await updateMyProfile(data, token);
      setUser(updatedUser);
      showToast('Профиль успешно обновлен!', 'success');
    } catch (error: any) {
      throw error;
    }
  };

  const handleChangePassword = async (newPassword: string) => {
    try {
      const token = localStorage.getItem('token') || '';
      const updatedUser = await updateMyProfile({ password: newPassword }, token);
      setUser(updatedUser);
      showToast('Пароль успешно изменен!', 'success');
    } catch (error: any) {
      showToast(error.message || 'Ошибка при изменении пароля', 'error');
      throw error;
    }
  };

  return (
    <div className="h-[calc(100vh-64px)] bg-white overflow-y-auto">
      <main className="p-6 space-y-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gray-100 rounded-xl">
              <User className="w-6 h-6 text-[#8eba1e]" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900">Мой профиль</h1>
          </div>
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-[#8eba1e] text-white rounded-xl hover:bg-[#7aa31a] transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <Pencil size={18} />
            Редактировать
          </button>
        </div>

        {/* Profile Header Card */}
        <div className="bg-[#8eba1e] p-8 rounded-3xl shadow-2xl text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative flex items-center gap-6">
            <div className="w-24 h-24 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <User size={48} />
            </div>
            <div className="flex-1">
              <h2 className="text-3xl font-bold mb-2">
                {user.lastName} {user.firstName}
              </h2>
              <p className="text-white/90 text-xl mb-1">{user.position}</p>
              <p className="text-white/90 text-lg">
                {user.city}, {user.country}
              </p>
            </div>
            <div className="text-right">
              <p className="text-white/90 text-sm mb-1">ID пользователя</p>
              <p className="text-2xl font-bold">#{user.id}</p>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Personal Information */}
          <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-200 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-gray-100 rounded-xl">
                <User className="w-6 h-6 text-[#8eba1e]" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Личная информация</h3>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <div className="p-2 bg-gray-200 rounded-lg">
                  <User className="w-5 h-5 text-[#8eba1e]" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">Полное имя</p>
                  <p className="font-semibold text-gray-900 text-lg">{user.lastName} {user.firstName}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <div className="p-2 bg-gray-200 rounded-lg">
                  <Mail className="w-5 h-5 text-[#8eba1e]" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">Email</p>
                  <p className="font-semibold text-gray-900 text-lg">{user.email}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <div className="p-2 bg-gray-200 rounded-lg">
                  <Phone className="w-5 h-5 text-[#8eba1e]" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">Телефон</p>
                  <p className="font-semibold text-gray-900 text-lg">{user.phone}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <div className="p-2 bg-gray-200 rounded-lg">
                  <Building className="w-5 h-5 text-[#8eba1e]" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">Должность</p>
                  <p className="font-semibold text-gray-900 text-lg">{user.position}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Account Information */}
          <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-200 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-gray-100 rounded-xl">
                <Shield className="w-6 h-6 text-[#8eba1e]" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Аккаунт</h3>
            </div>
            
            <div className="space-y-6">
              <div className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <p className="text-sm text-gray-600 font-medium mb-1">Имя пользователя</p>
                <p className="font-semibold text-gray-900 text-lg">{user.username}</p>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <p className="text-sm text-gray-600 font-medium mb-1">Роль</p>
                <p className="font-semibold text-gray-900 text-lg">{getRoleDisplayName(user.role)}</p>
              </div>
              
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <div className="p-2 bg-gray-200 rounded-lg">
                  <Calendar className="w-5 h-5 text-[#8eba1e]" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">Дата регистрации</p>
                  <p className="font-semibold text-gray-900 text-lg">
                    {user.createdAt ? formatDate(user.createdAt) : 'Не указано'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Location Information */}
          <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-200 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-gray-100 rounded-xl">
                <MapPin className="w-6 h-6 text-[#8eba1e]" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Местоположение</h3>
            </div>
            
            <div className="space-y-6">
              <div className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <p className="text-sm text-gray-600 font-medium mb-1">Страна</p>
                <p className="font-semibold text-gray-900 text-lg">{user.country}</p>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <p className="text-sm text-gray-600 font-medium mb-1">Город</p>
                <p className="font-semibold text-gray-900 text-lg">{user.city}</p>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <p className="text-sm text-gray-600 font-medium mb-1">Почтовый индекс</p>
                <p className="font-semibold text-gray-900 text-lg">{user.postalCode}</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-200 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-gray-100 rounded-xl">
                <Pencil className="w-6 h-6 text-[#8eba1e]" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Быстрые действия</h3>
            </div>
            
            <div className="space-y-4">
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="w-full flex items-center gap-4 p-4 text-left hover:bg-gray-50 rounded-xl transition-all duration-200 hover:scale-105 group"
              >
                <div className="p-2 bg-gray-100 group-hover:bg-[#8eba1e] rounded-lg transition-colors">
                  <Pencil className="w-5 h-5 text-[#8eba1e] group-hover:text-white" />
                </div>
                <span className="font-medium text-gray-700 group-hover:text-[#8eba1e]">Редактировать профиль</span>
              </button>
              
              <button
                onClick={() => setIsChangePasswordModalOpen(true)}
                className="w-full flex items-center gap-4 p-4 text-left hover:bg-gray-50 rounded-xl transition-all duration-200 hover:scale-105 group"
              >
                <div className="p-2 bg-gray-100 group-hover:bg-[#8eba1e] rounded-lg transition-colors">
                  <Shield className="w-5 h-5 text-[#8eba1e] group-hover:text-white" />
                </div>
                <span className="font-medium text-gray-700 group-hover:text-[#8eba1e]">Изменить пароль</span>
              </button>
              
              <button className="w-full flex items-center gap-4 p-4 text-left hover:bg-gray-50 rounded-xl transition-all duration-200 hover:scale-105 group opacity-50 cursor-not-allowed">
                <div className="p-2 bg-gray-100 rounded-lg transition-colors">
                  <Mail className="w-5 h-5 text-gray-400" />
                </div>
                <span className="font-medium text-gray-500">Настройки уведомлений (скоро)</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <EditProfileModal
          user={{
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            email: user.email || '',
            phone: user.phone || '',
            position: user.position || '',
            country: user.country || '',
            city: user.city || '',
            postalCode: user.postalCode || '',
          }}
          onClose={() => setIsEditModalOpen(false)}
          onUpdate={handleUpdateProfile}
        />
      )}

      {/* Change Password Modal */}
      {isChangePasswordModalOpen && (
        <ChangePasswordModal
          onClose={() => setIsChangePasswordModalOpen(false)}
          onChangePassword={handleChangePassword}
        />
      )}
    </div>
  );
}
