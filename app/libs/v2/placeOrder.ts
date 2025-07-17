import { BybitKline, Order, Position, IndicatorData } from "../../types/type";

type PlaceOrder = {
  timestamp: number;
  candle: BybitKline;
  candles: BybitKline[];
  position: Position | null;
  indicators: IndicatorData;
};

export function placeOrder({
  timestamp,
  candle,
  position,
  candles,
  indicators,
}: PlaceOrder): Array<Order> {
  const orders: Array<Order> = [];
  const { macd, rsi, vwapmacd, vwap, vwap2 } = indicators;
  const currentMACD = macd.find((d: any) => d.timestamp === timestamp)?.macd;
  const currentRSI = rsi.find((d: any) => d.timestamp === timestamp)?.rsi;
  const currentRSIIdx = rsi.findIndex((d: any) => d.timestamp === timestamp);
  const partRsi = rsi.slice(currentRSIIdx - 50, currentRSIIdx - 10);
  //   const currentVWAPMACD = vwapmacd.find((d: any) => d.timestamp === timestamp);
  const currentVWAP = vwap.find((d: any) => d.timestamp === timestamp)?.value;
  const currentVWAP2 = vwap2.find((d: any) => d.timestamp === timestamp)?.value;
  if (position === null) {
    if (currentRSI < 25) {
      const isTwice = partRsi.filter(
        (el: any, i: number) => el.rsi < 30 && partRsi[i - 1]?.rsi > 30
      ).length;
      //   const price = getPriceForTargetRSI(candles, 27);
      const isVWAPOverPrice = candle[4] + 300 < currentVWAP;
      if (isVWAPOverPrice) {
        const order = {
          id: timestamp + 1,
          side: "buy" as "buy",
          price: candle[4],
          timestamp,
          qty: 0.2,
          isTaker: false,
        };
        orders.push(order);
      }
    } else if (currentRSI > 70) {
      //   const price = getPriceForTargetRSI(candles, 70);
      //   const partRsi = rsi.slice(-50, -20);
      //   const isTwice = partRsi.filter(
      //     (el: any, i: number) => el.rsi > 70 && partRsi[i - 1].rsi < 70
      //   ).length;
      //   if (price && isTwice) {
      //     const order = {
      //       id: timestamp + 2,
      //       side: 'sell' as 'sell',
      //       price,
      //       timestamp,
      //       qty: 0.2,
      //       isTaker: false,
      //     };
      //     orders.push(order);
      //   }
    }
  } else if (position.side === "long") {
    if (currentRSI < 34 || position.lastTradePrice * 0.99 > candle[4]) {
      const lastTradeTime = position.lastTradeTime || position.timestamp;
      const elepsedTime = (timestamp - lastTradeTime) / 1000 / 60;
      if (
        elepsedTime > 20 ||
        (elepsedTime > 1 && position.lastTradePrice * 0.99 > candle[4])
      ) {
        //   if ( position.price * 0.99 > candle[4]) {
        const price = candle[4];
        // console.log('position', isTwice, price);
        const qty = position.qty <= 10 ? position.qty : 0.1;
        if (price && qty) {
          const order = {
            id: timestamp + 3,
            positionId: position.id,
            side: "buy" as "buy",
            price,
            timestamp,
            qty,
            isTaker: false,
          };
          orders.push(order);
        }
      }
    } else if (true) {
      const price = currentVWAP;
      if (price) {
        const order = {
          id: timestamp + 4,
          positionId: position.id,
          side: "close" as "close",
          price,
          timestamp,
          qty: position.qty,
          isTaker: false,
        };
        orders.push(order);
      }
    }
    if (position.qty > 3) {
      const price = Math.min(currentVWAP2, position.price * 1.0006);
      // if (position.qty > 6)
      //   console.log(
      //     "safe mode",
      //     position.price,
      //     position.qty,
      //     currentVWAP2,
      //     position.price * 1.0006
      //   );
      const order = {
        id: timestamp + 4,
        positionId: position.id,
        side: "close" as "close",
        price,
        timestamp,
        qty: position.qty,
        isTaker: false,
      };
      orders.push(order);
    }
  }
  return orders;
}
