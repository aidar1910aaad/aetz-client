'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Select } from '@/components/ui/select';

interface HistoryPaginationProps {
  currentPage: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}

export default function HistoryPagination({
  currentPage,
  totalPages,
  total,
  limit,
  onPageChange,
  onLimitChange,
}: HistoryPaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 7;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const startItem = (currentPage - 1) * limit + 1;
  const endItem = Math.min(currentPage * limit, total);

  return (
    <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
      <div className="text-sm text-gray-600">
        Показано {startItem}—{endItem} из {total}
      </div>
      <div className="flex items-center gap-3">
        <Select
          value={limit}
          onChange={(e) => onLimitChange(Number(e.target.value))}
          className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#8eba1e] focus:border-[#8eba1e]"
        >
          {[20, 50, 100].map((size) => (
            <option key={size} value={size}>
              {size} / стр
            </option>
          ))}
        </Select>
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 hover:border-[#8eba1e] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-300"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {getPageNumbers().map((page, idx) => {
          if (page === '...') {
            return (
              <span key={`ellipsis-${idx}`} className="px-3 py-2 text-gray-500">
                ...
              </span>
            );
          }

          const pageNum = page as number;
          const isActive = pageNum === currentPage;

          return (
            <button
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              className={`px-4 py-2 rounded-lg border transition-all duration-200 ${
                isActive
                  ? 'bg-[#8eba1e] text-white border-[#8eba1e]'
                  : 'border-gray-300 hover:bg-gray-50 hover:border-[#8eba1e]'
              }`}
            >
              {pageNum}
            </button>
          );
        })}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 hover:border-[#8eba1e] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-300"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}


