"use client";

import { HistoryList, makeHistoryList } from "../libs/backtest/history";
import { colors } from "../libs/constants";
import { useTradeStore } from "../store/tradeStore";
import { TradingHistory } from "../types/type";
import * as d3 from "d3";
import * as React from "react";

type Props = {
  width?: number;
  height?: number;
  historyList: HistoryList;
};

export default function ScatterChart({
  historyList,
  width = 200,
  height = 200,
}: Props) {
  const divRef = React.useRef<HTMLDivElement>(null);
  const zoomRef = React.useRef<any>(d3.zoomIdentity);
  const { setSelectedTrade, selectedTrade } = useTradeStore();

  React.useEffect(() => {
    if (!divRef.current || historyList.length === 0) return;

    // 툴크 div 생성
    const tooltip = d3
      .select(divRef.current)
      .append("div")
      .attr("class", "tooltip")
      .style("position", "absolute")
      .style("visibility", "hidden")
      .style("background-color", "white")
      .style("border", "1px solid #ddd")
      .style("padding", "8px")
      .style("border-radius", "4px")
      .style("font-size", "12px")
      .style("pointer-events", "none");

    const svg = d3
      .select(divRef.current)
      .append("svg")
      .attr("viewBox", `0 0 ${width + 25} ${height}`);

    // 차트 그룹 생성하여 패딩 적용
    const chartGroup = svg.append("g").attr("transform", "translate(25, 0)");

    // 클리핑 패스 정의
    const clipPath = svg
      .append("defs")
      .append("clipPath")
      .attr("id", "chart-clip")
      .append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", width)
      .attr("height", height);

    // chartGroup에 클리핑 적용
    // chartGroup.attr('clip-path', 'url(#chart-clip)');

    const maxHoldingPeriod = Math.max(
      ...historyList.map((item) => item.holdingPeriod)
    );

    // 원본 스케일 저장
    const originalX = d3
      .scaleLinear()
      .domain([0, maxHoldingPeriod])
      .range([0, width]);
    const originalY = d3
      .scaleLinear()
      .domain([
        -Math.max(...historyList.map((item) => Math.abs(item.profit))) * 1.1,
        Math.max(...historyList.map((item) => Math.abs(item.profit))) * 1.1,
      ])
      .range([height, 0]);

    //

    // 초기 렌더링
    renderChart({
      historyList,
      xScale: originalX,
      yScale: originalY,
      chartGroup,
      height,
      width,
      setSelectedTrade,
      selectedTrade,
    });

    // 줌 이벤트 핸들러
    const handleZoom = (event: any) => {
      const { transform } = event;
      zoomRef.current = transform;

      // 스케일 업데이트
      const newX = transform.rescaleX(originalX);
      const newY = transform.rescaleY(originalY);

      // 차트 다시 렌더링
      renderChart({
        historyList,
        xScale: newX,
        yScale: newY,
        chartGroup,
        height,
        width,
        setSelectedTrade,
        selectedTrade,
      });
    };

    // 줌 설정 - x축 마이너스 값 제한
    const zoom = d3
      .zoom()
      .scaleExtent([0.5, 10])
      .translateExtent([
        [0, -Infinity],
        [width, Infinity],
      ])
      .extent([
        [0, 0],
        [width, height],
      ])
      .on("zoom", handleZoom);

    // 줌 적용
    svg.call(zoom as any);

    return () => {
      if (divRef.current) {
        d3.select(divRef.current).selectAll("*").remove();
      }
    };
  }, [historyList, width, height]);

  React.useEffect(() => {
    const tooltipText = d3
      .select(divRef.current)
      .select(".tooltip-text")
      .style("visibility", "hidden");
    const dataGroup = d3.select(divRef.current).select(".data-group");

    if (selectedTrade) {
      const circles = dataGroup.selectAll("circle");
      circles.style("stroke", "black");
      const selectedCircle = circles.filter((d: any) => d.id === selectedTrade);
      selectedCircle.style("stroke", "white");
      const selectedData = historyList.find((d) => d.id === selectedTrade);

      if (selectedData) {
        tooltipText.style("visibility", "visible");
        tooltipText.selectAll("*").remove();
        tooltipText
          .append("tspan")
          .attr("x", 10)
          .text(
            `Period ${String(
              Math.floor(selectedData.holdingPeriod / 60000 / 60)
            ).padStart(2, "0")}:${String(
              Math.floor((selectedData.holdingPeriod / 60000) % 60)
            ).padStart(2, "0")}`
          );
        tooltipText
          .append("tspan")
          .attr("x", 10)
          .attr("dy", "1.2em")
          .text(`Profit ${selectedData.profit.toFixed(2)}%`);
      }
    }
  }, [selectedTrade]);

  return <div className="w-1/2 h-full relative" ref={divRef}></div>;
}
// 렌더링 함수
const renderChart = ({
  historyList,
  xScale,
  yScale,
  chartGroup,
  height,
  width,
  setSelectedTrade,
  selectedTrade,
}: {
  historyList: HistoryList;
  xScale: any;
  yScale: any;
  chartGroup: any;
  height: number;
  width: number;
  setSelectedTrade: (tradeId: number) => void;
  selectedTrade?: number;
}) => {
  // 기존 차트 요소들 제거
  chartGroup.selectAll("*").remove();

  const tooltipText = chartGroup
    .append("text")
    .attr("class", "tooltip-text")
    .attr("x", 10)
    .attr("y", 10)
    .style("font-size", "12px")
    .style("fill", colors.gray)
    .style("text-anchor", "start")
    .style("visibility", "hidden");

  const xAxis = d3
    .axisBottom(xScale)
    .tickSizeInner(-height)
    .ticks(5)
    // .tickSizeOuter(0)
    .tickPadding(-height / 2 + 5)
    .tickFormat((d: any) => {
      if (d === 0) return "";
      const mm = Math.floor(d / 60000 / 60);
      const ss = Math.floor((d / 60000) % 60);
      return `${mm}:${ss.toString()}`;
    });

  const yAxis = d3
    .axisLeft(yScale)
    .tickSizeInner(-width)
    .tickPadding(3)
    .ticks(5);

  const xAxisGroup = chartGroup
    .append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(xAxis);
  const yAxisGroup = chartGroup
    .append("g")
    .attr("transform", "translate(0, 0)")
    .call(yAxis);

  xAxisGroup.selectAll("path").remove();
  yAxisGroup.selectAll("path").remove();
  chartGroup
    .selectAll(".tick line")
    .style("stroke", colors.gray)
    .style("stroke-width", 0.2);
  chartGroup
    .selectAll(".tick text")
    .style("font-size", "10px")
    .style("fill", colors.gray);

  // 축선 그리기
  chartGroup
    .append("line")
    .attr("x1", 0)
    .attr("x2", width)
    .attr("y1", height / 2)
    .attr("y2", height / 2)
    .style("stroke", colors.gray)
    .style("stroke-width", 2);

  chartGroup
    .append("line")
    .attr("x1", 0)
    .attr("x2", 0)
    .attr("y1", 0)
    .attr("y2", height)
    .style("stroke", colors.gray)
    .style("stroke-width", 2);

  // 데이터 포인트 그리기
  const dataGroup = chartGroup
    .append("g")
    .attr("class", "data-group")
    .attr("clip-path", "url(#chart-clip)");
  const scatter = dataGroup.selectAll("circle").data(historyList);
  scatter
    .enter()
    .append("circle")
    .style("fill", (d: any) => (d.side === "buy" ? colors.green : colors.red))
    .style("stroke", "black")
    .attr("stroke-width", 0.5)
    .attr("cx", (d: any) => xScale(d.holdingPeriod))
    .attr("cy", (d: any) => yScale(d.profit))
    .attr("r", 4)
    .on("mouseover", function (this: SVGCircleElement, event: any, d: any) {
      d3.select(this).style("stroke", "white");
      tooltipText.style("visibility", "visible");
      tooltipText.selectAll("*").remove();
      tooltipText
        .append("tspan")
        .attr("x", 10)
        .text(
          `Period ${String(Math.floor(d.holdingPeriod / 60000)).padStart(
            2,
            "0"
          )}:${String(Math.floor((d.holdingPeriod % 60000) / 1000)).padStart(
            2,
            "0"
          )}`
        );
      tooltipText
        .append("tspan")
        .attr("x", 10)
        .attr("dy", "1.2em")
        .text(`Profit ${d.profit.toFixed(2)}%`);
      setSelectedTrade(d.id);
    })
    .on("mouseout", function (this: SVGCircleElement) {
      d3.select(this).style("stroke", "black");
      setSelectedTrade(0);
    });

  // selectedTrade와 일치하는 scatter에 마우스오버 효과 적용
};
