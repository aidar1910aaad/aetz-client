import { create } from 'zustand';

interface CellData {
  name: string;
  quantity: number;
  pricePerUnit: number;
  totalPrice: number;
}

interface RequestState {
  currentRequest: {
    cells: CellData[];
    totalSum: number;
    groupName: string;
    calculationName: string;
  } | null;
  setCurrentRequest: (request: RequestState['currentRequest']) => void;
  reset: () => void;
}

const initialState = {
  currentRequest: null,
};

export const useRequestStore = create<RequestState>((set) => ({
  ...initialState,
  setCurrentRequest: (request) => set({ currentRequest: request }),
  reset: () => set(initialState),
}));
