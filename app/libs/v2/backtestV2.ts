import { BybitKline, IndicatorData, Position } from "../../types/type";
import { placeOrder } from "./placeOrder";
import { execution } from "./execution";
import { makeHistory } from "./makeHistory";

export function backtestV2(
  candleData: BybitKline[],
  indicators: IndicatorData
) {
  let position: Position = null;
  const history: Array<any> = [];
  for (const candle of candleData) {
    const timestamp = candle[0];
    const orders = placeOrder({
      timestamp,
      candle,
      candles: candleData,
      position,
      indicators,
    });
    const res = execution(candle, orders, position);

    // if executed order, make history
    if (res?.ok) {
      position = res.position;
      history.push(res.execution);
    }
  }
  return history;
}
