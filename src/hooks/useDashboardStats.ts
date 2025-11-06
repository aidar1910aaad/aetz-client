import { useState, useEffect } from 'react';
import { getAllApplications } from '@/api/requests';
import { getAllUsers } from '@/api/users';
import { getAllMaterials } from '@/api/material';

export interface DashboardStats {
  totalApplications: number;
  activeApplications: number;
  completedCalculations: number;
  totalUsers: number;
  totalMaterials: number;
  recentApplications: any[];
  monthlyApplications: number;
  averageApplicationValue: number;
  topClients: Array<{ client: string; count: number; totalValue: number }>;
  applicationsByType: Array<{ type: string; count: number; percentage: number }>;
  loading: boolean;
  error: string | null;
}

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats>({
    totalApplications: 0,
    activeApplications: 0,
    completedCalculations: 0,
    totalUsers: 0,
    totalMaterials: 0,
    recentApplications: [],
    monthlyApplications: 0,
    averageApplicationValue: 0,
    topClients: [],
    applicationsByType: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        setStats(prev => ({ ...prev, loading: true, error: null }));

        // Получаем данные параллельно
        const [applications, users, materials] = await Promise.all([
          getAllApplications(token).catch(() => []),
          getAllUsers(token).catch(() => []),
          getAllMaterials(token).catch(() => []),
        ]);

        // Анализируем заявки
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const monthlyApplications = applications.filter((app: any) => {
          const appDate = new Date(app.date);
          return appDate.getMonth() === currentMonth && appDate.getFullYear() === currentYear;
        }).length;

        const totalValue = applications.reduce((sum: number, app: any) => {
          const amount = parseFloat(app.totalAmount) || 0;
          return sum + amount;
        }, 0);
        const averageValue = applications.length > 0 ? totalValue / applications.length : 0;

        // Группируем по клиентам
        const clientStats = applications.reduce((acc: any, app: any) => {
          const client = app.client || 'Неизвестный клиент';
          if (!acc[client]) {
            acc[client] = { count: 0, totalValue: 0 };
          }
          acc[client].count += 1;
          acc[client].totalValue += parseFloat(app.totalAmount) || 0;
          return acc;
        }, {});

        const topClients = Object.entries(clientStats)
          .map(([client, data]: [string, any]) => ({
            client,
            count: data.count,
            totalValue: data.totalValue,
          }))
          .sort((a, b) => b.totalValue - a.totalValue)
          .slice(0, 5);

        // Группируем по типам
        const typeStats = applications.reduce((acc: any, app: any) => {
          const type = app.type || 'Неизвестный тип';
          acc[type] = (acc[type] || 0) + 1;
          return acc;
        }, {});

        const applicationsByType = Object.entries(typeStats)
          .map(([type, count]: [string, number]) => ({
            type,
            count: count as number,
            percentage: applications.length > 0 ? ((count as number) / applications.length) * 100 : 0,
          }))
          .sort((a, b) => b.count - a.count);

        // Последние заявки
        const recentApplications = applications
          .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 5);

        setStats({
          totalApplications: applications.length,
          activeApplications: applications.filter((app: any) => !app.completed).length,
          completedCalculations: applications.filter((app: any) => app.completed).length,
          totalUsers: users.length,
          totalMaterials: materials.length,
          recentApplications,
          monthlyApplications,
          averageApplicationValue: averageValue,
          topClients,
          applicationsByType,
          loading: false,
          error: null,
        });
      } catch (error) {
        console.error('Ошибка при загрузке статистики:', error);
        setStats(prev => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : 'Неизвестная ошибка',
        }));
      }
    };

    fetchStats();
  }, []);

  return stats;
}