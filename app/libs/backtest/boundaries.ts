import { BybitKline } from "../../types/type";
import { colors } from "../constants";

export type Boundary = {
  timestamp: number;
  upper: number;
  lower: number;
  maxima: number; // 필터링된 최대값 개수
  minima: number; // 필터링된 최소값 개수
};

type LocalExtreme = {
  timestamp: number;
  price: number;
  index: number;
  type: "high" | "low";
};

/**
 * 국소 최대/최소값을 찾아서 추세선을 계산하고 예측하는 함수
 * @param candles BybitKline 배열
 * @param lookback 조사할 이전 캔들 개수 (기본값: 100)
 * @param localWindow 국소값을 찾을 범위 (기본값: 5)
 * @returns Boundary[] 배열
 */
export function calculateBoundaries(
  candles: BybitKline[],
  lookback: number = 100,
  localWindow: number = 5
): Boundary[] {
  if (candles.length < lookback + localWindow) return [];

  const boundaries: Boundary[] = [];

  // 각 캔들에 대해 경계선 계산
  for (let i = lookback; i < candles.length; i++) {
    const startIdx = Math.max(0, i - lookback);
    const endIdx = i;
    const windowCandles = candles.slice(startIdx, endIdx);

    // 국소 최대값들과 최소값들 찾기
    const localHighs = findLocalExtremes(windowCandles, localWindow, "high");
    const localLows = findLocalExtremes(windowCandles, localWindow, "low");

    // 추세선 계산 (이때 filterOutliers가 적용됨)
    const upperTrend = calculateTrendLine(localHighs, candles[i][0]);
    const lowerTrend = calculateTrendLine(localLows, candles[i][0]);

    // 필터링된 극값들의 개수 계산
    const filteredHighs = filterOutliers(localHighs);
    const filteredLows = filterOutliers(localLows);

    boundaries.push({
      timestamp: candles[i][0],
      upper: upperTrend,
      lower: lowerTrend,
      maxima: filteredHighs.length, // 아웃라이어 제거 후 남은 최대값 개수
      minima: filteredLows.length, // 아웃라이어 제거 후 남은 최소값 개수
    });
  }

  return boundaries;
}

/**
 * 국소 최대값 또는 최소값을 찾는 함수
 */
function findLocalExtremes(
  candles: BybitKline[],
  window: number,
  type: "high" | "low"
): LocalExtreme[] {
  const extremes: LocalExtreme[] = [];

  for (let i = window; i < candles.length - window; i++) {
    const currentPrice = candles[i][4]; // 종가 기준
    let isExtreme = true;

    // 좌우 window 범위에서 진짜 극값인지 확인
    for (let j = i - window; j <= i + window; j++) {
      if (j === i) continue;
      const comparePrice = candles[j][4]; // 종가 기준

      if (type === "high" && comparePrice > currentPrice) {
        isExtreme = false; // 더 높은 값이 있으면 극값 아님
        break;
      } else if (type === "low" && comparePrice < currentPrice) {
        isExtreme = false;
        break;
      }
    }

    if (isExtreme) {
      extremes.push({
        timestamp: candles[i][0],
        price: currentPrice,
        index: i,
        type: type,
      });
    }
  }

  return extremes;
}

/**
 * 국소 극값들을 이용해 추세선을 계산하고 미래값 예측
 */
function calculateTrendLine(
  extremes: LocalExtreme[],
  targetTimestamp: number
): number {
  if (extremes.length < 2) {
    return extremes.length > 0 ? extremes[0].price : 0;
  }

  // 아웃라이어 제거된 극값들 사용
  const filteredExtremes = filterOutliers(extremes);

  if (filteredExtremes.length < 2) {
    return extremes.length > 0 ? extremes[extremes.length - 1].price : 0;
  }

  // 최근 극값들 중 최대 3개만 사용
  const recentExtremes = filteredExtremes.slice(-3);

  // 선형 회귀를 이용한 추세선 계산
  const n = recentExtremes.length;
  let sumX = 0,
    sumY = 0,
    sumXY = 0,
    sumX2 = 0;

  for (const extreme of recentExtremes) {
    const x = extreme.timestamp;
    const y = extreme.price;
    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumX2 += x * x;
  }

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  // 목표 시간에서의 예상 가격
  const predictedPrice = slope * targetTimestamp + intercept;

  return predictedPrice;
}

/**
 * 추세에서 벗어나는 아웃라이어들을 제거하는 함수
 * 아웃라이어가 발견되면 그 시점부터의 값들을 사용 (아웃라이어 포함)
 */
function filterOutliers(extremes: LocalExtreme[]): LocalExtreme[] {
  if (extremes.length < 5) return extremes;

  const prices = extremes.map((e) => e.price);
  const mean = prices.reduce((sum, price) => sum + price, 0) / prices.length;

  // 표준편차 계산
  const variance =
    prices.reduce((sum, price) => sum + Math.pow(price - mean, 2), 0) /
    prices.length;
  const stdDev = Math.sqrt(variance);

  // 평균에서 2 표준편차 이내의 값들만 유지
  const threshold = 2 * stdDev;

  // 뒤에서부터 검사하여 첫 번째 아웃라이어를 찾음
  let lastValidIndex = extremes.length - 1;

  for (let i = extremes.length - 1; i >= 0; i--) {
    const deviation = Math.abs(extremes[i].price - mean);
    if (deviation > threshold) {
      // 아웃라이어 발견 - 이 시점부터의 값들을 사용 (아웃라이어 포함)
      lastValidIndex = i;
      break;
    }
  }

  // 아웃라이어부터 시작하는 값들 반환 (아웃라이어 포함)
  const filteredFromOutlier = extremes.slice(lastValidIndex);

  // 최소 3개의 포인트는 유지 (추세선 계산을 위해)
  if (filteredFromOutlier.length < 3) {
    // 아웃라이어가 너무 최근이면 최근 5개 값 사용
    return extremes.slice(-5);
  }

  return filteredFromOutlier;
}

/**
 * 경계선을 그리는 함수
 * @param ctx Canvas 컨텍스트
 * @param boundaries Boundary 데이터 배열
 * @param x x축 스케일 함수
 * @param y y축 스케일 함수
 */
export function drawBoundaries(
  ctx: CanvasRenderingContext2D | null,
  boundaries: Boundary[],
  x: any,
  y: any
) {
  if (!ctx || boundaries.length === 0) return;

  // 상한선 그리기
  ctx.beginPath();
  ctx.moveTo(x(new Date(boundaries[0].timestamp)), y(boundaries[0].upper));

  for (let i = 1; i < boundaries.length; i++) {
    ctx.lineTo(x(new Date(boundaries[i].timestamp)), y(boundaries[i].upper));
  }

  ctx.strokeStyle = colors.red;
  ctx.lineWidth = 1;
  ctx.setLineDash([3, 3]);
  ctx.stroke();

  // 하한선 그리기
  ctx.beginPath();
  ctx.moveTo(x(new Date(boundaries[0].timestamp)), y(boundaries[0].lower));

  for (let i = 1; i < boundaries.length; i++) {
    ctx.lineTo(x(new Date(boundaries[i].timestamp)), y(boundaries[i].lower));
  }

  ctx.strokeStyle = colors.green;
  ctx.lineWidth = 1;
  ctx.setLineDash([3, 3]);
  ctx.stroke();

  // 라인 대시 리셋
  ctx.setLineDash([]);
}
