import { BybitKline } from "../../types/type";
import { colors } from "../constants";

export type SAR = {
  timestamp: number;
  sar: number;
  isUptrend: boolean;
};

/**
 * Parabolic SAR 계산 함수
 * @param candleData BybitKline 배열 (시간순 정렬: 과거 → 최근)
 * @param af 초기 가속 팩터 (기본값: 0.02)
 * @param maxAF 최대 가속 팩터 (기본값: 0.2)
 * @returns SAR[] 배열
 */
export function calculateSAR(
  candleData: BybitKline[],
  af: number = 0.02,
  maxAF: number = 0.2
): SAR[] {
  if (candleData.length < 2) return [];

  const sarData: SAR[] = [];
  let isUptrend = candleData[1][4] > candleData[0][4]; // 두 번째 캔들이 첫 번째보다 높으면 상승 추세
  let sar = isUptrend ? candleData[0][3] : candleData[0][2]; // 상승 추세면 첫 번째 저점, 하락 추세면 첫 번째 고점
  let ep = isUptrend ? candleData[0][2] : candleData[0][3]; // 극값 (상승 추세면 고점, 하락 추세면 저점)
  let acceleration = af;

  // 첫 번째 SAR 값 추가
  sarData.push({
    timestamp: candleData[0][0],
    sar: sar,
    isUptrend: isUptrend,
  });

  for (let i = 1; i < candleData.length; i++) {
    const high = candleData[i][2];
    const low = candleData[i][3];
    const close = candleData[i][4];

    // 새로운 SAR 계산
    let newSar = sar + acceleration * (ep - sar);

    // 상승 추세에서 SAR이 최근 2개 캔들의 저점보다 높으면 조정
    if (isUptrend) {
      const prevLow = i > 0 ? candleData[i - 1][3] : low;
      const prevPrevLow = i > 1 ? candleData[i - 2][3] : prevLow;
      newSar = Math.min(newSar, prevLow, prevPrevLow);
    } else {
      // 하락 추세에서 SAR이 최근 2개 캔들의 고점보다 낮으면 조정
      const prevHigh = i > 0 ? candleData[i - 1][2] : high;
      const prevPrevHigh = i > 1 ? candleData[i - 2][2] : prevHigh;
      newSar = Math.max(newSar, prevHigh, prevPrevHigh);
    }

    // 추세 전환 확인
    if (isUptrend && low <= newSar) {
      // 상승 추세에서 하락 추세로 전환
      isUptrend = false;
      newSar = ep; // EP를 새로운 SAR로 설정
      ep = low; // 새로운 EP는 현재 저점
      acceleration = af; // 가속 팩터 초기화
    } else if (!isUptrend && high >= newSar) {
      // 하락 추세에서 상승 추세로 전환
      isUptrend = true;
      newSar = ep; // EP를 새로운 SAR로 설정
      ep = high; // 새로운 EP는 현재 고점
      acceleration = af; // 가속 팩터 초기화
    } else {
      // 추세 유지
      if (isUptrend && high > ep) {
        // 상승 추세에서 새로운 고점 발견
        ep = high;
        acceleration = Math.min(acceleration + af, maxAF);
      } else if (!isUptrend && low < ep) {
        // 하락 추세에서 새로운 저점 발견
        ep = low;
        acceleration = Math.min(acceleration + af, maxAF);
      }
    }

    sar = newSar;
    sarData.push({
      timestamp: candleData[i][0],
      sar: sar,
      isUptrend: isUptrend,
    });
  }

  return sarData;
}

/**
 * Parabolic SAR 그리기 함수
 * @param ctx Canvas 컨텍스트
 * @param sarData SAR 데이터 배열
 * @param x x축 스케일 함수
 * @param y y축 스케일 함수
 */
export function drawSAR(
  ctx: CanvasRenderingContext2D | null,
  sarData: SAR[],
  x: any,
  y: any
) {
  if (!ctx || sarData.length === 0) return;

  // 줌 레벨에 따라 동적으로 반지름 계산
  let pointRadius = 2;
  if (sarData.length > 1) {
    const firstX = x(new Date(sarData[0].timestamp));
    const secondX = x(new Date(sarData[1].timestamp));
    const pointSpacing = Math.abs(secondX - firstX);

    // 데이터 포인트 간격에 비례하여 반지름 조정 (최소 1, 최대 5)
    pointRadius = Math.max(1, Math.min(5, pointSpacing * 0.1));
  }

  for (let i = 0; i < sarData.length; i++) {
    const point = sarData[i];
    const xPos = x(new Date(point.timestamp));
    const yPos = y(point.sar);

    ctx.beginPath();
    ctx.arc(xPos, yPos, pointRadius, 0, 2 * Math.PI);

    // 상승 추세면 초록색, 하락 추세면 빨간색
    // ctx.fillStyle = point.isUptrend ? colors.green : colors.red;
    ctx.fillStyle = colors.blue;
    ctx.fill();

    // 선택적으로 테두리 추가
    // ctx.strokeStyle = point.isUptrend ? colors.green : colors.red;
    // ctx.strokeStyle = colors.blue;
    // ctx.lineWidth = 0.5;
    // ctx.stroke();
  }
}
