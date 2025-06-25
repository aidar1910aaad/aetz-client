import Link from 'next/link';
import { useRusnStore } from '@/store/useRusnStore';
import { useBktpStore } from '@/store/useBktpStore';
import { useBmzStore } from '@/store/useBmzStore';
import { useTransformerStore } from '@/store/useTransformerStore';
import { useRouter } from 'next/navigation';

interface RusnNextStepButtonProps {
  skip: boolean;
}

export const RusnNextStepButton = ({ skip }: RusnNextStepButtonProps) => {
  const router = useRouter();
  const rusn = useRusnStore();
  const bktp = useBktpStore();
  const bmz = useBmzStore();
  const transformer = useTransformerStore();

  const handleNextStep = () => {
    // Собираем все данные
    const currentRequest = {
      cells: [
        ...rusn.cellConfigs.map((cell) => ({
          name: cell.purpose,
          quantity: cell.count,
          pricePerUnit: cell.totalPrice / cell.count,
          totalPrice: cell.totalPrice,
        })),
        // Добавляем шинный мост в спецификацию
        {
          name: `Шина ${rusn.global.busBridge.selectedBus?.size || ''} (${
            rusn.global.busBridge.material === 'copper' ? 'медь' : 'алюминий'
          })`,
          quantity: rusn.global.busBridge.totalWeight,
          pricePerUnit: rusn.global.busBridge.pricePerKg,
          totalPrice: rusn.global.busBridge.totalPrice,
        },
      ],
      totalSum:
        rusn.cellConfigs.reduce((sum, cell) => sum + cell.totalPrice, 0) +
        rusn.global.busBridge.totalPrice,
      groupName: rusn.global.bodyType,
      calculationName: rusn.global.calculationName,
    };

    // Сохраняем в localStorage
    localStorage.setItem('currentRequest', JSON.stringify(currentRequest));
    localStorage.setItem('rusn-storage', JSON.stringify(rusn));
    localStorage.setItem('bktp-storage', JSON.stringify(bktp));
    localStorage.setItem('bmz-storage', JSON.stringify(bmz));
    localStorage.setItem('transformer-storage', JSON.stringify(transformer));

    // Переходим на страницу спецификации
    router.push('/dashboard/final');
  };

  return (
    <div className="mt-8">
      <button
        onClick={handleNextStep}
        className="w-[400px] px-6 py-3 rounded-lg text-lg font-medium text-white bg-[#3A55DF] hover:bg-[#2e46c5] transition-colors"
      >
        {skip ? 'Далее' : 'Добавить в спецификацию'}
      </button>
    </div>
  );
};
