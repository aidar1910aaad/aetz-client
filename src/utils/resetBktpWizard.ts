import { useAdditionalEquipmentStore } from '@/store/useAdditionalEquipmentStore';
import { useBktpStore } from '@/store/useBktpStore';
import { useBmzStore } from '@/store/useBmzStore';
import { useDguStore } from '@/store/useDguStore';
import { useRealtimeCalculationStore } from '@/store/useRealtimeCalculationStore';
import { useRunnStore } from '@/store/useRunnStore';
import { useRusnStore } from '@/store/useRusnStore';
import { useTransformerStore } from '@/store/useTransformerStore';
import { useWorksStore } from '@/store/useWorksStore';
import { useWorkVisibilityStore } from '@/store/useWorkVisibilityStore';

export function resetBktpWizard() {
  useBktpStore.getState().reset();
  useBmzStore.getState().reset();
  useTransformerStore.getState().reset();
  useRusnStore.getState().reset();
  useRunnStore.getState().reset();
  useDguStore.getState().reset();
  useAdditionalEquipmentStore.getState().reset();
  useWorksStore.getState().reset();
  useWorkVisibilityStore.getState().reset();
  useRealtimeCalculationStore.getState().reset();
}
