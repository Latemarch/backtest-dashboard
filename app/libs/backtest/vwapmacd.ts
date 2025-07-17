import { BybitKline } from "../../types/type";
import { calculateVWAP } from "../D3/VWAP";
import { calculateMAVWAP, calculateProportionalVWAP } from "./vwap2";

type MACDData = {
  timestamp: number;
  macd: number;
  signal: number;
  histogram: number;
};

// 지수이동평균(EMA) 계산 함수
function calculateEMA(data: number[], period: number): number[] {
  const k = 2 / (period + 1);
  const ema: number[] = [];

  if (data.length === 0) return [];

  // 첫 번째 EMA는 단순이동평균으로 계산
  let sum = 0;
  const startPeriod = Math.min(period, data.length);
  for (let i = 0; i < startPeriod; i++) {
    sum += data[i];
  }
  ema.push(sum / startPeriod);

  // 나머지 EMA 계산
  for (let i = startPeriod; i < data.length; i++) {
    ema.push(data[i] * k + ema[ema.length - 1] * (1 - k));
  }

  return ema;
}

export function makeVWAPMACD(
  candleData: BybitKline[],
  longPeriod: number = 200,
  shortPeriod: number = 100,
  signalPeriod: number = 100
): MACDData[] {
  if (candleData.length === 0) return [];

  // 200일과 100일 VWAP 계산
  const vwapData200 = calculateProportionalVWAP(candleData, longPeriod);
  const vwapData100 = calculateProportionalVWAP(candleData, shortPeriod);
  // const vwapData200 = calculateMAVWAP(candleData, longPeriod, 1);
  // const vwapData100 = calculateMAVWAP(candleData, shortPeriod, 1);

  if (vwapData200.length === 0 || vwapData100.length === 0) return [];

  // 두 VWAP 데이터의 길이를 맞춤 (더 짧은 것에 맞춤)
  const minLength = Math.min(vwapData200.length, vwapData100.length);
  const startIndex200 = vwapData200.length - minLength;
  const startIndex100 = vwapData100.length - minLength;

  // VWAP-MACD 라인 계산 (100일 VWAP - 200일 VWAP)
  const macdLine: number[] = [];
  const timestamps: number[] = [];

  for (let i = 0; i < minLength; i++) {
    const vwap100 = vwapData100[startIndex100 + i].value;
    const vwap200 = vwapData200[startIndex200 + i].value;
    macdLine.push(vwap100 - vwap200);
    timestamps.push(vwapData100[startIndex100 + i].timestamp);
  }

  // 시그널 라인 계산 (MACD의 EMA)
  const signalLine = calculateEMA(macdLine, signalPeriod);

  // 히스토그램 계산 (MACD - 시그널)
  const histogram: number[] = [];
  const resultLength = Math.min(macdLine.length, signalLine.length);
  const macdStartIndex = macdLine.length - resultLength;

  for (let i = 0; i < resultLength; i++) {
    histogram.push(macdLine[macdStartIndex + i] - signalLine[i]);
  }

  // 결과 데이터 생성
  const result: MACDData[] = [];
  const timestampStartIndex = timestamps.length - resultLength;

  for (let i = 0; i < resultLength; i++) {
    result.push({
      timestamp: timestamps[timestampStartIndex + i],
      macd: macdLine[macdStartIndex + i],
      signal: signalLine[i],
      histogram: histogram[i],
    });
  }

  return result;
}
