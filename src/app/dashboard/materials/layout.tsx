import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Материалы',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
