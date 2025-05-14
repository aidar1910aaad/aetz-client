'use client';

import { useState } from 'react';
import { CreateUserRequest } from '@/api/users';
import { showToast } from '@/shared/modals/ToastProvider';

interface Props {
  onClose: () => void;
  onCreate: (data: CreateUserRequest) => Promise<void>;
}

export default function CreateUserModal({ onClose, onCreate }: Props) {
  const [form, setForm] = useState<CreateUserRequest>({
    username: '',
    password: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    position: '',
    country: '',
    city: '',
    postalCode: '',
    role: 'pto',
  });

  const handleSubmit = async () => {
    if (!form.username || !form.password || !form.email) {
      showToast('Заполните обязательные поля', 'error');
      return;
    }
    await onCreate(form);
    onClose();
  };

  const placeholders: Record<keyof CreateUserRequest, string> = {
    username: 'Имя пользователя (логин)',
    password: 'Пароль',
    firstName: 'Имя',
    lastName: 'Фамилия',
    email: 'Электронная почта',
    phone: 'Телефон',
    position: 'Должность',
    country: 'Страна',
    city: 'Город',
    postalCode: 'Почтовый индекс',
    role: 'Роль',
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Создать пользователя</h2>

        {(Object.keys(placeholders) as (keyof CreateUserRequest)[])
          .filter((key) => key !== 'role')
          .map((field) => (
            <input
              key={field}
              type={field === 'password' ? 'password' : 'text'}
              placeholder={placeholders[field]}
              className="border p-2 rounded w-full mb-3 text-sm"
              value={form[field]}
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
            Создать
          </button>
        </div>
      </div>
    </div>
  );
}
