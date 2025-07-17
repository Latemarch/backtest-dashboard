import { BybitKline } from "../types/type";
import useSWR from "swr";

interface CandleData {
  id: number;
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface CandleResponse {
  ok: boolean;
  data: CandleData[];
}

const fetcher = async (url: string): Promise<CandleResponse> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("데이터를 가져오는데 실패했습니다.");
  }
  return response.json();
};

export function useCandles(start?: number, end?: number) {
  const shouldFetch = start && end;
  const url = shouldFetch
    ? `/api/server-candle?start=${start}&end=${end}`
    : null;

  const { data, error, isLoading, mutate } = useSWR<CandleResponse>(
    url,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      refreshInterval: 0, // 10분간 중복 요청 방지
    }
  );

  const candles = serverCandlesToBybitKline(data?.data || []);

  return {
    candles,
    isLoading,
    error,
    mutate,
    isSuccess: data?.ok || false,
  };
}

function serverCandlesToBybitKline(serverCandles: CandleData[]): BybitKline[] {
  const candles = serverCandles.map((candle) => ({
    0: candle.timestamp,
    1: candle.open,
    2: candle.high,
    3: candle.low,
    4: candle.close,
    5: candle.volume,
    6: candle.volume,
  }));

  // timestamp로 정렬 (오름차순)
  return candles.sort((a, b) => Number(a[0]) - Number(b[0]));
}
