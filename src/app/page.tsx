'use client';

import Image from 'next/image';
import LoginForm from '../components/Auth/LoginForm';

export default function LoginPage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center p-8 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      {/* Фоновое изображение */}
      <Image src="/login/bglogin.png" alt="Background" fill className="object-cover z-0" />
      <div className="absolute inset-0 bg-black/30 z-10" />

      {/* Контент */}
      <div className="relative z-20 flex flex-col items-center gap-4 max-w-md w-full text-white">
        <Image src="/login/logo.png" alt="Logo" width={300} height={300} priority />
        <p className="text-[16px] text-center font-semibold">
          Астанинский электротехнический завод
        </p>
        <LoginForm />
      </div>
    </div>
  );
}
