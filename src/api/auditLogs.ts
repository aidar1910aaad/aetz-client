import { api } from './baseUrl';

export type AuditEntityType = 'material' | 'calculation' | 'currency_settings';
export type AuditActionType = 'CREATE' | 'UPDATE' | 'DELETE';

export interface AuditLogItem {
  id: number;
  entityType: AuditEntityType;
  entityTypeRu?: string;
  entityId: number;
  action: AuditActionType;
  actionRu?: string;
  fieldChanged: string | null;
  fieldChangedRu?: string;
  oldValue: string | null;
  newValue: string | null;
  changedBy: string;
  changedAt: string;
  changedAtAlmaty?: string;
}

export interface GetAuditLogsParams {
  page?: number;
  limit?: number;
  entityType?: AuditEntityType;
  action?: AuditActionType;
  changedBy?: string;
}

export interface AuditLogsResponse {
  data: AuditLogItem[];
  total: number;
  page: number;
  limit: number;
}

export async function getAuditLogs(
  token: string,
  params: GetAuditLogsParams
): Promise<AuditLogsResponse> {
  const query = new URLSearchParams();

  query.append('page', String(params.page || 1));
  query.append('limit', String(params.limit || 50));

  if (params.entityType) query.append('entityType', params.entityType);
  if (params.action) query.append('action', params.action);
  if (params.changedBy?.trim()) query.append('changedBy', params.changedBy.trim());

  const response = await fetch(`${api}/audit-logs?${query.toString()}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Ошибка при получении журнала изменений');
  }

  const result = await response.json();
  return {
    data: result.data || [],
    total: result.total || 0,
    page: result.page || params.page || 1,
    limit: result.limit || params.limit || 50,
  };
}
