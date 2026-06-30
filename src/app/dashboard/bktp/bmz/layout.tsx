import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Здание подстанции',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
