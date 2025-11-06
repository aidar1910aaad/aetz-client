import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserRole } from '@/types/user';

interface User {
  id: number;
  username: string;
  role: UserRole | string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  position?: string;
  country?: string;
  city?: string;
  postalCode?: string;
  createdAt?: string;
}

interface UserState {
  user: User | null;
  setUser: (user: User) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      clearUser: () => set({ user: null }),
    }),
    {
      name: 'user-storage', // название ключа в localStorage
    }
  )
);
