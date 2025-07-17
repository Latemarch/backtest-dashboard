import { create } from 'zustand';

interface TradeState {
  selectedTrade: number;
  selectedTradeInfo: any;

  setSelectedTrade: (selectedTrade: number) => void;
  setSelectedTradeInfo: (selectedTradeInfo: any) => void;
}

export const useTradeStore = create<TradeState>((set) => ({
  selectedTrade: 0,
  selectedTradeInfo: null,

  setSelectedTrade: (selectedTrade) => set({ selectedTrade }),
  setSelectedTradeInfo: (selectedTradeInfo) => set({ selectedTradeInfo }),
}));
