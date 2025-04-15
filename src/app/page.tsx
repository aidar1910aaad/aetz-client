"use client"
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";


export default function Home() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // можно добавить проверку логина/пароля
    router.push("/dashboard");
  };
  return (
    <div className="relative min-h-screen flex items-center justify-center p-8 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      {/* Фоновое изображение */}
      <Image
        src="/login/bglogin.png"
        alt="Background"
        layout="fill"
        objectFit="cover"
        quality={100}
        className="z-0"
      />

      {/* Затемнение фона */}
      <div className="absolute inset-0 bg-black/30 z-10" />

      {/* Контент поверх */}
      <div className="relative z-20 flex flex-col items-center gap-4 max-w-md w-full text-white">
        {/* Логотип */}
        <Image
          src="/login/logo.png"
          alt="Logo"
          width={300}
          height={300}
          priority
        />

        {/* Заголовок */}
        <p className="text-[16px]  text-center font-semibold">
          Астанинский электротехнический завод
        </p>



        {/* Форма авторизации */}
        <form
  onSubmit={handleSubmit}
  className="rounded-2xl p-6 w-full text-black shadow-xl space-y-4"
>          <div className="flex flex-col">
            
          <input
  type="text"
  id="login"
  placeholder="Введите логин"
  className="bg-[#C4E473] border border-[#C4E473] rounded-none w-full px-3 py-2 outline-none "
/>

          </div>

          <div className="flex flex-col">
            
            <div className="relative">
            <input
  type={showPassword ? "text" : "password"}
  id="password"
  placeholder="Введите пароль"
  className="bg-[#C4E473] border border-[#C4E473] rounded-none w-full px-3 py-2 pr-10 outline-none "
/>

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-gray-600"
              >
                {showPassword ? "Скрыть" : "Показать"}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="bg-[#8EBA1E] hover:bg[#8EBA0E] text-white rounded-[30px] px-4 py-2 w-full"
          >
            Войти в систему
          </button>
        </form>
      </div>
    </div>
  );
}
