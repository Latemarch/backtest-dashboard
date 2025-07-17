import { TradingHistory } from "../../types/type";

export function makeHistoryList(history: TradingHistory[]) {
  const list: HistoryList = [];
  let openPrice = 0;
  let openTime = 0;
  let dcaCount = 0;
  let side = "buy";
  console.log(history);
  for (const item of history) {
    if (item.side === "close") {
      const positionPrice = item.positionPrice;
      const profit =
        side === "buy"
          ? item.price - positionPrice
          : positionPrice - item.price;
      list.push({
        side: side,
        openPrice: positionPrice.toFixed(2),
        closePrice: item.price.toFixed(2),
        openTime: makeFormattedDate(openTime),
        closeTime: makeFormattedDate(item.timestamp),
        profit: ((profit / positionPrice) * 100 - 0.05) * item.qty,
        profitRate: (profit / positionPrice) * 100 - 0.05,
        id: item.id,
        holdingPeriod: item.timestamp - openTime,
        openTimeStamp: openTime,
        closeTimeStamp: item.timestamp,
        qty: item.qty,
      });
      dcaCount = 0;
    } else {
      side = item.side;
      if (dcaCount === 0) openTime = item.timestamp;
      dcaCount += 1;
    }
  }
  return list;
}

export type HistoryList = Array<{
  id: number;
  side: string;
  openPrice: string;
  closePrice: string;
  openTime: string;
  closeTime: string;
  profit: number;
  profitRate: number;
  qty?: number;
  liq?: boolean;
  holdingPeriod: number;
  openTimeStamp: number;
  closeTimeStamp: number;
}>;
export function makeFormattedDate(timestamp: number) {
  const date = new Date(timestamp);
  const formattedDate =
    date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
    }) +
    " " +
    date.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  return formattedDate;
}
