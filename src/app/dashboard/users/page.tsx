'use client';

import { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import PageLoader from '@/shared/loader/PageLoader';
import { User } from '@/api/users';
import { useUsers } from '@/hooks/useUsers';
import CreateUserModal from '@/shared/modals/users/CreateUserModal';
import EditUserModal from '@/shared/modals/users/EditUserModal';

export default function AllUsersPage() {
  const { users, loading, handleCreate, handleUpdate, handleDelete } = useUsers();

  const [createOpen, setCreateOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);

  if (loading) return <PageLoader />;

  return (
    <div className="p-6 h-[calc(100vh-124px)] flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Пользователи</h1>
        <button
          onClick={() => setCreateOpen(true)}
          className="bg-[#3A55DF] text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          Создать пользователя
        </button>
      </div>

      <div className="flex-1 overflow-y-auto border border-gray-200 rounded">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 text-gray-600">
            <tr>
              <th className="text-left px-6 py-3">ФИО</th>
              <th className="text-left px-6 py-3">Email</th>
              <th className="text-left px-6 py-3">Телефон</th>
              <th className="text-left px-6 py-3">Роль</th>
              <th className="text-left px-6 py-3">Действия</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-gray-200">
                <td className="px-6 py-3">
                  {user.lastName} {user.firstName}
                </td>
                <td className="px-6 py-3">{user.email}</td>
                <td className="px-6 py-3">{user.phone}</td>
                <td className="px-6 py-3 capitalize">{user.role}</td>
                <td className="px-6 py-3">
                  <div className="flex gap-4">
                    <button
                      onClick={() => setEditUser(user)}
                      className="text-blue-600 hover:text-blue-800 transition"
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="text-red-600 hover:text-red-800 transition"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Модалки */}
      {createOpen && (
        <CreateUserModal onClose={() => setCreateOpen(false)} onCreate={handleCreate} />
      )}

      {editUser && (
        <EditUserModal user={editUser} onClose={() => setEditUser(null)} onUpdate={handleUpdate} />
      )}
    </div>
  );
}
