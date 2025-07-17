export type BybitKline = {
  0: number; // startTime
  1: number; // openPrice
  2: number; // highPrice
  3: number; // lowPrice
  4: number; // closePrice
  5: number; // volume
  6: number; // turnover
  index?: number;
};
export type RSI = {
  timestamp: number;
  rsi: number;
  rsiMA?: number; // 이동평균선 값(옵션)
};

/**
 * RSI 계산 함수 (출력: RSI 객체 배열 + rsiMA)
 * @param klines BybitKline 배열 (시간순 정렬: 과거 → 최근)
 * @param period RSI 계산 기간 (기본값: 14)
 * @param maPeriod RSI 이동평균선 기간 (기본값: 5)
 * @returns RSI[] (period 이전 구간은 포함하지 않음)
 */
export function calculateRSI(
  klines: BybitKline[],
  period: number = 14,
  maPeriod: number = 3 // 추가: 이동평균선 기간
): RSI[] {
  if (klines.length < period + 1) return [];

  const closes = klines.map((k) => k[4]);
  const rsiArr: RSI[] = [];

  let gainSum = 0;
  let lossSum = 0;

  // 초기 period 구간의 상승/하락 합계 계산
  for (let i = 1; i <= period; i++) {
    const diff = closes[i] - closes[i - 1];
    if (diff >= 0) gainSum += diff;
    else lossSum -= diff;
  }

  let avgGain = gainSum / period;
  let avgLoss = lossSum / period;

  // 첫 번째 RSI 값 계산
  let rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
  let firstRSI = 100 - 100 / (1 + rs);
  rsiArr.push({
    timestamp: klines[period][0],
    rsi: firstRSI,
  });

  // 이후 RSI 값 계산 (Wilder's smoothing)
  for (let i = period + 1; i < closes.length; i++) {
    const diff = closes[i] - closes[i - 1];
    const gain = diff > 0 ? diff : 0;
    const loss = diff < 0 ? -diff : 0;

    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;

    rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    const rsi = 100 - 100 / (1 + rs);

    rsiArr.push({
      timestamp: klines[i][0],
      rsi: rsi,
    });
  }

  // RSI 이동평균선(MA) 계산
  for (let i = 0; i < rsiArr.length; i++) {
    if (i >= maPeriod - 1) {
      const sum = rsiArr.slice(i - maPeriod + 1, i + 1).reduce((acc, cur) => acc + cur.rsi, 0);
      rsiArr[i].rsiMA = sum / maPeriod;
    }
  }

  return rsiArr;
}

import { colors } from '../constants';

export function drawRSI(ctx: CanvasRenderingContext2D | null, rsiData: RSI[], x: any, y: any) {
  if (!ctx || rsiData.length === 0) return;

  const startX = x(new Date(rsiData[0].timestamp));
  const endX = x(new Date(rsiData[rsiData.length - 1].timestamp));

  // 영역 음영 (30-70)
  ctx.fillStyle = 'rgba(0, 255, 0, 0.01)'; // 반투명 초록색
  ctx.fillRect(startX, y(30), endX - startX, y(70) - y(30));

  // RSI 라인 그리기
  ctx.beginPath();
  ctx.moveTo(x(new Date(rsiData[0].timestamp)), y(rsiData[0].rsi));

  for (let i = 1; i < rsiData.length; i++) {
    ctx.lineTo(x(new Date(rsiData[i].timestamp)), y(rsiData[i].rsi));
  }

  ctx.strokeStyle = colors.blue;
  ctx.lineWidth = 1;
  ctx.stroke();

  // 이동평균선 그리기
  // ctx.beginPath();
  // ctx.moveTo(x(new Date(rsiData[0].timestamp)), y(rsiData[0].rsiMA));
  // for (let i = 1; i < rsiData.length; i++) {
  //   ctx.lineTo(x(new Date(rsiData[i].timestamp)), y(rsiData[i].rsiMA));
  // }
  // ctx.strokeStyle = colors.orange;
  // ctx.lineWidth = 1;
  // ctx.stroke();

  // 과매수 라인 (70) 그리기
  ctx.beginPath();
  ctx.moveTo(startX, y(70));
  ctx.lineTo(endX, y(70));
  ctx.strokeStyle = colors.green;
  ctx.lineWidth = 0.5;
  ctx.setLineDash([5, 5]);
  ctx.stroke();

  // 과매도 라인 (30) 그리기
  ctx.beginPath();
  ctx.moveTo(startX, y(30));
  ctx.lineTo(endX, y(30));
  ctx.strokeStyle = colors.green;
  ctx.lineWidth = 0.5;
  ctx.setLineDash([5, 5]);
  ctx.stroke();

  // 중간 라인 (50) 그리기
  // ctx.beginPath();
  // ctx.moveTo(startX, y(50));
  // ctx.lineTo(endX, y(50));
  // ctx.strokeStyle = colors.gray;
  // ctx.lineWidth = 0.5;
  // ctx.setLineDash([3, 3]);
  // ctx.stroke();

  // 라인 대시 리셋
  ctx.setLineDash([]);
}
