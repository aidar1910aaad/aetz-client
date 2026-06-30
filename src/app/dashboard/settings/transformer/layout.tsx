import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Настройки трансформатора',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
