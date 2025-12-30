// src/components/PageLoader.tsx
'use client';

export default function PageLoader() {
  return (
    <div className="relative flex flex-col justify-center items-center min-h-screen w-full bg-white overflow-hidden">
      {/* Анимированный фон с градиентами - премиум эффект */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#8eba1e]/8 rounded-full blur-[100px] animate-pulse"
          style={{ animationDelay: '0s', animationDuration: '4s' }}
        />
        <div 
          className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-[#7aa31a]/8 rounded-full blur-[100px] animate-pulse"
          style={{ animationDelay: '1.5s', animationDuration: '4s' }}
        />
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[#8eba1e]/5 rounded-full blur-[120px] animate-pulse"
          style={{ animationDelay: '3s', animationDuration: '5s' }}
        />
      </div>

      {/* Основной контейнер лоадера */}
      <div className="relative z-10 flex flex-col items-center gap-10 px-4">
        {/* Премиум многослойный спиннер */}
        <div className="relative w-32 h-32">
          {/* Внешнее кольцо - большое с пульсацией */}
          <div className="absolute inset-0 w-32 h-32 border-[5px] border-transparent border-t-[#8eba1e] border-r-[#7aa31a] rounded-full animate-spin-pulse" />
          
          {/* Второе кольцо - среднее, вращается в обратную сторону с пульсацией */}
          <div className="absolute top-2 left-2 w-28 h-28 border-[4px] border-transparent border-b-[#8eba1e]/80 border-l-[#7aa31a]/80 rounded-full animate-spin-pulse-reverse" />
          
          {/* Третье кольцо - внутреннее с пульсацией */}
          <div className="absolute top-4 left-4 w-24 h-24 border-[3px] border-transparent border-t-[#8eba1e]/60 border-r-[#7aa31a]/60 rounded-full animate-spin-pulse-fast" />
          
          {/* Внутренний глоу эффект - большой с пульсацией */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-[#8eba1e]/8 rounded-full blur-xl animate-pulse" />
          
          {/* Внутренний глоу эффект - средний с пульсацией */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-[#8eba1e]/15 rounded-full blur-lg animate-pulse" style={{ animationDelay: '0.5s' }} />
          
          {/* Центральная точка с градиентом и пульсацией */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 bg-gradient-to-br from-[#8eba1e] via-[#7aa31a] to-[#8eba1e] rounded-full shadow-2xl shadow-[#8eba1e]/70 animate-pulse ring-2 ring-[#8eba1e]/20" />
        </div>

        {/* Текст с градиентом и анимацией */}
        <div className="flex flex-col items-center gap-4">
          <h3 
            className="text-3xl font-bold bg-gradient-to-r from-[#8eba1e] via-[#7aa31a] to-[#8eba1e] bg-clip-text text-transparent animate-gradient-shift"
            style={{
              backgroundSize: '200% auto',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            Загружаем данные
          </h3>
          
          {/* Анимированные точки */}
          <div className="flex gap-2 items-center">
            <span 
              className="w-2.5 h-2.5 bg-[#8eba1e] rounded-full animate-bounce shadow-lg shadow-[#8eba1e]/50"
              style={{ animationDelay: '0s', animationDuration: '1.4s' }}
            />
            <span 
              className="w-2.5 h-2.5 bg-[#7aa31a] rounded-full animate-bounce shadow-lg shadow-[#7aa31a]/50"
              style={{ animationDelay: '0.2s', animationDuration: '1.4s' }}
            />
            <span 
              className="w-2.5 h-2.5 bg-[#8eba1e] rounded-full animate-bounce shadow-lg shadow-[#8eba1e]/50"
              style={{ animationDelay: '0.4s', animationDuration: '1.4s' }}
            />
          </div>
        </div>

        {/* Премиум прогресс бар с градиентом */}
        <div className="w-80 max-w-full h-1.5 bg-gray-100 rounded-full overflow-hidden shadow-inner">
          <div 
            className="h-full bg-gradient-to-r from-[#8eba1e] via-[#7aa31a] to-[#8eba1e] rounded-full animate-progress-loading shadow-lg"
            style={{
              backgroundSize: '200% 100%',
              boxShadow: '0 0 10px rgba(142, 186, 30, 0.5)'
            }}
          />
        </div>

        {/* Дополнительный текст (опционально) */}
        <p className="text-sm text-gray-400 font-medium mt-2 animate-pulse">
          Пожалуйста, подождите...
        </p>
      </div>
    </div>
  );
}
