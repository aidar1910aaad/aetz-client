import Link from 'next/link';
import { useRusnStore } from '@/store/useRusnStore';
import { useBktpStore } from '@/store/useBktpStore';
import { useBmzStore } from '@/store/useBmzStore';
import { useTransformerStore } from '@/store/useTransformerStore';
import { useRouter } from 'next/navigation';

interface RusnNextStepButtonProps {
  skip: boolean;
  onSwitchToBusbar?: () => void;
  currentTab?: 'main' | 'bus-bridge';
}

export const RusnNextStepButton = ({ skip, onSwitchToBusbar, currentTab }: RusnNextStepButtonProps) => {
  const router = useRouter();
  const rusn = useRusnStore();
  const bktp = useBktpStore();
  const bmz = useBmzStore();
  const transformer = useTransformerStore();

  const handleNextStep = () => {
    if (skip) {
      // Если пропускаем, переходим на следующую страницу
      router.push('/dashboard/bktp/bmz');
    } else {
      // Если добавляем в спецификацию
      if (currentTab === 'bus-bridge') {
        // Если мы в разделе "Сборные шины", переходим на РУНН
        router.push('/dashboard/bktp/runn');
      } else {
        // Если мы в разделе "Конфигурация", переключаемся на вкладку "Сборные шины"
        if (onSwitchToBusbar) {
          onSwitchToBusbar();
        }
      }
    }
  };

  return (
    <div className="mt-8">
      <button
        onClick={handleNextStep}
        className="flex items-center gap-2 px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-200 bg-[#8eba1e] hover:bg-[#7aa31a] text-white shadow-lg hover:shadow-xl transform hover:scale-105"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        {skip ? 'Далее' : 'Добавить в спецификацию'}
      </button>
    </div>
  );
};
