'use client';

import HeaderInfo from '@/components/FinalReview/HeaderInfo';
import BmzSection from '@/components/FinalReview/BmzSection';
import TransformerSection from '@/components/FinalReview/TransformerSection';
import RusnSection from '@/components/FinalReview/RusnSection';
import FooterTotal from '@/components/FinalReview/FooterTotal';
import { exportFinalReviewToExcel } from '@/utils/exportFinalReviewToExcel';
import { useBktpStore } from '@/store/useBktpStore';
import { useBmzStore } from '@/store/useBmzStore';
import { useTransformerStore } from '@/store/useTransformerStore';
import { useRusnStore } from '@/store/useRusnStore';
import { exportFinalReviewToPdf } from '@/utils/exportFinalReviewToPdf';
import Breadcrumbs from '@/components/Breadcrumbs/Breadcrumbs'; // ✅ добавь путь, где у тебя лежит компонент

export default function FinalReviewForm() {
  const bktp = useBktpStore();
  const bmz = useBmzStore();
  const { selectedTransformer, isSkipped } = useTransformerStore();
  const rusn = useRusnStore();
  const rusnMapped = {
    selectedCellTypes: [rusn.global.bodyType],
    breaker: '', // если хочешь — можешь получить из первой ячейки: rusn.cellConfigs[0]?.breaker
    rza: '',
    ctRatio: '',
    meterType: '',
    cells: {
      input: rusn.cellConfigs.filter((c) => c.purpose === '1ВК').length,
      sv: rusn.cellConfigs.filter((c) => c.purpose === '3СВ').length,
      sr: rusn.cellConfigs.filter((c) => c.purpose === '4РСВ').length,
      outgoing: rusn.cellConfigs.filter((c) => c.purpose === 'Отходящая линия').length,
      transformerOutgoing: rusn.cellConfigs.filter((c) => c.purpose === '2ЛК1').length,
      tn: rusn.global.tnCount,
      tsn: rusn.global.tsnCount,
    },
  };

  const transformerStore = useTransformerStore();

  const bmzLength = Number(bmz.length);
  const bmzWidth = Number(bmz.width);
  const bmzArea = Math.round(((bmzLength * bmzWidth) / 1_000_000) * 100) / 100;

  const pricePerLighting = 5000;
  const pricePerHeatedFloor = 7500;

  const bmzTotal =
    (bmz.lighting ? bmzArea * pricePerLighting : 0) +
    (bmz.heatedFloor ? bmzArea * pricePerHeatedFloor : 0);

  const transformerTotal = selectedTransformer
    ? selectedTransformer.price * selectedTransformer.quantity
    : 0;

  const rusnTotal = 8169028;
  const miscTotal = 1622663;

  const fullTotal =
    (bmz.lighting ? 18044000 : 0) +
    (bmz.fireAlarm ? 572000 : 0) +
    transformerTotal +
    rusnTotal +
    miscTotal;

  const handleSave = () => {
    bktp.reset();
    bmz.reset();
    transformerStore.reset();
    rusn.reset();
    alert('Заявка успешно сохранена');
    // можно сделать router.push('/dashboard/bktp') если хочешь редирект
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-10 bg-white rounded shadow-md">
      <Breadcrumbs />
      <HeaderInfo bktp={bktp} />
      <BmzSection bmz={bmz} />
      {!isSkipped && selectedTransformer && (
        <TransformerSection transformer={selectedTransformer} />
      )}
      <RusnSection
        rusn={{
          selectedCellTypes: [rusn.global.bodyType],
          breaker: '', // если нужен — можно передавать из cellConfigs[0]
          rza: '',
          ctRatio: '',
          meterType: '',
          cells: {
            input: rusn.cellConfigs.filter((c) => c.purpose === '1ВК').length,
            sv: rusn.cellConfigs.filter((c) => c.purpose === '3СВ').length,
            sr: rusn.cellConfigs.filter((c) => c.purpose === '4РСВ').length,
            outgoing: rusn.cellConfigs.filter((c) => c.purpose === 'Отходящая линия').length,
            transformerOutgoing: rusn.cellConfigs.filter((c) => c.purpose === '2ЛК1').length,
            tn: rusn.global.tnCount,
            tsn: rusn.global.tsnCount,
          },
        }}
      />

      <FooterTotal total={fullTotal} />
      <div className="text-right space-x-4">
        <button
          onClick={() => exportFinalReviewToExcel(bmz, selectedTransformer ?? null, rusnMapped)}
          className="mt-4 px-4 py-2 bg-[#3A55DF] text-white rounded hover:bg-blue-700"
        >
          Скачать Excel
        </button>
        <button
          onClick={() =>
            exportFinalReviewToPdf(bmz, selectedTransformer ?? null, rusnMapped, {
              client: bktp.client,
              executor: bktp.executor,
              date: bktp.date,
              taskNumber: bktp.taskNumber,
            })
          }
          className="mt-4 px-4 py-2 bg-[#10B981] text-white rounded hover:bg-green-700"
        >
          Скачать PDF
        </button>
        <button
          onClick={handleSave}
          className="mt-4 px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
        >
          Сохранить
        </button>
      </div>
    </div>
  );
}
