// Экспорты для API материалов
export {
  getMaterialById,
  getMaterialHistory,
  getMaterialHistoryList,
  createMaterial,
  updateMaterial,
  deleteMaterial,
  getAllMaterials,
  getMaterialsByCategoryId,
  type Material,
  type MaterialHistoryItem,
  type MaterialHistoryWithMaterial,
  type GetMaterialHistoryParams,
  type MaterialHistoryResponse,
  type CreateMaterialRequest,
  type UpdateMaterialRequest,
  type GetMaterialsParams
} from './index';