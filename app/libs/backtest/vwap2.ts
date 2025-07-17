import { BybitKline } from "../../types/type";
import { calculateVWAP } from "../D3/VWAP";

type VWAPData = {
  timestamp: number;
  value: number;
};

export function calculateProportionalVWAP(
  data: BybitKline[],
  period: number = 100
): VWAPData[] {
  if (data.length === 0) return [];

  const vwapData: VWAPData[] = [];
  const alpha = 1 / period; // 가중치
  const decay = 1 - alpha; // 감쇠율

  let cumulativeVolume = 0;
  let cumulativePriceVolume = 0;

  // 각 캔들마다 지수적 가중 VWAP 계산
  for (let i = 0; i < data.length; i++) {
    const currentData = data[i];
    const typicalPrice = Number(currentData[4]);
    const volume = Number(currentData[5]);

    // 이전 값에 감쇠율을 적용하고 현재 값을 추가
    cumulativeVolume = cumulativeVolume * decay + volume;
    cumulativePriceVolume =
      cumulativePriceVolume * decay + typicalPrice * volume;

    // 초기 몇 개 캔들은 건너뛰기 (안정화를 위해)
    if (i < Math.min(period, 50)) continue;

    const vwap =
      cumulativeVolume > 0 ? cumulativePriceVolume / cumulativeVolume : 0;

    vwapData.push({
      timestamp: Number(data[i][0]),
      value: vwap,
    });
  }

  return vwapData;
}

// 단순 이동평균 계산 함수
function calculateSMA(data: number[], period: number): number[] {
  const sma: number[] = [];

  for (let i = period - 1; i < data.length; i++) {
    let sum = 0;
    for (let j = i - period + 1; j <= i; j++) {
      sum += data[j];
    }
    sma.push(sum / period);
  }

  return sma;
}

export function calculateMAVWAP(
  data: BybitKline[],
  vwapPeriod: number = 100,
  maPeriod: number = 20
): VWAPData[] {
  const vwapData = calculateVWAP(data, vwapPeriod);

  if (vwapData.length === 0) return [];

  // VWAP 값들 추출
  const vwapValues = vwapData.map((d) => d.value);

  // VWAP의 이동평균 계산
  const maValues = calculateSMA(vwapValues, maPeriod);

  // 결과 데이터 생성 (이동평균이 계산 가능한 시점부터)
  const maData: VWAPData[] = [];
  const startIndex = vwapData.length - maValues.length;

  for (let i = 0; i < maValues.length; i++) {
    maData.push({
      timestamp: vwapData[startIndex + i].timestamp,
      value: maValues[i],
    });
  }

  return maData;
}
