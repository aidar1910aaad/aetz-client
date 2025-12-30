'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { User, Mail, Phone, MapPin, Calendar, Shield, Building, ArrowLeft, Pencil, KeyRound, FileText, ExternalLink } from 'lucide-react';
import { getUserById, User as UserType, updateUser, UpdateUserRequest } from '@/api/users';
import { getAllApplications } from '@/api/requests';
import { getRoleDisplayName } from '@/types/user';
import { useUserStore } from '@/store/useUserStore';
import { showToast } from '@/shared/modals/ToastProvider';
import EditUserModal from '@/shared/modals/users/EditUserModal';
import ChangeUserPasswordModal from '@/shared/modals/users/ChangeUserPasswordModal';
import PageLoader from '@/shared/loader/PageLoader';

export default function UserProfilePage() {
  const router = useRouter();
  const params = useParams();
  const userId = parseInt(params.id as string);
  const { user: currentUser } = useUserStore();
  
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [userRequests, setUserRequests] = useState<any[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(true);

  const isAdmin = currentUser?.role?.toLowerCase() === 'admin';
  const isOwnProfile = currentUser?.id === userId;

  useEffect(() => {
    const fetchUser = async () => {
      if (!userId || isNaN(userId)) {
        router.push('/dashboard/users');
        return;
      }

      setLoading(true);
      try {
        const token = localStorage.getItem('token') || '';
        const userData = await getUserById(userId, token);
        setUser(userData);
      } catch (error: any) {
        showToast(error.message || 'Ошибка при загрузке профиля пользователя', 'error');
        router.push('/dashboard/users');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId, router]);

  useEffect(() => {
    const fetchUserRequests = async () => {
      if (!userId || isNaN(userId)) return;

      setRequestsLoading(true);
      try {
        const token = localStorage.getItem('token') || '';
        const allRequests = await getAllApplications(token);
        
        // Фильтруем заявки по ID пользователя и берем последние 5
        const filtered = allRequests
          .filter((req: any) => req.user?.id === userId)
          .sort((a: any, b: any) => {
            const dateA = new Date(a.createdAt || a.date).getTime();
            const dateB = new Date(b.createdAt || b.date).getTime();
            return dateB - dateA;
          })
          .slice(0, 5);
        
        setUserRequests(filtered);
      } catch (error: any) {
        console.error('Ошибка при загрузке заявок пользователя:', error);
      } finally {
        setRequestsLoading(false);
      }
    };

    if (!loading && user) {
      fetchUserRequests();
    }
  }, [userId, loading, user]);

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Не указано';
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatShortDate = (dateString: string) => {
    if (!dateString) return 'Не указано';
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    if (isNaN(amount) || amount === null || amount === undefined) {
      return '0 ₸';
    }
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'KZT',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleUpdateUser = async (id: number, data: UpdateUserRequest) => {
    try {
      const token = localStorage.getItem('token') || '';
      await updateUser(id, data, token);
      const updatedUser = await getUserById(id, token);
      setUser(updatedUser);
      showToast('Профиль пользователя успешно обновлен!', 'success');
      setIsEditModalOpen(false);
    } catch (error: any) {
      showToast(error.message || 'Ошибка при обновлении профиля', 'error');
      throw error;
    }
  };

  const handleChangeUserPassword = async (userId: number, newPassword: string) => {
    try {
      const token = localStorage.getItem('token') || '';
      await updateUser(userId, { password: newPassword }, token);
      showToast('Пароль пользователя успешно изменен!', 'success');
      setIsChangePasswordModalOpen(false);
    } catch (error: any) {
      showToast(error.message || 'Ошибка при изменении пароля', 'error');
      throw error;
    }
  };

  if (loading) return <PageLoader />;

  if (!user) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Пользователь не найден</p>
          <button
            onClick={() => router.push('/dashboard/users')}
            className="mt-4 text-[#8eba1e] hover:text-[#7aa31a]"
          >
            Вернуться к списку пользователей
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-64px)] bg-white overflow-y-auto">
      <main className="p-6 space-y-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/dashboard/users')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="p-3 bg-gray-100 rounded-xl">
              <User className="w-6 h-6 text-[#8eba1e]" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900">Профиль пользователя</h1>
          </div>
          {isAdmin && (
            <div className="flex gap-3">
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="flex items-center gap-2 px-6 py-3 bg-[#8eba1e] text-white rounded-xl hover:bg-[#7aa31a] transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <Pencil size={18} />
                Редактировать
              </button>
              <button
                onClick={() => setIsChangePasswordModalOpen(true)}
                className="flex items-center gap-2 px-6 py-3 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                title="Изменить пароль"
              >
                <KeyRound size={18} />
                Изменить пароль
              </button>
            </div>
          )}
        </div>

        {/* Profile Header Card */}
        <div className="bg-[#8eba1e] p-8 rounded-3xl shadow-2xl text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative flex items-center gap-6">
            <div className="w-24 h-24 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <span className="text-white font-bold text-4xl">
                {user.firstName[0]}{user.lastName[0]}
              </span>
            </div>
            <div className="flex-1">
              <h2 className="text-3xl font-bold mb-2">
                {user.lastName} {user.firstName}
              </h2>
              <p className="text-white/90 text-xl mb-1">{user.position || 'Не указано'}</p>
              <p className="text-white/90 text-lg">
                {user.city || ''}, {user.country || ''}
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
                  <p className="font-semibold text-gray-900 text-lg">{user.position || 'Не указано'}</p>
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
                <p className="font-semibold text-gray-900 text-lg">{user.country || 'Не указано'}</p>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <p className="text-sm text-gray-600 font-medium mb-1">Город</p>
                <p className="font-semibold text-gray-900 text-lg">{user.city || 'Не указано'}</p>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <p className="text-sm text-gray-600 font-medium mb-1">Почтовый индекс</p>
                <p className="font-semibold text-gray-900 text-lg">{user.postalCode || 'Не указано'}</p>
              </div>
            </div>
          </div>

          {/* Последние созданные заявки */}
          <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-200 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gray-100 rounded-xl">
                  <FileText className="w-6 h-6 text-[#8eba1e]" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Последние созданные заявки</h3>
              </div>
              <Link
                href={`/dashboard/requests?userId=${userId}`}
                className="flex items-center gap-2 text-[#8eba1e] hover:text-[#7aa31a] font-medium transition-colors text-sm"
              >
                Все заявки пользователя
                <ExternalLink className="w-4 h-4" />
              </Link>
            </div>
            
            {requestsLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-16 bg-gray-100 rounded-xl"></div>
                  </div>
                ))}
              </div>
            ) : userRequests.length > 0 ? (
              <div className="space-y-2">
                {userRequests.map((request: any) => (
                  <Link
                    key={request.id}
                    href={`/dashboard/requests/${request.id}`}
                    className="block bg-gray-50 rounded-xl p-3 hover:bg-gray-100 border border-gray-200 hover:border-[#8eba1e]/30 transition-all duration-200 hover:shadow-md group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-8 h-8 bg-[#8eba1e]/10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-[#8eba1e]/20 transition-colors">
                            <FileText className="w-4 h-4 text-[#8eba1e]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-gray-900 text-sm truncate">
                                {request.bidNumber || `Заявка #${request.id}`}
                              </h4>
                              {request.type && (
                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium flex-shrink-0">
                                  {request.type}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-3 text-xs text-gray-600">
                              {request.client && (
                                <span className="truncate">{request.client}</span>
                              )}
                              {request.taskNumber && (
                                <span className="flex-shrink-0">#{request.taskNumber}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1 ml-3 flex-shrink-0">
                        {request.totalAmount !== undefined && request.totalAmount !== null && (
                          <p className="font-bold text-base text-gray-900">
                            {formatCurrency(request.totalAmount)}
                          </p>
                        )}
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Calendar className="w-3 h-3" />
                          <span>
                            {formatShortDate(request.createdAt || request.date || request.updatedAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium mb-1 text-sm">Нет созданных заявок</p>
                <p className="text-xs text-gray-400">
                  У этого пользователя пока нет созданных заявок
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Edit User Modal */}
      {isEditModalOpen && user && (
        <EditUserModal
          user={user}
          onClose={() => setIsEditModalOpen(false)}
          onUpdate={handleUpdateUser}
        />
      )}

      {/* Change Password Modal */}
      {isChangePasswordModalOpen && user && (
        <ChangeUserPasswordModal
          user={{
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            username: user.username,
          }}
          onClose={() => setIsChangePasswordModalOpen(false)}
          onChangePassword={handleChangeUserPassword}
        />
      )}
    </div>
  );
}

