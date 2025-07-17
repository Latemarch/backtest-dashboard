import { BybitKline, Order, Position, PositionV2 } from "../../types/type";

export function execution(
  candle: BybitKline,
  orders: Array<Order>,
  position: Position
) {
  for (const order of orders) {
    const result = executionOrder(candle, order, position);
    if (result?.ok) {
      return result;
    }
  }
  return null;
}

function executionOrder(
  candle: BybitKline,
  order: Order,
  position: Position
): { ok: boolean; execution: any; position: Position } | null {
  if (!order) return null;
  const { side, price, timestamp, qty, id, SL, TP } = order;
  if (side === "buy") {
    if (candle[3] < price) {
      if (position) {
        if (position.side === "long") {
          return {
            ok: true,
            execution: {
              id,
              side,
              price: Math.min(candle[1], price),
              qty,
              timestamp: candle[0],
              taker: false,
            },
            position: {
              ...position,
              price:
                (Math.min(candle[1], price) * qty +
                  position.price * position.qty) /
                (position.qty + qty),
              qty: position.qty + qty,
              lastTradeTime: candle[0],
              lastTradePrice: price,
            },
          };
        } else if (position.side === "short") {
          return {
            ok: true,
            execution: {
              id,
              side,
              price: Math.min(candle[1], price),
              qty,
              timestamp: candle[0],
              taker: false,
            },
            position: {
              ...position,
              qty: position.qty - qty,
              lastTradeTime: candle[0],
              lastTradePrice: price,
            },
          };
        }
      } else {
        return {
          ok: true,
          execution: {
            id,
            side,
            price: Math.min(candle[1], price),
            qty,
            timestamp: candle[0],
            taker: false,
            SL: SL ? Number((price * (1 - SL)).toFixed(1)) : undefined,
            TP: TP ? Number((price * (1 + TP)).toFixed(1)) : undefined,
          },
          position: {
            id,
            side: "long",
            timestamp: candle[0],
            price: Math.min(candle[1], price),
            taker: false,
            qty,
            SL: SL ? Number((price * (1 - SL)).toFixed(1)) : undefined,
            TP: TP ? Number((price * (1 + TP)).toFixed(1)) : undefined,
            lastTradeTime: candle[0],
            lastTradePrice: price,
          },
        };
      }
    }
  } else if (side === "sell") {
    if (candle[2] > price) {
      if (position) {
        if (position.side === "short") {
          return {
            ok: true,
            execution: {
              id,
              side,
              price: Math.max(candle[1], price),
              qty,
              timestamp: candle[0],
              taker: false,
            },
            position: {
              ...position,
              price:
                (Math.max(candle[1], price) * qty +
                  position.price * position.qty) /
                (position.qty + qty),
              qty: position.qty + qty,
              lastTradeTime: candle[0],
              lastTradePrice: price,
            },
          };
        } else if (position.side === "long") {
          return {
            ok: true,
            execution: {
              id,
              side,
              price: Math.max(candle[1], price),
              qty,
              timestamp: candle[0],
              taker: false,
            },
            position: {
              ...position,
              qty: position.qty - qty,
              lastTradeTime: candle[0],
              lastTradePrice: price,
            },
          };
        }
      } else {
        return {
          ok: true,
          execution: {
            id,
            side,
            price: Math.max(candle[1], price),
            qty,
            timestamp: candle[0],
            taker: false,
            SL: SL ? Number((price * (1 - SL)).toFixed(1)) : undefined,
            TP: TP ? Number((price * (1 + TP)).toFixed(1)) : undefined,
          },
          position: {
            id,
            side: "short",
            timestamp: candle[0],
            price: Math.max(candle[1], price),
            taker: false,
            qty,
            SL: SL ? Number((price * (1 - SL)).toFixed(1)) : undefined,
            TP: TP ? Number((price * (1 + TP)).toFixed(1)) : undefined,
            lastTradeTime: candle[0],
            lastTradePrice: price,
          },
        };
      }
    }
  } else if (side === "close" && position) {
    if (position.side === "long" && candle[2] > price) {
      return {
        ok: true,
        execution: {
          id,
          side,
          liqSide: position.side,
          price: Math.max(price, candle[1]),
          positionPrice: position.price,
          qty,
          timestamp: candle[0],
          taker: false,
        },
        position: null,
      };
    } else if (position.side === "short" && candle[3] < price) {
      return {
        ok: true,
        execution: {
          id,
          side,
          liqSide: position.side,
          price: Math.max(price, candle[1]),
          qty,
          timestamp: candle[0],
          taker: false,
        },
        position: null,
      };
    }
  }
  return null;
}

function executionPosition(candle: BybitKline, position: Position) {
  return [];
}
