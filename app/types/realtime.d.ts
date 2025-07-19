// 바이비트 API 응답 타입
export interface BybitKlineResponse {
  retCode: number;
  retMsg: string;
  result: {
    symbol: string;
    category: string;
    list: string[][];
  };
  retExtInfo: any;
  time: number;
}

// 캔들 데이터 타입
export interface KlineData {
  startTime: number;
  openPrice: number;
  highPrice: number;
  lowPrice: number;
  closePrice: number;
  volume: number;
  turnover: number;
}

// API 요청 파라미터 타입
export interface BybitKlineParams {
  symbol: string;
  interval: string;
  category?: string;
  limit?: string;
  start?: string;
  end?: string;
}

// API 응답 타입
export interface BybitKlineApiResponse {
  success: boolean;
  data?: {
    symbol: string;
    category: string;
    klines: KlineData[];
    count: number;
  };
  error?: string;
  details?: string;
}
