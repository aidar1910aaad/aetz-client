import { useEffect, useState } from 'react';
import { useUserStore } from '@/store/useUserStore';
import { UserRole } from '@/types/user';

interface User {
  id: number;
  username: string;
  role: UserRole | string;
}

/**
 * Хук для работы с аутентификацией
 * Синхронизируется с useUserStore для единообразия данных
 */
export function useAuth() {
  const { user: storeUser, setUser: setStoreUser } = useUserStore();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    
    // Если есть пользователь в store, используем его
    if (storeUser) {
      setUser(storeUser);
      setToken(storedToken);
      setLoading(false);
      return;
    }

    // Иначе пытаемся получить из токена
    if (storedToken) {
      try {
        const payload = JSON.parse(atob(storedToken.split('.')[1]));
        const userData = {
          id: payload.sub || payload.id,
          username: payload.username,
          role: payload.role,
        };
        setUser(userData);
        setToken(storedToken);
        // Сохраняем в store для единообразия
        setStoreUser(userData);
      } catch (error) {
        console.error('Error parsing token:', error);
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
      }
    }
    setLoading(false);
  }, [storeUser, setStoreUser]);

  return { user, loading, token };
}
