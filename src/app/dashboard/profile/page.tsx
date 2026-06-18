'use client';

import { useState, type ReactNode } from 'react';
import { useUserStore } from '@/store/useUserStore';
import { updateMyProfile, UpdateProfileRequest } from '@/api/users';
import { showToast } from '@/shared/modals/ToastProvider';
import EditProfileModal from '@/shared/modals/profile/EditProfileModal';
import ChangePasswordModal from '@/shared/modals/profile/ChangePasswordModal';
import { getRoleDisplayName } from '@/types/user';
import { formatUserFullName } from '@/utils/userDisplayName';
import PageLoader from '@/shared/loader/PageLoader';

function displayValue(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed || '—';
}

function getInitials(firstName?: string, lastName?: string, username?: string) {
  if (lastName?.trim() && firstName?.trim()) {
    return `${lastName[0]}${firstName[0]}`.toUpperCase();
  }
  if (firstName?.trim()) return firstName.slice(0, 2).toUpperCase();
  return username?.slice(0, 2).toUpperCase() || '?';
}

function getRoleBadgeClass(role: string | undefined | null) {
  const normalized = role?.toLowerCase().trim();
  if (normalized === 'admin') return 'bg-red-50 text-red-700 ring-red-200/60';
  if (normalized === 'manager') return 'bg-amber-50 text-amber-800 ring-amber-200/60';
  if (normalized === 'pto') return 'bg-[#8eba1e]/10 text-[#6b8f16] ring-[#8eba1e]/25';
  return 'bg-gray-50 text-gray-600 ring-gray-200';
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-gray-100 py-3 last:border-0 last:pb-0 first:pt-0">
      <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</dt>
      <dd className="mt-1 text-sm font-medium text-gray-900">{value}</dd>
    </div>
  );
}

function InfoCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white">
      <div className="border-b border-gray-100 px-5 py-4">
        <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
      </div>
      <dl className="px-5 py-4">{children}</dl>
    </section>
  );
}

export default function ProfilePage() {
  const { user, setUser } = useUserStore();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);

  if (!user) {
    return (
      <div className="h-[calc(100vh-64px)]">
        <PageLoader inline />
      </div>
    );
  }

  const fullName = formatUserFullName(user);
  const initials = getInitials(user.firstName, user.lastName, user.username);
  const roleLabel = getRoleDisplayName(user.role);
  const locationParts = [user.city, user.country].filter((part) => part?.trim());

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

  const handleUpdateProfile = async (data: UpdateProfileRequest) => {
    const token = localStorage.getItem('token') || '';
    const updatedUser = await updateMyProfile(data, token);
    setUser(updatedUser);
    showToast('Профиль успешно обновлён', 'success');
  };

  const handleChangePassword = async (newPassword: string) => {
    try {
      const token = localStorage.getItem('token') || '';
      const updatedUser = await updateMyProfile({ password: newPassword }, token);
      setUser(updatedUser);
      showToast('Пароль успешно изменён', 'success');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Ошибка при изменении пароля';
      showToast(message, 'error');
      throw error;
    }
  };

  return (
    <div className="h-[calc(100vh-64px)] overflow-y-auto bg-gray-50">
      <div className="border-b border-[#7aa31a]/30 bg-gradient-to-r from-[#7aa31a] to-[#8eba1e] px-6 py-5">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-white">Мой профиль</h1>
            <p className="mt-1 text-sm text-white/85">Личные данные и настройки аккаунта</p>
          </div>
          <button
            type="button"
            onClick={() => setIsEditModalOpen(true)}
            className="inline-flex shrink-0 items-center justify-center rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-[#7aa31a] transition-colors hover:bg-white/90"
          >
            Редактировать
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <div className="mb-6 rounded-xl border border-[#8eba1e]/20 bg-white p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#8eba1e]/15 text-lg font-semibold text-[#6b8f16]">
                {initials}
              </span>
              <div className="min-w-0">
                <h2 className="truncate text-xl font-semibold text-gray-900">{fullName}</h2>
                <div className="mt-1.5 flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${getRoleBadgeClass(user.role)}`}
                  >
                    {roleLabel}
                  </span>
                  {user.position?.trim() && (
                    <span className="text-sm text-gray-500">{user.position.trim()}</span>
                  )}
                </div>
                {locationParts.length > 0 && (
                  <p className="mt-1 text-sm text-gray-500">{locationParts.join(', ')}</p>
                )}
              </div>
            </div>
            <div className="shrink-0 rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-right">
              <p className="text-xs text-gray-500">ID пользователя</p>
              <p className="text-lg font-semibold text-gray-900">#{user.id}</p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <InfoCard title="Личная информация">
              <InfoRow label="Полное имя" value={fullName} />
              <InfoRow label="Email" value={displayValue(user.email)} />
              <InfoRow label="Телефон" value={displayValue(user.phone)} />
              <InfoRow label="Должность" value={displayValue(user.position)} />
            </InfoCard>

            <div className="grid gap-6 md:grid-cols-2">
              <InfoCard title="Аккаунт">
                <InfoRow label="Имя пользователя" value={displayValue(user.username)} />
                <InfoRow label="Роль" value={roleLabel} />
                <InfoRow
                  label="Дата регистрации"
                  value={user.createdAt ? formatDate(user.createdAt) : '—'}
                />
              </InfoCard>

              <InfoCard title="Местоположение">
                <InfoRow label="Страна" value={displayValue(user.country)} />
                <InfoRow label="Город" value={displayValue(user.city)} />
                <InfoRow label="Почтовый индекс" value={displayValue(user.postalCode)} />
              </InfoCard>
            </div>
          </div>

          <aside className="space-y-6">
            <section className="rounded-xl border border-gray-200 bg-white">
              <div className="border-b border-gray-100 px-5 py-4">
                <h2 className="text-sm font-semibold text-gray-900">Действия</h2>
              </div>
              <div className="space-y-1 p-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(true)}
                  className="w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium text-gray-700 transition-colors hover:bg-[#8eba1e]/5 hover:text-[#6b8f16]"
                >
                  Редактировать профиль
                </button>
                <button
                  type="button"
                  onClick={() => setIsChangePasswordModalOpen(true)}
                  className="w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium text-gray-700 transition-colors hover:bg-[#8eba1e]/5 hover:text-[#6b8f16]"
                >
                  Изменить пароль
                </button>
                <button
                  type="button"
                  disabled
                  className="w-full cursor-not-allowed rounded-lg px-3 py-2.5 text-left text-sm text-gray-400"
                >
                  Настройки уведомлений (скоро)
                </button>
              </div>
            </section>
          </aside>
        </div>
      </div>

      {isEditModalOpen && (
        <EditProfileModal
          user={{
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            email: user.email || '',
            phone: user.phone || '',
            position: user.position || '',
            country: user.country || '',
            city: user.city || '',
            postalCode: user.postalCode || '',
          }}
          onClose={() => setIsEditModalOpen(false)}
          onUpdate={handleUpdateProfile}
        />
      )}

      {isChangePasswordModalOpen && (
        <ChangePasswordModal
          onClose={() => setIsChangePasswordModalOpen(false)}
          onChangePassword={handleChangePassword}
        />
      )}
    </div>
  );
}
