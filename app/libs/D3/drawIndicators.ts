import { drawBollingerBands } from "./bollingerBands";
import { drawMACD } from "./macd";
import { drawMovingAverage } from "./movingAgerage";
import { drawVWAP } from "./VWAP";
import { IndicatorData } from "../../types/type";
import { colors } from "../constants";
import { drawRSI } from "../backtest/rsi";
import { drawSAR } from "../backtest/parabolicSAR";
import { drawBoundaries } from "../backtest/boundaries";

export function drawIndicators({
  ctx,
  indicators,
  x,
  yMACD,
  yMACD2,
  yRSI,
  y,
  activeWidth,
}: {
  ctx: CanvasRenderingContext2D | null;
  indicators: IndicatorData;
  x: d3.ScaleTime<number, number>;
  yMACD: d3.ScaleLinear<number, number>;
  yMACD2: d3.ScaleLinear<number, number>;
  yRSI: d3.ScaleLinear<number, number>;
  y: d3.ScaleLinear<number, number>;
  activeWidth: number;
}) {
  if (!ctx) return;
  if (indicators.macd) {
    drawMACD(ctx, indicators.macd, x, yMACD, yMACD(0), activeWidth);
    drawMACD(ctx, indicators.vwapmacd, x, yMACD2, yMACD2(0), activeWidth);
  }

  if (indicators.ma5) {
    drawMovingAverage(ctx, indicators.ma5, x, y, colors.red);
  }

  if (indicators.ma10) {
    drawMovingAverage(ctx, indicators.ma10, x, y, colors.blue);
  }

  if (indicators.ma20) {
    drawMovingAverage(ctx, indicators.ma20, x, y, colors.green);
  }

  if (indicators.bollingerBands) {
    drawBollingerBands(ctx, indicators.bollingerBands, x, y, colors.green);
  }

  if (indicators.vwap) {
    drawVWAP(ctx, indicators.vwap, x, y, colors.purple);
    drawVWAP(ctx, indicators.vwap2, x, y, colors.green);
  }
  if (indicators.rsi) {
    drawRSI(ctx, indicators.rsi, x, yRSI);
  }
  if (indicators.sar) {
    drawSAR(ctx, indicators.sar, x, y);
  }
  if (indicators.boundaries) {
    console.log("boundaries", indicators.boundaries);
    drawBoundaries(ctx, indicators.boundaries, x, y);
  }
}
