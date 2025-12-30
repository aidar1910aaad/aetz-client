'use client';

import Link from 'next/link';
import { Zap, TrendingUp, Settings2 } from 'lucide-react';
import { useUserStore } from '@/store/useUserStore';
import { useRoleCheck } from '@/hooks/useRoleCheck';

export default function HeroSection() {
  const { user } = useUserStore();
  const { isManagerUser } = useRoleCheck();

  // Форматирование имени пользователя
  const getUserDisplayName = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    if (user?.firstName) {
      return user.firstName;
    }
    return user?.username || 'Пользователь';
  };

  const displayName = getUserDisplayName();

  // Разные карточки для менеджера и других ролей
  const features = isManagerUser
    ? [
        {
          icon: Zap,
          title: 'Просмотр материалов',
          description: 'Быстрый доступ к каталогу',
          href: '/dashboard/materials',
          gradient: 'from-yellow-500/20 to-orange-500/20',
          iconGradient: 'from-yellow-400 via-orange-500 to-red-500',
          hoverColor: 'yellow-100',
          delay: '0.5s',
        },
        {
          icon: TrendingUp,
          title: 'История изменений',
          description: 'Отслеживание обновлений',
          href: '/dashboard/history',
          gradient: 'from-blue-500/20 to-purple-500/20',
          iconGradient: 'from-blue-400 via-purple-500 to-indigo-600',
          hoverColor: 'blue-100',
          delay: '0.6s',
        },
        {
          icon: Settings2,
          title: 'Личный профиль',
          description: 'Управление данными',
          href: '/dashboard/profile',
          gradient: 'from-green-500/20 to-teal-500/20',
          iconGradient: 'from-green-400 via-teal-500 to-cyan-600',
          hoverColor: 'green-100',
          delay: '0.7s',
        },
      ]
    : [
        {
          icon: Zap,
          title: 'Быстрые расчёты',
          description: 'Мгновенные результаты',
          href: '/dashboard/calc',
          gradient: 'from-yellow-500/20 to-orange-500/20',
          iconGradient: 'from-yellow-400 via-orange-500 to-red-500',
          hoverColor: 'yellow-100',
          delay: '0.5s',
        },
        {
          icon: TrendingUp,
          title: 'Аналитика',
          description: 'Детальная статистика',
          href: '/dashboard/requests',
          gradient: 'from-blue-500/20 to-purple-500/20',
          iconGradient: 'from-blue-400 via-purple-500 to-indigo-600',
          hoverColor: 'blue-100',
          delay: '0.6s',
        },
        {
          icon: Settings2,
          title: 'Настройки',
          description: 'Персонализация',
          href: '/dashboard/settings',
          gradient: 'from-green-500/20 to-teal-500/20',
          iconGradient: 'from-green-400 via-teal-500 to-cyan-600',
          hoverColor: 'green-100',
          delay: '0.7s',
        },
      ];

  return (
    <>
      <div className="relative overflow-hidden bg-gradient-to-br from-[#8eba1e] via-[#7aa31a] to-[#6b8f16]">

        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/5 to-transparent"></div>
          <div
            className="absolute top-20 right-20 w-32 h-32 bg-white/10 rounded-full blur-3xl animate-pulse"
            style={{ animationDuration: '4s' }}
          ></div>
          <div
            className="absolute bottom-20 left-20 w-24 h-24 bg-white/10 rounded-full blur-2xl animate-pulse"
            style={{ animationDuration: '5s', animationDelay: '1s' }}
          ></div>
          <div
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse"
            style={{ animationDuration: '6s', animationDelay: '2s' }}
          ></div>
        </div>

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px]"></div>

        <div className="relative px-6 py-16 md:py-20">
          <div className="max-w-7xl mx-auto">
            <div className="text-center text-white">
              {/* Main heading with fade-in animation */}
              <div className="mb-6 animate-fade-in">
                {isManagerUser ? (
                  <>
                    <h1
                      className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-white leading-tight animate-slide-up"
                      style={{ animationDelay: '0.1s', animationFillMode: 'both' }}
                    >
                      Добро пожаловать, {displayName.split(' ')[0]}!
                    </h1>
                    <p
                      className="text-lg md:text-xl text-white/90 mb-4 max-w-3xl mx-auto leading-relaxed font-medium animate-fade-in"
                      style={{ animationDelay: '0.2s', animationFillMode: 'both' }}
                    >
                      Рады видеть вас в системе управления материалами
                    </p>
                    <div
                      className="w-24 h-1 bg-gradient-to-r from-white to-white/50 mx-auto rounded-full animate-scale-in"
                      style={{ animationDelay: '0.3s', animationFillMode: 'both' }}
                    ></div>
                  </>
                ) : (
                  <>
                    <h1
                      className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-white leading-tight animate-slide-up"
                      style={{ animationDelay: '0.1s', animationFillMode: 'both' }}
                    >
                      Добро пожаловать в систему
                    </h1>
                    <div
                      className="w-24 h-1 bg-gradient-to-r from-white to-white/50 mx-auto rounded-full animate-scale-in"
                      style={{ animationDelay: '0.3s', animationFillMode: 'both' }}
                    ></div>
                  </>
                )}
              </div>

              {/* Subtitle with fade-in animation */}
              {!isManagerUser && (
                <p
                  className="text-lg md:text-xl text-white/95 mb-12 max-w-3xl mx-auto leading-relaxed font-light animate-fade-in"
                  style={{ animationDelay: '0.4s', animationFillMode: 'both' }}
                >
                  Профессиональные инструменты для проектирования и расчёта электротехнического оборудования
                </p>
              )}

              {/* Enhanced feature badges with staggered animation */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-8">
                {features.map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <Link
                      key={index}
                      href={feature.href}
                      className={`group relative bg-white/15 backdrop-blur-xl rounded-3xl p-8 border border-white/30 hover:bg-white/25 hover:border-white/40 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 animate-fade-in-up overflow-hidden cursor-pointer`}
                      style={{ animationDelay: feature.delay, animationFillMode: 'both' }}
                    >
                      {/* Gradient overlay on hover */}
                      <div
                        className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl`}
                      ></div>

                      <div className="relative flex flex-col items-center gap-4">
                        <div
                          className={`w-16 h-16 bg-gradient-to-br ${feature.iconGradient} rounded-2xl flex items-center justify-center text-white shadow-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}
                        >
                          <Icon className="w-8 h-8" />
                        </div>
                        <div className="text-center">
                          <h3
                            className="text-white font-bold text-xl mb-1.5 transition-colors"
                            style={{
                              color: 'rgb(255, 255, 255)',
                            }}
                            onMouseEnter={(e) => {
                              if (feature.hoverColor === 'yellow-100') {
                                e.currentTarget.style.color = 'rgb(254, 249, 195)';
                              } else if (feature.hoverColor === 'blue-100') {
                                e.currentTarget.style.color = 'rgb(219, 234, 254)';
                              } else if (feature.hoverColor === 'green-100') {
                                e.currentTarget.style.color = 'rgb(220, 252, 231)';
                              }
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.color = 'rgb(255, 255, 255)';
                            }}
                          >
                            {feature.title}
                          </h3>
                          <p className="text-white/85 text-sm font-light">{feature.description}</p>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>

              {/* Decorative element */}
              <div
                className="flex justify-center animate-fade-in"
                style={{ animationDelay: '0.8s', animationFillMode: 'both' }}
              >
                <div className="w-16 h-1 bg-gradient-to-r from-transparent via-white/50 to-transparent rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CSS animations */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scaleX(0);
          }
          to {
            opacity: 1;
            transform: scaleX(1);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
        
        .animate-slide-up {
          animation: slide-up 0.8s ease-out;
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out;
        }
        
        .animate-scale-in {
          animation: scale-in 0.6s ease-out;
        }
      `}} />
    </>
  );
}

