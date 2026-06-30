import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Текущая заявка',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
