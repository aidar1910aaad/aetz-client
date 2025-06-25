'use client';

import { BackgroundImage } from '../components/common/BackgroundImage';
import { Logo } from '../components/common/Logo';
import { PageContainer } from '../components/layout/PageContainer';
import LoginForm from '../components/Auth/LoginForm';

export default function LoginPage() {
  return (
    <PageContainer className="relative flex items-center justify-center">
      <BackgroundImage src="/login/bglogin.png" />

      {/* Контент */}
      <div className="relative z-20 flex flex-col items-center gap-4 max-w-md w-full text-white">
        <Logo />
        <LoginForm />
      </div>
    </PageContainer>
  );
}
