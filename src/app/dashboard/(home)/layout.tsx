import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Главная',
};

export default function DashboardHomeLayout({ children }: { children: React.ReactNode }) {
  return children;
}
