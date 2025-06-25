import { create } from 'zustand';

interface CameraState {
  hasCamera: boolean;
  cameraType: string;
  setField: (field: keyof CameraState, value: any) => void;
  reset: () => void;
}

const initialState = {
  hasCamera: false,
  cameraType: '',
};

export const useCameraStore = create<CameraState>((set) => ({
  ...initialState,
  setField: (field, value) => set({ [field]: value }),
  reset: () => set(initialState),
}));
