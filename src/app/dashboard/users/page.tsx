'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Pencil, Trash2, UserPlus, Search, X, KeyRound } from 'lucide-react';
import PageLoader from '@/shared/loader/PageLoader';
import Pagination from '@/shared/components/Pagination';
import { User, updateUser } from '@/api/users';
import { useUsers } from '@/hooks/useUsers';
import CreateUserModal from '@/shared/modals/users/CreateUserModal';
import EditUserModal from '@/shared/modals/users/EditUserModal';
import ChangeUserPasswordModal from '@/shared/modals/users/ChangeUserPasswordModal';
import { getRoleDisplayName } from '@/types/user';
import { useUserStore } from '@/store/useUserStore';
import { showToast } from '@/shared/modals/ToastProvider';

function getInitials(firstName: string, lastName: string) {
  const first = firstName?.trim()?.[0]?.toUpperCase() ?? '';
  const last = lastName?.trim()?.[0]?.toUpperCase() ?? '';
  return first + last || '?';
}

function getRoleBadgeClass(role: string | undefined | null) {
  const normalized = role?.toLowerCase().trim();
  if (normalized === 'admin') return 'bg-red-50 text-red-700 ring-red-200/60';
  if (normalized === 'manager') return 'bg-amber-50 text-amber-800 ring-amber-200/60';
  if (normalized === 'pto') return 'bg-[#8eba1e]/10 text-[#6b8f16] ring-[#8eba1e]/25';
  return 'bg-gray-50 text-gray-600 ring-gray-200';
}

export default function AllUsersPage() {
  const router = useRouter();
  const { users, loading, handleCreate, handleUpdate, handleDelete } = useUsers();
  const { user: currentUser } = useUserStore();

  const [createOpen, setCreateOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [changePasswordUser, setChangePasswordUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  const itemsPerPage = 10;
  const isAdmin = currentUser?.role?.toLowerCase() === 'admin';

  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users;

    const query = searchQuery.toLowerCase().trim();
    return users.filter(
      (user) =>
        user.firstName.toLowerCase().includes(query) ||
        user.lastName.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query)
    );
  }, [users, searchQuery]);

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredUsers.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredUsers, currentPage, itemsPerPage]);

  const roleCounts = useMemo(() => {
    return filteredUsers.reduce(
      (acc, user) => {
        const role = user.role?.toLowerCase().trim() || 'unknown';
        acc[role] = (acc[role] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );
  }, [filteredUsers]);

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setCurrentPage(1);
  };

  const handleChangeUserPassword = async (userId: number, newPassword: string) => {
    try {
      const token = localStorage.getItem('token') || '';
      await updateUser(userId, { password: newPassword }, token);
      showToast('Пароль пользователя успешно изменён', 'success');
    } catch (error: any) {
      showToast(error.message || 'Ошибка при изменении пароля', 'error');
      throw error;
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="h-[calc(100vh-64px)] overflow-y-auto bg-gray-50">
      <div className="border-b border-[#7aa31a]/30 bg-gradient-to-r from-[#7aa31a] to-[#8eba1e] px-6 py-5">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-white">Пользователи</h1>
            <p className="mt-1 text-sm text-white/85">Управление учётными записями и ролями доступа</p>
          </div>
          {isAdmin && (
            <button
              type="button"
              onClick={() => setCreateOpen(true)}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-[#7aa31a] transition-colors hover:bg-white/90"
            >
              <UserPlus size={16} />
              Создать пользователя
            </button>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        {/* Toolbar */}
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-lg border border-[#8eba1e]/20 bg-white px-4 py-2">
              <span className="text-sm text-gray-500">Всего: </span>
              <span className="text-sm font-semibold text-[#8eba1e]">{filteredUsers.length}</span>
              {searchQuery && (
                <span className="ml-1 text-sm text-gray-400">из {users.length}</span>
              )}
            </div>
            {roleCounts.admin > 0 && (
              <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700 ring-1 ring-red-200/60">
                Админ: {roleCounts.admin}
              </span>
            )}
            {roleCounts.pto > 0 && (
              <span className="rounded-full bg-[#8eba1e]/10 px-2.5 py-1 text-xs font-medium text-[#6b8f16] ring-1 ring-[#8eba1e]/25">
                ПТО: {roleCounts.pto}
              </span>
            )}
            {roleCounts.manager > 0 && (
              <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-800 ring-1 ring-amber-200/60">
                Менеджеры: {roleCounts.manager}
              </span>
            )}
          </div>

          <div className="relative w-full sm:max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Поиск по имени или email..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-10 text-sm focus:border-[#8eba1e] focus:outline-none focus:ring-1 focus:ring-[#8eba1e]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        {users.length === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-white px-6 py-16 text-center">
            <h3 className="text-base font-semibold text-gray-900">Пользователи не найдены</h3>
            <p className="mt-1 text-sm text-gray-500">Создайте первого пользователя для начала работы</p>
            {isAdmin && (
              <button
                type="button"
                onClick={() => setCreateOpen(true)}
                className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#8eba1e] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#7aa31a]"
              >
                <UserPlus size={16} />
                Создать пользователя
              </button>
            )}
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-white px-6 py-16 text-center">
            <h3 className="text-base font-semibold text-gray-900">Ничего не найдено</h3>
            <p className="mt-1 text-sm text-gray-500">Измените поисковый запрос</p>
            <button
              type="button"
              onClick={clearSearch}
              className="mt-5 text-sm font-medium text-[#8eba1e] hover:text-[#7aa31a]"
            >
              Сбросить поиск
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-hidden rounded-lg border border-[#8eba1e]/20 bg-white">
              {/* Desktop table */}
              <div className="hidden md:block">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/80 text-xs font-medium uppercase tracking-wide text-gray-500">
                      <th className="px-5 py-3">Пользователь</th>
                      <th className="px-5 py-3">Роль</th>
                      <th className="px-5 py-3">Email</th>
                      <th className="px-5 py-3">Телефон</th>
                      {isAdmin && <th className="px-5 py-3 text-right">Действия</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {paginatedUsers.map((user) => (
                      <tr
                        key={user.id}
                        onClick={() => router.push(`/dashboard/users/${user.id}`)}
                        className="cursor-pointer transition-colors hover:bg-[#8eba1e]/5"
                      >
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#8eba1e]/15 text-xs font-semibold text-[#6b8f16]">
                              {getInitials(user.firstName, user.lastName)}
                            </div>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium text-gray-900">
                                {user.lastName} {user.firstName}
                              </p>
                              {user.username && (
                                <p className="truncate text-xs text-gray-400">@{user.username}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${getRoleBadgeClass(user.role)}`}
                          >
                            {getRoleDisplayName(user.role)}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <p className="max-w-[220px] truncate text-sm text-gray-700" title={user.email}>
                            {user.email}
                          </p>
                        </td>
                        <td className="px-5 py-3.5">
                          <p className="text-sm tabular-nums text-gray-700">{user.phone || '—'}</p>
                        </td>
                        {isAdmin && (
                          <td className="px-5 py-3.5" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-1">
                              <button
                                type="button"
                                onClick={() => setEditUser(user)}
                                className="rounded-md px-2.5 py-1.5 text-xs font-medium text-[#8eba1e] transition-colors hover:bg-[#8eba1e]/10"
                              >
                                Изменить
                              </button>
                              <button
                                type="button"
                                onClick={() => setChangePasswordUser(user)}
                                className="rounded-md p-1.5 text-amber-600 transition-colors hover:bg-amber-50"
                                title="Сменить пароль"
                              >
                                <KeyRound size={15} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDelete(user.id)}
                                className="rounded-md p-1.5 text-red-500 transition-colors hover:bg-red-50"
                                title="Удалить"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile list */}
              <ul className="divide-y divide-gray-100 md:hidden">
                {paginatedUsers.map((user) => (
                  <li key={user.id}>
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => router.push(`/dashboard/users/${user.id}`)}
                      onKeyDown={(e) => e.key === 'Enter' && router.push(`/dashboard/users/${user.id}`)}
                      className="px-4 py-4 transition-colors hover:bg-[#8eba1e]/5"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#8eba1e]/15 text-sm font-semibold text-[#6b8f16]">
                          {getInitials(user.firstName, user.lastName)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-medium text-gray-900">
                              {user.lastName} {user.firstName}
                            </p>
                            <span
                              className={`rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ${getRoleBadgeClass(user.role)}`}
                            >
                              {getRoleDisplayName(user.role)}
                            </span>
                          </div>
                          <p className="mt-1 truncate text-sm text-gray-600">{user.email}</p>
                          {user.phone && (
                            <p className="mt-0.5 text-sm tabular-nums text-gray-500">{user.phone}</p>
                          )}
                        </div>
                      </div>
                      {isAdmin && (
                        <div
                          className="mt-3 flex gap-2 border-t border-gray-100 pt-3"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={() => setEditUser(user)}
                            className="flex-1 rounded-md border border-gray-200 py-1.5 text-xs font-medium text-gray-700 hover:border-[#8eba1e] hover:text-[#8eba1e]"
                          >
                            Изменить
                          </button>
                          <button
                            type="button"
                            onClick={() => setChangePasswordUser(user)}
                            className="rounded-md border border-gray-200 px-3 py-1.5 text-amber-600 hover:bg-amber-50"
                            title="Сменить пароль"
                          >
                            <KeyRound size={15} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(user.id)}
                            className="rounded-md border border-gray-200 px-3 py-1.5 text-red-500 hover:bg-red-50"
                            title="Удалить"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {totalPages > 1 && (
              <div className="mt-5">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  totalItems={filteredUsers.length}
                  itemsPerPage={itemsPerPage}
                  itemName="пользователей"
                />
              </div>
            )}
          </>
        )}
      </div>

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
  );
}
