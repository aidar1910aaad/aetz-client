import React from 'react';

interface BusbarSaveButtonProps {
  onClick: () => void;
  loading?: boolean;
}

export function BusbarSaveButton({ onClick, loading }: BusbarSaveButtonProps) {
  return (
    <button
      onClick={onClick}
      className="mt-6 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
      disabled={loading}
    >
      {loading ? 'Сохранение...' : 'Сохранить'}
    </button>
  );
}
