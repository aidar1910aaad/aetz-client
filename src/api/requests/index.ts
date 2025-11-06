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
      cellSummaries: any[];
      busbarSummary: any;
      busBridgeSummary: any;
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

// Получить заявку по ID
export async function getApplicationById(id: number, token: string): Promise<ApplicationData> {
  const response = await fetch(`${api}/bids/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Ошибка при получении заявки');
  }

  return response.json();
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