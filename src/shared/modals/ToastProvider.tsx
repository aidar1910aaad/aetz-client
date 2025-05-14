// src/components/ToastProvider.tsx
'use client';

import { Toaster, toast } from 'react-hot-toast';

type ToastType = 'success' | 'error' | 'loading' | 'info';

export const showToast = (message: string, type: ToastType = 'success') => {
  switch (type) {
    case 'success':
      toast.success(message);
      break;
    case 'error':
      toast.error(message);
      break;
    case 'loading':
      toast.loading(message);
      break;
    case 'info':
    default:
      toast(message);
      break;
  }
};

export default function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3000,
        style: {
          background: '#4ade80',
          color: '#fff',
          fontWeight: 500,
          padding: '12px 16px',
          borderRadius: '12px',
        },
        success: {
          iconTheme: {
            primary: '#22c55e',
            secondary: '#fff',
          },
        },
        error: {
          style: {
            background: '#ef4444',
          },
          iconTheme: {
            primary: '#fff',
            secondary: '#ef4444',
          },
        },
        loading: {
          style: {
            background: '#facc15',
            color: '#000',
          },
        },
      }}
    />
  );
}
