'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginUser } from '@/api/auth';
import { useUserStore } from '../../store/useUserStore';

export default function LoginForm() {
  const { setUser } = useUserStore();
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const result = await loginUser({ username, password });
      console.log('Login result:', result);

      setUser(result.user);
      localStorage.setItem('token', result.access_token);

      await new Promise((res) => setTimeout(res, 500));
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Ошибка входа');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl p-6 w-full text-black  space-y-4">
      <div className="flex flex-col">
        <input
          type="text"
          placeholder="Введите логин"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="bg-[#C4E473] border border-[#C4E473] rounded-none w-full px-3 py-2 outline-none"
        />
      </div>
      <div className="flex flex-col">
        <div className="relative">
          <input
            autoComplete="current-password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Введите пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-[#C4E473] border border-[#C4E473] rounded-none w-full px-3 py-2 pr-10 outline-none"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-gray-600"
          >
            {showPassword ? 'Скрыть' : 'Показать'}
          </button>
        </div>
      </div>

      {error && <p className="text-red-600 text-sm font-medium text-center">{error}</p>}

      <button
        type="submit"
        className="bg-[#8EBA1E] hover:bg-[#7da90d] text-white rounded-[30px] px-4 py-2 w-full"
      >
        Войти в систему
      </button>
    </form>
  );
}
