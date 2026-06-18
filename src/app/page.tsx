'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LoginForm from '../components/Auth/LoginForm';
import { LoginHero } from '../components/Auth/LoginHero';

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiresAt = payload.exp ? payload.exp * 1000 : 0;
      if (!expiresAt || Date.now() < expiresAt) {
        router.replace('/dashboard');
      }
    } catch {
      localStorage.removeItem('token');
    }
  }, [router]);

  return (
    <div className="min-h-screen flex bg-[#f6f8f4]">
      <LoginHero />

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-10 sm:px-10 lg:px-16 relative border-l border-[#8EBA1E]/10">
        <div
          className="absolute inset-0 lg:hidden opacity-50"
          style={{
            background:
              'radial-gradient(ellipse at top, rgba(142, 186, 30, 0.1) 0%, transparent 65%)',
          }}
        />

        <div className="relative z-10 w-full flex justify-center">
          <LoginForm />
        </div>
      </main>
    </div>
  );
}
