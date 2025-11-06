'use client';

import { useState, useMemo } from 'react';
import { Pencil, Trash2, UserPlus, Users, Mail, Phone, Shield, Search, X, KeyRound } from 'lucide-react';
import PageLoader from '@/shared/loader/PageLoader';
import Pagination from '@/shared/components/Pagination';
import { User, updateUser, UpdateUserRequest } from '@/api/users';
import { useUsers } from '@/hooks/useUsers';
import CreateUserModal from '@/shared/modals/users/CreateUserModal';
import EditUserModal from '@/shared/modals/users/EditUserModal';
import ChangeUserPasswordModal from '@/shared/modals/users/ChangeUserPasswordModal';
import { getRoleDisplayName } from '@/types/user';
import { useUserStore } from '@/store/useUserStore';
import { showToast } from '@/shared/modals/ToastProvider';

export default function AllUsersPage() {
  const { users, loading, handleCreate, handleUpdate, handleDelete } = useUsers();
  const { user: currentUser } = useUserStore();

  const [createOpen, setCreateOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [changePasswordUser, setChangePasswordUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  
  const itemsPerPage = 10;
  
  // Проверка, является ли текущий пользователь администратором
  const isAdmin = currentUser?.role?.toLowerCase() === 'admin';
  
  // Filter users based on search query
  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) {
      return users;
    }
    
    const query = searchQuery.toLowerCase().trim();
    return users.filter(user => 
      user.firstName.toLowerCase().includes(query) ||
      user.lastName.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query)
    );
  }, [users, searchQuery]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredUsers.slice(startIndex, endIndex);
  }, [filteredUsers, currentPage, itemsPerPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1); // Reset to first page when searching
  };

  const clearSearch = () => {
    setSearchQuery('');
    setCurrentPage(1);
  };

  const handleChangeUserPassword = async (userId: number, newPassword: string) => {
    try {
      const token = localStorage.getItem('token') || '';
      await updateUser(userId, { password: newPassword }, token);
      showToast('Пароль пользователя успешно изменен!', 'success');
    } catch (error: any) {
      showToast(error.message || 'Ошибка при изменении пароля', 'error');
      throw error;
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="h-[calc(100vh-64px)] bg-white overflow-y-auto">
      <div className="p-6">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-gray-100 rounded-xl">
              <Users className="w-6 h-6 text-[#8eba1e]" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Пользователи</h1>
              <p className="text-gray-600">Управление пользователями системы</p>
            </div>
          </div>
          
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="bg-gray-50 px-4 py-2 rounded-lg">
                <span className="text-sm text-gray-600">Всего пользователей: </span>
                <span className="font-semibold text-[#8eba1e]">{filteredUsers.length}</span>
                {searchQuery && (
                  <span className="text-sm text-gray-500 ml-2">
                    (из {users.length})
                  </span>
                )}
              </div>
              
              {/* Search Input */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Поиск по имени, фамилии или email..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full sm:w-80 pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8eba1e] focus:border-[#8eba1e] transition-all duration-200"
                />
                {searchQuery && (
                  <button
                    onClick={clearSearch}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
            
            {isAdmin && (
              <button
                onClick={() => setCreateOpen(true)}
                className="flex items-center gap-2 bg-[#8eba1e] hover:bg-[#7aa31a] text-white px-6 py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <UserPlus size={18} />
                Создать пользователя
              </button>
            )}
          </div>
        </div>

        {/* Users Grid */}
        {users.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Пользователи не найдены</h3>
            <p className="text-gray-600 mb-6">Создайте первого пользователя для начала работы</p>
            {isAdmin && (
              <button
                onClick={() => setCreateOpen(true)}
                className="inline-flex items-center gap-2 bg-[#8eba1e] hover:bg-[#7aa31a] text-white px-6 py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <UserPlus size={18} />
                Создать пользователя
              </button>
            )}
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Поиск не дал результатов</h3>
            <p className="text-gray-600 mb-6">Попробуйте изменить поисковый запрос</p>
            <button
              onClick={clearSearch}
              className="inline-flex items-center gap-2 bg-[#8eba1e] hover:bg-[#7aa31a] text-white px-6 py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <X size={18} />
              Очистить поиск
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {paginatedUsers.map((user) => (
            <div key={user.id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-[#8eba1e]/30 group">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  {/* User Info */}
                  <div className="flex items-center gap-6">
                    {/* Avatar */}
                    <div className="w-16 h-16 bg-[#8eba1e] rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-xl">
                        {user.firstName[0]}{user.lastName[0]}
                      </span>
                    </div>
                    
                    {/* Name and Role */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-xl font-semibold text-gray-900">
                          {user.lastName} {user.firstName}
                        </h3>
                        {user.role?.toLowerCase() === 'admin' && (
                          <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded">
                            Admin
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-[#8eba1e]" />
                        <span className="text-sm text-gray-600">{getRoleDisplayName(user.role)}</span>
                      </div>
                    </div>
                    
                    {/* Contact Info */}
                    <div className="flex items-center gap-8">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          <Mail className="w-4 h-4 text-[#8eba1e]" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Email</p>
                          <p className="font-medium text-gray-900">{user.email}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          <Phone className="w-4 h-4 text-[#8eba1e]" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Телефон</p>
                          <p className="font-medium text-gray-900">{user.phone}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Actions - только для админа */}
                  {isAdmin && (
                    <div className="flex gap-3">
                      <button
                        onClick={() => setEditUser(user)}
                        className="flex items-center gap-2 bg-[#8eba1e] hover:bg-[#7aa31a] text-white px-4 py-2 rounded-lg transition-all duration-200 hover:shadow-md"
                      >
                        <Pencil size={16} />
                        Редактировать
                      </button>
                      <button
                        onClick={() => setChangePasswordUser(user)}
                        className="flex items-center justify-center p-2 bg-amber-100 hover:bg-amber-200 text-amber-600 hover:text-amber-700 rounded-lg transition-all duration-200"
                        title="Изменить пароль"
                      >
                        <KeyRound size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="flex items-center justify-center p-2 bg-red-100 hover:bg-red-200 text-red-600 hover:text-red-700 rounded-lg transition-all duration-200"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                  totalItems={filteredUsers.length}
                  itemsPerPage={itemsPerPage}
                />
              </div>
            )}
          </>
        )}

        {/* Модалки */}
        {createOpen && (
          <CreateUserModal onClose={() => setCreateOpen(false)} onCreate={handleCreate} />
        )}

        {editUser && (
          <EditUserModal user={editUser} onClose={() => setEditUser(null)} onUpdate={handleUpdate} />
        )}

        {changePasswordUser && (
          <ChangeUserPasswordModal
            user={{
              id: changePasswordUser.id,
              firstName: changePasswordUser.firstName,
              lastName: changePasswordUser.lastName,
              username: changePasswordUser.username,
            }}
            onClose={() => setChangePasswordUser(null)}
            onChangePassword={handleChangeUserPassword}
          />
        )}
      </div>
    </div>
  );
}
