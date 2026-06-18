'use client';

import Image from 'next/image';
import { BackgroundImage } from '../common/BackgroundImage';
import {
  BktpCalcIcon,
  CommercialOfferIcon,
  RequestsFlowIcon,
  SecureAccessIcon,
} from './LoginFeatureIcons';

const features = [
  {
    icon: BktpCalcIcon,
    title: 'Расчёт БКТП',
    description: 'Автоматизированный подбор и конфигурация оборудования',
  },
  {
    icon: CommercialOfferIcon,
    title: 'Коммерческие предложения',
    description: 'Формирование КП и документации в один клик',
  },
  {
    icon: RequestsFlowIcon,
    title: 'Управление заявками',
    description: 'Полный цикл от расчёта до согласования',
  },
  {
    icon: SecureAccessIcon,
    title: 'Безопасный доступ',
    description: 'Ролевая модель и защищённая авторизация',
  },
];

export function LoginHero() {
  return (
    <section className="relative hidden lg:flex lg:w-[55%] xl:w-[58%] flex-col justify-between overflow-hidden">
      <BackgroundImage src="/login/bglogin.png" overlayOpacity={0.65} />

      <div
        className="absolute inset-0 z-10"
        style={{
          background:
            'linear-gradient(145deg, rgba(12, 20, 10, 0.94) 0%, rgba(35, 58, 22, 0.9) 50%, rgba(142, 186, 30, 0.4) 100%)',
        }}
      />

      <div
        className="absolute inset-0 z-10 opacity-[0.07]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
          backgroundSize: '32px 32px',
        }}
      />

      <div className="relative z-20 flex flex-col h-full p-10 xl:p-14">
        <header className="animate-login-fade-up">
          <Image
            src="/login/logo.png"
            alt="АЭТЗ"
            width={140}
            height={70}
            priority
            className="h-auto w-[140px] brightness-0 invert"
          />
        </header>

        <div className="flex-1 flex flex-col justify-center max-w-xl py-12">
          <div className="animate-login-fade-up animation-delay-100">
            <p className="text-[#C4E473] text-sm font-semibold tracking-widest uppercase mb-4">
              Корпоративный портал
            </p>
            <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight tracking-tight">
              Астанинский
              <br />
              <span className="text-[#C4E473]">электротехнический</span>
              <br />
              завод
            </h1>
            <p className="mt-6 text-lg text-slate-300 leading-relaxed">
              Единая платформа для расчёта, проектирования и сопровождения
              электротехнического оборудования
            </p>
          </div>

          <ul className="mt-12 space-y-5">
            {features.map((feature, index) => (
              <li
                key={feature.title}
                className="flex items-start gap-4 animate-login-fade-up"
                style={{ animationDelay: `${(index + 2) * 100}ms` }}
              >
                <div className="flex-shrink-0 w-11 h-11 rounded-lg bg-[#8EBA1E]/15 backdrop-blur-sm border border-[#8EBA1E]/25 flex items-center justify-center">
                  <feature.icon className="w-[22px] h-[22px] text-[#C4E473]" />
                </div>
                <div>
                  <p className="text-white font-semibold">{feature.title}</p>
                  <p className="text-sm text-slate-400 mt-0.5">{feature.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <footer className="animate-login-fade-up animation-delay-500 text-sm text-slate-500">
          © {new Date().getFullYear()} АЭТЗ · Все права защищены
        </footer>
      </div>
    </section>
  );
}
