'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Pencil,
  Trash2,
  X,
  Search,
  FolderOpen,
  Plus,
  Layers,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ExternalLink,
} from 'lucide-react';
import { Category } from '@/api/categories';
import { useMaterialCategoriesHandlers } from '@/hooks/useMaterialCategoriesHandlers';
import PageLoader from '@/shared/loader/PageLoader';
import { useRoleCheck } from '@/hooks/useRoleCheck';
import { Select } from '@/components/ui/select';

interface NewCategory {
  name: string;
  description: string;
  id?: number;
}

type SortField = 'name' | 'id';
type SortOrder = 'asc' | 'desc';

const PAGE_SIZE_OPTIONS = [20, 50, 100, 200] as const;

export default function MaterialCategoriesPage() {
  const router = useRouter();
  const { isManagerUser } = useRoleCheck();
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategory, setNewCategory] = useState<NewCategory>({
    name: '',
    description: '',
  });
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [itemsPerPage, setItemsPerPage] = useState<number>(50);

  const canEdit = !isManagerUser;

  const { fetchCategories, handleAddCategory, handleDelete, handleUpdate } =
    useMaterialCategoriesHandlers(categories, setCategories, setNewCategory);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await fetchCategories();
      setLoading(false);
    })();
  }, [fetchCategories]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.name.trim()) return;

    handleAddCategory(newCategory);
    setNewCategory({ name: '', description: '' });
    setShowForm(false);
  };

  const filteredCategories = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return categories;

    return categories.filter(
      (cat) =>
        cat.name.toLowerCase().includes(query) ||
        String(cat.id).includes(query) ||
        (cat.description || '').toLowerCase().includes(query)
    );
  }, [categories, searchQuery]);

  const sortedCategories = useMemo(() => {
    const list = [...filteredCategories];

    list.sort((a, b) => {
      if (sortField === 'id') {
        return sortOrder === 'asc' ? a.id - b.id : b.id - a.id;
      }

      const cmp = a.name.localeCompare(b.name, 'ru');
      return sortOrder === 'asc' ? cmp : -cmp;
    });

    return list;
  }, [filteredCategories, sortField, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(sortedCategories.length / itemsPerPage));

  const paginatedCategories = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedCategories.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedCategories, currentPage, itemsPerPage]);

  const withDescriptionCount = useMemo(
    () => categories.filter((cat) => cat.description?.trim()).length,
    [categories]
  );

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handlePageSizeChange = (size: number) => {
    setItemsPerPage(size);
    setCurrentPage(1);
  };

  const handleCategoryClick = (categoryName: string) => {
    router.push(`/dashboard/materials?category=${encodeURIComponent(categoryName)}`);
  };

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
      return;
    }
    setSortField(field);
    setSortOrder(field === 'id' ? 'desc' : 'asc');
  };

  const startItem = sortedCategories.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, sortedCategories.length);

  if (loading) {
    return (
      <div className="h-[calc(100vh-64px)]">
        <PageLoader inline />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-64px)] overflow-y-auto bg-gray-50">
      {/* Header */}
      <div className="border-b border-[#7aa31a]/30 bg-gradient-to-r from-[#7aa31a] to-[#8eba1e]">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:px-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-sm text-white/80">
              <Link href="/dashboard/materials" className="hover:text-white transition-colors">
                Материалы
              </Link>
              <span>/</span>
              <span className="text-white">Категории</span>
            </div>
            <h1 className="mt-1 text-2xl font-semibold text-white">Категории материалов</h1>
            <p className="mt-1 text-sm text-white/85">
              Справочник групп для номенклатуры · {categories.length} категорий
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <Link
              href="/dashboard/materials"
              className="inline-flex items-center gap-2 rounded-lg border border-white/30 bg-white/10 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/20"
            >
              <FolderOpen size={16} />
              К материалам
            </Link>
            {canEdit && (
              <button
                type="button"
                onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-[#7aa31a] transition-colors hover:bg-white/90"
              >
                <Plus size={16} />
                Создать категорию
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        {/* Stats */}
        <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl border border-[#8eba1e]/20 bg-white px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Всего</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums text-gray-900">{categories.length}</p>
          </div>
          <div className="rounded-xl border border-[#8eba1e]/20 bg-white px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Найдено</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums text-[#8eba1e]">
              {filteredCategories.length}
            </p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">С описанием</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums text-gray-900">
              {withDescriptionCount}
            </p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Без описания</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums text-gray-900">
              {categories.length - withDescriptionCount}
            </p>
          </div>
        </div>

        {/* Toolbar */}
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative flex-1 max-w-xl">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Поиск по названию, ID или описанию..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-[#8eba1e] focus:outline-none focus:ring-2 focus:ring-[#8eba1e]/20"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Сортировка:</span>
            <Select
              value={`${sortField}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-') as [SortField, SortOrder];
                setSortField(field);
                setSortOrder(order);
                setCurrentPage(1);
              }}
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-[#8eba1e] focus:outline-none"
            >
              <option value="name-asc">Название А→Я</option>
              <option value="name-desc">Название Я→А</option>
              <option value="id-asc">ID по возрастанию</option>
              <option value="id-desc">ID по убыванию</option>
            </Select>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-xl border border-[#8eba1e]/20 bg-white shadow-sm">
          {paginatedCategories.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
              <Layers className="mb-4 h-12 w-12 text-gray-300" />
              <p className="text-base font-medium text-gray-900">
                {searchQuery ? 'Категории не найдены' : 'Категорий пока нет'}
              </p>
              <p className="mt-1 text-sm text-gray-500">
                {searchQuery
                  ? 'Попробуйте изменить запрос поиска'
                  : 'Создайте первую категорию для группировки материалов'}
              </p>
              {!searchQuery && canEdit && (
                <button
                  type="button"
                  onClick={() => setShowForm(true)}
                  className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#8eba1e] px-4 py-2 text-sm font-medium text-white hover:bg-[#7aa31a]"
                >
                  <Plus size={16} />
                  Создать категорию
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/90 text-xs font-medium uppercase tracking-wide text-gray-500">
                    <th className="w-24 px-4 py-3">
                      <button
                        type="button"
                        onClick={() => toggleSort('id')}
                        className="inline-flex items-center gap-1 hover:text-[#8eba1e]"
                      >
                        ID
                        <ArrowUpDown size={12} />
                      </button>
                    </th>
                    <th className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => toggleSort('name')}
                        className="inline-flex items-center gap-1 hover:text-[#8eba1e]"
                      >
                        Название
                        <ArrowUpDown size={12} />
                      </button>
                    </th>
                    <th className="hidden px-4 py-3 md:table-cell">Описание</th>
                    {canEdit && (
                      <th className="w-28 px-4 py-3 text-right">Действия</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginatedCategories.map((cat) => (
                    <tr
                      key={cat.id}
                      className="group transition-colors hover:bg-[#8eba1e]/5"
                    >
                      <td className="px-4 py-3">
                        <span className="inline-flex rounded-md bg-gray-100 px-2 py-0.5 font-mono text-xs font-medium text-gray-700">
                          {cat.id}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => handleCategoryClick(cat.name)}
                          className="flex max-w-md items-start gap-2 text-left"
                        >
                          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#8eba1e]/10">
                            <Layers className="h-4 w-4 text-[#8eba1e]" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900 group-hover:text-[#8eba1e] transition-colors line-clamp-2">
                              {cat.name}
                            </p>
                            <span className="mt-0.5 inline-flex items-center gap-1 text-xs text-[#8eba1e] opacity-0 transition-opacity group-hover:opacity-100">
                              Открыть материалы
                              <ExternalLink size={11} />
                            </span>
                            {cat.description && (
                              <p className="mt-1 line-clamp-2 text-xs text-gray-500 md:hidden">
                                {cat.description}
                              </p>
                            )}
                          </div>
                        </button>
                      </td>
                      <td className="hidden max-w-md px-4 py-3 md:table-cell">
                        {cat.description?.trim() ? (
                          <p className="line-clamp-2 text-gray-600">{cat.description}</p>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                      {canEdit && (
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => handleUpdate(cat)}
                              className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-[#8eba1e]/10 hover:text-[#8eba1e]"
                              title="Редактировать"
                            >
                              <Pencil size={16} />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm(`Удалить категорию «${cat.name}»?`)) {
                                  handleDelete(cat.id);
                                }
                              }}
                              className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600"
                              title="Удалить"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {sortedCategories.length > 0 && (
            <div className="flex flex-col gap-3 border-t border-gray-100 bg-gray-50/50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-4">
                <p className="text-sm text-gray-600">
                  Показано{' '}
                  <span className="font-medium text-gray-900">
                    {startItem}–{endItem}
                  </span>{' '}
                  из <span className="font-medium text-gray-900">{sortedCategories.length}</span>
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">На странице:</span>
                  <div className="w-24">
                    <Select
                      value={itemsPerPage}
                      onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                      menuClassName="bottom-full mb-1 !mt-0"
                      className="h-9 rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-sm focus:border-[#8eba1e] focus:outline-none"
                    >
                    {PAGE_SIZE_OPTIONS.map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                    </Select>
                  </div>
                </div>
              </div>
              {totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => p - 1)}
                    className="rounded-lg border border-gray-200 bg-white p-2 text-gray-600 transition-colors hover:border-[#8eba1e] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span className="min-w-[80px] text-center text-sm text-gray-600">
                    {currentPage} / {totalPages}
                  </span>
                  <button
                    type="button"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => p + 1)}
                    className="rounded-lg border border-gray-200 bg-white p-2 text-gray-600 transition-colors hover:border-[#8eba1e] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Create modal */}
      {showForm && canEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Новая категория</h2>
                <p className="text-sm text-gray-500">Добавление в справочник</p>
              </div>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4 p-5">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Название <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-[#8eba1e] focus:outline-none focus:ring-2 focus:ring-[#8eba1e]/20"
                  placeholder="Например: Вакуумный выключатель 10кВ"
                  required
                  autoFocus
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">ID</label>
                <input
                  type="number"
                  value={newCategory.id ?? ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    setNewCategory({
                      ...newCategory,
                      id: value ? parseInt(value, 10) : undefined,
                    });
                  }}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-[#8eba1e] focus:outline-none focus:ring-2 focus:ring-[#8eba1e]/20"
                  placeholder="Авто (4 цифры)"
                  min={1000}
                  max={9999}
                />
                <p className="mt-1 text-xs text-gray-500">
                  Необязательно — назначится автоматически
                </p>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Описание</label>
                <textarea
                  value={newCategory.description}
                  onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                  className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-[#8eba1e] focus:outline-none focus:ring-2 focus:ring-[#8eba1e]/20"
                  placeholder="Краткое описание категории"
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-2 border-t border-gray-100 pt-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-[#8eba1e] px-4 py-2 text-sm font-medium text-white hover:bg-[#7aa31a]"
                >
                  Создать
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
