'use client';

import { useState } from 'react';
import { User, UpdateUserRequest } from '@/api/users';
import { showToast } from '@/shared/modals/ToastProvider';

interface Props {
  user: User;
  onClose: () => void;
  onUpdate: (id: number, data: UpdateUserRequest) => Promise<void>;
}

export default function EditUserModal({ user, onClose, onUpdate }: Props) {
  const [form, setForm] = useState<UpdateUserRequest>({
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,
    position: user.position,
    country: user.country,
    city: user.city,
    postalCode: user.postalCode,
    role: user.role,
  });

  const handleSubmit = async () => {
    if (!form.firstName || !form.lastName || !form.email) {
      showToast('Заполните обязательные поля', 'error');
      return;
    }

    await onUpdate(user.id, form);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Редактировать пользователя</h2>

        {[
          'firstName',
          'lastName',
          'email',
          'phone',
          'position',
          'country',
          'city',
          'postalCode',
        ].map((field) => (
          <input
            key={field}
            type="text"
            placeholder={field}
            className="border p-2 rounded w-full mb-3 text-sm"
            value={(form as any)[field]}
            onChange={(e) => setForm({ ...form, [field]: e.target.value })}
          />
        ))}

        <select
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
          className="border p-2 rounded w-full mb-4 text-sm"
        >
          <option value="pto">ПТО</option>
          <option value="admin">Админ</option>
        </select>

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded bg-gray-200 hover:bg-gray-300"
          >
            Отмена
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 text-sm rounded bg-[#3A55DF] text-white hover:bg-blue-700"
          >
            Сохранить
          </button>
        </div>
      </div>
    </div>
  );
}
