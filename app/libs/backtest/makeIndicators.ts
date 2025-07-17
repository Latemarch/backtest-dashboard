import { BybitKline } from "../../types/type";
import { calculateBollingerBands } from "../D3/bollingerBands";
import { calculateMACD } from "../D3/macd";
import { calculateMovingAverage } from "../D3/movingAgerage";
import { calculateBoundaries } from "./boundaries";
import { calculateSAR } from "./parabolicSAR";
import { calculateRSI } from "./rsi";
import { calculateProportionalVWAP } from "./vwap2";
import { makeVWAPMACD } from "./vwapmacd";

export function makeIndicators(candleData: BybitKline[]) {
  const ma5 = calculateMovingAverage(candleData, 50);
  const ma10 = calculateMovingAverage(candleData, 100);
  const ma20 = calculateMovingAverage(candleData, 200);
  const bollingerBands = calculateBollingerBands(candleData, 20);
  const vwap = calculateProportionalVWAP(candleData, 120);
  const vwap2 = calculateProportionalVWAP(candleData, 60);
  const rsi = calculateRSI(candleData, 18, 3);
  const macd = calculateMACD(candleData);
  const vwapmacd = makeVWAPMACD(candleData, 200, 100, 25);
  const sar = calculateSAR(candleData, 0.005, 0.05);
  const boundaries = calculateBoundaries(candleData, 60, 3);

  return {
    macd,
    ma5,
    ma10,
    ma20,
    bollingerBands,
    vwap,
    vwap2,
    vwapmacd,
    rsi,
    sar,
    boundaries,
  };
}
