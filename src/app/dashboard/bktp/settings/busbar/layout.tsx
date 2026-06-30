import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Сборные шины',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
