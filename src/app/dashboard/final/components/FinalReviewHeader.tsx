'use client';

import React from 'react';
import { Edit, X } from 'lucide-react';

interface FinalReviewHeaderProps {
  filename: string;
  fullName: string;
  user: any;
  isEditing?: boolean;
  onEditToggle?: () => void;
}

export default function FinalReviewHeader(props: FinalReviewHeaderProps) {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">
          Итоговая спецификация <span className="text-[#90bd20]">{props.filename}</span>
        </h1>
        {props.onEditToggle && (
          <button
            onClick={props.onEditToggle}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors ${
              props.isEditing
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-[#90bd20] hover:bg-[#7ba01c] text-white'
            }`}
          >
            {props.isEditing ? (
              <>
                <X className="w-4 h-4" />
                Отменить редактирование
              </>
            ) : (
              <>
                <Edit className="w-4 h-4" />
                Редактировать
              </>
            )}
          </button>
        )}
      </div>
      <div className="text-gray-600 text-sm mb-6 space-y-1">
        <p>Исполнитель: ТОО &#34;АЭТЗ&#34;</p>
        <p>
          Исполнитель{' '}
          <span className="font-semibold text-[#90bd20]">
            {props.user?.lastName || ''} {props.user?.firstName || ''}
          </span>
          {props.user?.phone && (
            <>
              {' | '}
              <span className="font-semibold text-[#90bd20]">{props.user.phone}</span>
            </>
          )}
          {props.user?.email && (
            <>
              {' | '}
              <span className="font-semibold text-[#90bd20]">{props.user.email}</span>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
