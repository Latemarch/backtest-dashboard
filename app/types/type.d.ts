export type BybitKline = {
  0: number; // startTime - Start time of the candle (ms)
  1: number; // openPrice - Open price
  2: number; // highPrice - Highest price
  3: number; // lowPrice - Lowest price
  4: number; // closePrice - Close price (last traded price when candle is not closed)
  5: number; // volume - Trade volume (base coin for USDT/USDC, quote coin for inverse)
  6: number; // turnover - Turnover
  index?: number;
};

export type BybitWSData = {
  topic: string;
  type: string;
  ts: number;
  data: {
    T: number; // Timestamp
    s: string; // Symbol
    S: string; // Side
    v: string; // Volume
    p: string; // Price
    L: string; // Tick direction
    i: string; // Trade ID
    BT: boolean; // Is block trade
    RPI: boolean; // Is retail price improvement
  }[];
  wsKey: string;
};

// 지표 데이터를 위한 인터페이스 정의
export interface IndicatorData {
  macd?: ReturnType<typeof calculateMACD>;
  ma5?: ReturnType<typeof calculateMovingAverage>;
  ma10?: ReturnType<typeof calculateMovingAverage>;
  ma20?: ReturnType<typeof calculateMovingAverage>;
  bollingerBands?: ReturnType<typeof calculateBollingerBands>;
  vwap?: ReturnType<typeof calculateVWAP>;
  vwap2?: ReturnType<typeof calcuateVWAP>;
  vwapmacd?: ReturnType<typeof makeVWAPMACD>;
  rsi?: ReturnType<typeof calculateRSI>;
  sar?: ReturnType<typeof calculateSAR>;
  boundaries?: ReturnType<typeof calculateBoundaries>;
}

export interface ChartOptions {
  macd: boolean;
  ma5: boolean;
  ma10: boolean;
  ma20: boolean;
  bollingerBands: boolean;
  vwap: boolean;
  sar: boolean;
  boundaries: boolean;
}

export type BollingerBands = {
  timestamp: number;
  upper: number;
  middle: number;
  lower: number;
};

export type VWAP = {
  timestamp: number;
  vwap: number;
};

export type MovingAverage = {
  timestamp: number;
  movingAverage: number;
};

export type MACD = {
  timestamp: number;
  macd: number;
  signal: number;
  histogram: number;
};

export type VWAP = {
  timestamp: number;
  vwap: number;
};

export interface IndicatorData {
  macd?: MACD[];
  ma5?: MovingAverage[];
  ma10?: MovingAverage[];
  ma20?: MovingAverage[];
  bollingerBands?: BollingerBands[];
  vwap?: VWAP[];
}

export interface TradingHistory {
  side: "buy" | "sell" | "close";
  price: number;
  timestamp: number;
  taker: boolean;
  id: number;
  qty: number;
  positionPrice: number;
  liqSide?: "long" | "short";
  TP?: number;
  SL?: number;
}

export type Order = {
  side: "buy" | "sell" | "close";
  closePosition?: number;
  positionId?: number;
  price: number;
  timestamp: number;
  qty: number;
  id: number;
  SL?: number;
  TP?: number;
} | null;

export type Position = {
  side: "long" | "short";
  price: number;
  timestamp: number;
  lastTradeTime: number;
  lastTradePrice: number;
  taker: boolean;
  qty: number;
  id: number;
  SL?: number;
  TP?: number;
} | null;

export type PositionV2 = {
  id: number;
  side: "long" | "short";
  price: number;
  timestamp: Array<number>;
  taker: boolean;
  qty: number;
  SL?: number;
  TP?: number;
} | null;

export type OrderV2 = Array<{
  id: number;
  side: "buy" | "sell" | "close";
  price: number;
  timestamp: number;
  qty: number;
  id: number;
}>;

export type PositionHistory = {
  holdingPeriod: number;
  side: "long" | "short";
  macd: number[];
  rsi: number[];
};

export type Opinion = {
  side: "buy" | "sell";
  price: number;
  timestamp: number;
  qty: number;
  isTaker: boolean;
} | null;
