import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Настройки РУНН',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
