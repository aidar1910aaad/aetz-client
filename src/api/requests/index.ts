import { api } from '../baseUrl';

// Интерфейс для данных заявки
export interface ApplicationData {
  // Метаданные заявки
  taskNumber: string;
  date: string;
  client: string;
  type: string;
  user: {
    id: number;
    username: string;
    firstName?: string;
    lastName?: string;
  } | null;
  totalAmount: number;
  
  // Все данные конфигурации
  data: {
    managerMarkupPercent?: number;
    tableMarkupPercents?: Record<string, number>;
    tableMarkupTotals?: Record<string, number | null>;
    originalBidId?: number; // ID исходной заявки (если это измененная версия)
    notes?: string; // Заметки к заявке
    bmz: {
      buildingType: string;
      length: number;
      width: number;
      height: number;
      thickness: number;
      blockCount: number;
      settings: any;
      equipmentState: any;
      total: number;
    };
    transformer: {
      selected: any;
      total: number;
    };
    rusn: {
      cellConfigs: any[];
      busbarSummary: any;
      busBridgeSummary: any;
      busBridgeSummaries: any[];
      cellSummaries: any[];
      total: number;
    };
    runn: {
      cellConfigs?: any[];
      cellSummaries: any[];
      busbarSummary: any;
      busBridgeSummary: any;
      busBridgeSummaries: any[];
      global?: any;
      busBridges?: any[];
      total: number;
    };
    dgu?: {
      enabled: boolean;
      settings: any;
      cells: any[];
      cellSummaries: any[];
      busbarSummary: any;
      busBridgeSummaries: any[];
      total: number;
    };
    additionalEquipment: {
      selected: any;
      equipmentList: any[];
      total: number;
    };
    works: {
      selected: any;
      worksList: any[];
      total: number;
    };
  };
}

// Создать заявку
export async function createApplication(data: ApplicationData, token: string): Promise<{ id: number; bidNumber: string; message: string }> {
  console.log('🚀 Отправка заявки на сервер...');
  console.log('📡 URL:', `${api}/bids`);
  console.log('🔑 Токен:', token ? `${token.substring(0, 10)}...` : 'Отсутствует');
  console.log('📊 Размер данных:', JSON.stringify(data).length, 'символов');
  console.log('📊 Наценки в отправляемых данных:', {
    managerMarkupPercent: data.data?.managerMarkupPercent,
    tableMarkupPercents: data.data?.tableMarkupPercents,
    tableMarkupTotals: data.data?.tableMarkupTotals,
  });
  console.log('📊 Полные данные для отправки (JSON):', JSON.stringify(data, null, 2));
  
  const response = await fetch(`${api}/bids`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  console.log('📡 Ответ сервера:', {
    status: response.status,
    statusText: response.statusText,
    ok: response.ok
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    console.error('❌ Ошибка сервера:', error);
    throw new Error(error.message || 'Ошибка при создании заявки');
  }

  const result = await response.json();
  console.log('✅ Заявка успешно создана:', result);
  console.log('✅ Наценки в ответе сервера:', {
    managerMarkupPercent: result.data?.managerMarkupPercent || result.managerMarkupPercent,
    tableMarkupPercents: result.data?.tableMarkupPercents || result.tableMarkupPercents,
    tableMarkupTotals: result.data?.tableMarkupTotals || result.tableMarkupTotals,
    hasManagerMarkupPercent: 'managerMarkupPercent' in (result.data || result),
    hasTableMarkupPercents: 'tableMarkupPercents' in (result.data || result),
    hasTableMarkupTotals: 'tableMarkupTotals' in (result.data || result),
  });
  console.log('✅ Полный ответ сервера (JSON):', JSON.stringify(result, null, 2));
  return result;
}

// Получить все заявки
export async function getAllApplications(token: string): Promise<any[]> {
  const response = await fetch(`${api}/bids`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Ошибка при получении заявок');
  }

  return response.json();
}

// Интерфейс для полных данных заявки из API (с метаданными)
export interface ApplicationResponse extends ApplicationData {
  id: number;
  bidNumber: string;
  createdAt: string;
  updatedAt: string;
}

export interface CloneRepriceRequestOptions {
  useCurrentDate?: boolean;
  date?: string;
  client?: string;
  taskNumber?: string;
  managerMarkupPercent?: number;
  notes?: string;
  configOverrides?: Record<string, any>;
}

export interface CalculateApplicationDraftRequest {
  type?: string;
  data: any;
}

export interface CalculateApplicationDraftResponse {
  totalAmount: number;
  data: any;
}

// Получить заявку по ID
export async function getApplicationById(id: number, token: string): Promise<ApplicationResponse> {
  const response = await fetch(`${api}/bids/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Ошибка при получении заявки');
  }

  const data = await response.json();
  console.log('📥 Получена заявка с сервера:', {
    id: data.id,
    bidNumber: data.bidNumber,
    hasManagerMarkupPercent: 'managerMarkupPercent' in (data.data || data),
    hasTableMarkupPercents: 'tableMarkupPercents' in (data.data || data),
    hasTableMarkupTotals: 'tableMarkupTotals' in (data.data || data),
    managerMarkupPercent: data.data?.managerMarkupPercent || data.managerMarkupPercent,
    tableMarkupPercents: data.data?.tableMarkupPercents || data.tableMarkupPercents,
    tableMarkupTotals: data.data?.tableMarkupTotals || data.tableMarkupTotals,
  });
  return data;
}

// Получить заявку по номеру
export async function getApplicationByNumber(bidNumber: string, token: string): Promise<ApplicationData> {
  const response = await fetch(`${api}/bids/number/${bidNumber}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Ошибка при получении заявки по номеру');
  }

  return response.json();
}

// Обновить заявку
export async function updateApplication(id: number, data: Partial<ApplicationData>, token: string): Promise<ApplicationData> {
  const response = await fetch(`${api}/bids/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Ошибка при обновлении заявки');
  }

  return response.json();
}

// Создать новую заявку из существующей с пересчетом по актуальным ценам
export async function cloneRepriceApplication(
  id: number,
  token: string,
  options: CloneRepriceRequestOptions = {},
): Promise<{ id: number; bidNumber: string; data?: any; totalAmount?: number }> {
  const response = await fetch(`${api}/bids/${id}/clone-reprice`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(options),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Ошибка при создании заявки по актуальным ценам');
  }

  return response.json();
}

// Онлайн пересчет черновика заявки без сохранения в БД
export async function calculateApplicationDraft(
  payload: CalculateApplicationDraftRequest,
  token: string,
): Promise<CalculateApplicationDraftResponse> {
  const response = await fetch(`${api}/bids/calculate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Ошибка при онлайн пересчете заявки');
  }

  return response.json();
}

// Удалить заявку
export async function deleteApplication(id: number, token: string): Promise<void> {
  const response = await fetch(`${api}/bids/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Ошибка при удалении заявки');
  }
}