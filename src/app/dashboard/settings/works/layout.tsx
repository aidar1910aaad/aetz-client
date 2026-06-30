import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Настройки работ',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
