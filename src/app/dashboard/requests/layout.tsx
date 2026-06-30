import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'История заявок',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
