import type { PdfHeaderMeta } from './PdfCommercialHeader';

export function buildPdfHeaderMeta(params: {
  taskNumber: string;
  client: string;
  date: string;
  bidNumber?: string;
  objectDescription?: string;
}): PdfHeaderMeta {
  const taskNumber = (params.taskNumber || '').trim();
  const client = (params.client || '').trim();
  const date = (params.date || '').trim();
  const bidNumber = (params.bidNumber || '').trim();

  return {
    client,
    taskNumber,
    date,
    bidNumber: bidNumber || undefined,
    objectDescription: (params.objectDescription || client).trim() || undefined,
    outgoingNumber: taskNumber || bidNumber || undefined,
    outgoingDate: date || undefined,
  };
}
