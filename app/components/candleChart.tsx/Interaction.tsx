"use client";

import React from "react";
import { useTradeStore } from "../../store/tradeStore";
import * as d3 from "d3";

export default function Interaction({
  svgRef,
}: {
  svgRef: React.RefObject<SVGSVGElement>;
}) {
  const { selectedTradeInfo } = useTradeStore();
  React.useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
  }, [selectedTradeInfo, svgRef]);
  return <div></div>;
}

export function drawTradeRect(
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  x: d3.ScaleTime<number, number>,
  y: d3.ScaleLinear<number, number>,
  selectedTradeInfo: any
) {
  if (!selectedTradeInfo) return;
  svg.selectAll(".trade-rect, .trade-info").remove();

  const interactionRect = svg.append("rect").attr("class", "trade-rect");

  // 시작점과 끝점 계산
  const startX = x(selectedTradeInfo.openTimeStamp);
  const endX = x(selectedTradeInfo.closeTimeStamp);

  // y 스케일의 전체 범위를 가져옵니다
  const yRange = y.range();
  const minY = Math.min(...yRange);
  const maxY = Math.max(...yRange);

  // 사각형 속성 설정
  interactionRect
    .attr("x", Math.min(startX, endX))
    .attr("y", minY)
    .attr("width", Math.abs(endX - startX))
    .attr("height", maxY - minY)
    .attr(
      "fill",
      selectedTradeInfo.side === "buy"
        ? "rgba(0, 255, 0, 0.1)"
        : "rgba(255, 0, 0, 0.1)"
    )
    .attr(
      "stroke",
      selectedTradeInfo.side === "buy"
        ? "rgba(0, 255, 0, 0.5)"
        : "rgba(255, 0, 0, 0.5)"
    )
    .attr("stroke-width", 0)
    .attr("pointer-events", "none")
    .attr("cursor", "pointer");

  // 거래 정보 텍스트 추가
  const tradeInfo = svg
    .append("text")
    .attr("class", "trade-info")
    .attr("x", Math.min(startX, endX) + 5)
    .attr("y", minY + 40)
    .attr(
      "fill",
      selectedTradeInfo.side === "buy"
        ? "rgba(0, 255, 0, 1)"
        : "rgba(255, 0, 0, 1)"
    )
    .attr("font-size", "12px")
    .attr("font-weight", "bold")
    .attr("pointer-events", "none");

  // 거래 정보 텍스트 내용 추가
  tradeInfo
    .append("tspan")
    .text(`side: ${selectedTradeInfo.side === "buy" ? "long" : "short"}`)
    .attr("x", Math.min(startX, endX) + 10)
    .attr("dy", "0");

  tradeInfo
    .append("tspan")
    .text(`open price: ${selectedTradeInfo.openPrice}`)
    .attr("x", Math.min(startX, endX) + 10)
    .attr("dy", "20");

  tradeInfo
    .append("tspan")
    .text(`close price: ${selectedTradeInfo.closePrice}`)
    .attr("x", Math.min(startX, endX) + 10)
    .attr("dy", "20");

  tradeInfo
    .append("tspan")
    .text(`profit: ${selectedTradeInfo.profit.toFixed(2)}%`)
    .attr("x", Math.min(startX, endX) + 10)
    .attr("dy", "20");
}
