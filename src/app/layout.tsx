import type { Metadata } from 'next';
import './globals.css';
import { fontSans } from '@/lib/fonts';
import DocumentTitle from '@/components/common/DocumentTitle';
import ToastProvider from '@/shared/modals/ToastProvider';
import ConfirmModalContainer from '@/shared/modals/ConfirmModal';
import EditModalContainer from '@/shared/modals/EditModalContainer';
import { ConfirmDialog } from '@/components/ui/confirm';
import { ToastContainer } from '@/components/ui/toast';

export const metadata: Metadata = {
  title: {
    default: 'АЭТЗ',
    template: '%s | АЭТЗ',
  },
  description: 'Корпоративный портал Астанинского электротехнического завода',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={fontSans.variable}>
      <body className={`${fontSans.className} antialiased font-sans`}>
        <DocumentTitle />
        <ConfirmModalContainer />
        <EditModalContainer />
        <ToastProvider />
        <ConfirmDialog />
        <ToastContainer />
        {children}
      </body>
    </html>
  );
}
