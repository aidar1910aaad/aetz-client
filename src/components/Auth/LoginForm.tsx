'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Eye, EyeOff, Loader2, Lock, User, AlertCircle } from 'lucide-react';
import { loginUser } from '@/api/auth';
import { useUserStore } from '../../store/useUserStore';
import { cn } from '@/lib/utils';

export default function LoginForm() {
  const { setUser } = useUserStore();
  const router = useRouter();
  const usernameRef = useRef<HTMLInputElement>(null);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const isFormValid = username.trim().length > 0 && password.length > 0;

  useEffect(() => {
    usernameRef.current?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || isLoading) return;

    setError('');
    setIsLoading(true);

    try {
      const result = await loginUser({ username: username.trim(), password });

      setUser(result.user);
      localStorage.setItem('token', result.access_token);
      setIsSuccess(true);

      await new Promise((res) => setTimeout(res, 600));
      router.push('/dashboard');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Ошибка входа';
      setError(message);
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[420px] animate-login-fade-up">
      <div className="lg:hidden flex flex-col items-center mb-8">
        <Image
          src="/login/logo.png"
          alt="АЭТЗ"
          width={120}
          height={60}
          priority
          className="h-auto w-[120px] mb-3"
        />
        <p className="text-sm text-slate-500 text-center font-medium">
          Астанинский электротехнический завод
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-xl shadow-[#8EBA1E]/8 border border-slate-200/80 p-8 sm:p-10">
        <div className="mb-8">
          <div className="w-10 h-1 bg-[#8EBA1E] rounded-full mb-5" />
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Вход в систему
          </h2>
          <p className="mt-2 text-sm text-slate-500 leading-relaxed">
            Введите учётные данные, выданные администратором
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <div className="space-y-2">
            <label htmlFor="username" className="text-sm font-medium text-slate-700">
              Логин
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <User className="w-[18px] h-[18px] text-slate-400 group-focus-within:text-[#8EBA1E] transition-colors" />
              </div>
              <input
                ref={usernameRef}
                id="username"
                type="text"
                autoComplete="username"
                placeholder="Введите логин"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (error) setError('');
                }}
                disabled={isLoading || isSuccess}
                className={cn(
                  'w-full pl-11 pr-4 py-3 rounded-xl border bg-slate-50/50 text-slate-900 text-sm',
                  'placeholder:text-slate-400 transition-all duration-200 outline-none',
                  'hover:border-slate-300 hover:bg-white',
                  'focus:bg-white focus:border-[#8EBA1E] focus:ring-4 focus:ring-[#8EBA1E]/12',
                  'disabled:opacity-60 disabled:cursor-not-allowed',
                  error ? 'border-red-300 focus:border-red-400 focus:ring-red-100' : 'border-slate-200'
                )}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-slate-700">
              Пароль
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Lock className="w-[18px] h-[18px] text-slate-400 group-focus-within:text-[#8EBA1E] transition-colors" />
              </div>
              <input
                id="password"
                autoComplete="current-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Введите пароль"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError('');
                }}
                disabled={isLoading || isSuccess}
                className={cn(
                  'w-full pl-11 pr-12 py-3 rounded-xl border bg-slate-50/50 text-slate-900 text-sm',
                  'placeholder:text-slate-400 transition-all duration-200 outline-none',
                  'hover:border-slate-300 hover:bg-white',
                  'focus:bg-white focus:border-[#8EBA1E] focus:ring-4 focus:ring-[#8EBA1E]/12',
                  'disabled:opacity-60 disabled:cursor-not-allowed',
                  error ? 'border-red-300 focus:border-red-400 focus:ring-red-100' : 'border-slate-200'
                )}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading || isSuccess}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md text-slate-400 hover:text-[#8EBA1E] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8EBA1E]/25 disabled:opacity-50"
                aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
              >
                {showPassword ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
              </button>
            </div>
          </div>

          {error && (
            <div
              role="alert"
              className="flex items-start gap-3 bg-red-50 border border-red-100 rounded-xl px-4 py-3 animate-login-shake"
            >
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={!isFormValid || isLoading || isSuccess}
            className={cn(
              'relative w-full py-3.5 px-6 rounded-xl text-sm font-semibold text-white',
              'transition-all duration-200 outline-none',
              'focus-visible:ring-4 focus-visible:ring-[#8EBA1E]/25',
              isSuccess
                ? 'bg-[#8EBA1E] cursor-default'
                : 'bg-[#8EBA1E] hover:bg-[#7aa31a] hover:shadow-lg hover:shadow-[#8EBA1E]/25 active:scale-[0.98]',
              (!isFormValid || isLoading) && !isSuccess && 'opacity-50 cursor-not-allowed hover:shadow-none active:scale-100'
            )}
          >
            {isSuccess ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Успешный вход
              </span>
            ) : isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Проверка данных...
              </span>
            ) : (
              'Войти'
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100">
          <p className="text-xs text-slate-400 text-center leading-relaxed">
            Доступ предоставляется только авторизованным сотрудникам.
            <br />
            При проблемах со входом обратитесь к администратору.
          </p>
        </div>
      </div>

      <p className="lg:hidden mt-8 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} АЭТЗ · Все права защищены
      </p>
    </div>
  );
}
