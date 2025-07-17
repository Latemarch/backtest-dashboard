import { TradingHistory } from "../../types/type";
import { colors } from "../constants";

export function drawMarkers(
  ctx: CanvasRenderingContext2D | null,
  tradingHistory: TradingHistory[],
  x: any,
  y: any
) {
  if (!ctx || !tradingHistory.length) return;

  const markerSize = 20;

  tradingHistory.forEach((trade) => {
    const xPos = x(new Date(trade.timestamp));
    const yPos = y(trade.price);

    ctx.save();

    // if (trade.side === 'close') {
    //   // 동그라미 (close)
    //   ctx.beginPath();
    //   ctx.arc(xPos, yPos, markerSize / 2, 0, 2 * Math.PI);
    //   ctx.fillStyle = colors.yellow;
    //   ctx.strokeStyle = '#000000';
    //   ctx.lineWidth = 2;
    //   ctx.fill();
    //   ctx.stroke();
    // } else
    if (trade.side === "buy" || trade.liqSide === "short") {
      // 삼각형 (buy - long 포지션)
      ctx.beginPath();
      ctx.moveTo(xPos, yPos);
      ctx.lineTo(xPos - markerSize / 2, yPos + markerSize);
      ctx.lineTo(xPos + markerSize / 2, yPos + markerSize);
      ctx.closePath();
      ctx.fillStyle = colors.green;
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 2;
      ctx.fill();
      ctx.stroke();
    } else if (trade.side === "sell" || trade.liqSide === "long") {
      // 역삼각형 (sell - short 포지션)
      ctx.beginPath();
      ctx.moveTo(xPos, yPos);
      ctx.lineTo(xPos - markerSize / 2, yPos - markerSize);
      ctx.lineTo(xPos + markerSize / 2, yPos - markerSize);
      ctx.closePath();
      ctx.fillStyle = colors.red;
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 2;
      ctx.fill();
      ctx.stroke();
    }

    ctx.restore();
  });
}
