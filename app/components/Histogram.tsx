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

export default function Histogram({
  historyList,
  width = 200,
  height = 200,
}: Props) {
  const divRef = React.useRef<HTMLDivElement>(null);
  const zoomRef = React.useRef<any>(d3.zoomIdentity);
  const { setSelectedTrade, selectedTrade } = useTradeStore();
  const histogram = React.useMemo(() => {
    const histogram = historyList.reduce((acc, curr) => {
      // 0.1 단위로 반올림
      const roundedProfit = Math.floor(curr.profit * 10) / 10;
      acc[roundedProfit] = (acc[roundedProfit] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);
    return histogram;
  }, [historyList]);

  React.useEffect(() => {
    if (!divRef.current || historyList.length === 0) return;

    const svgLayout = d3
      .select(divRef.current)
      .append("svg")
      .attr("viewBox", `0 0 ${width + 40} ${height + 25}`);

    // 차트 그룹 생성하여 패딩 적용
    const svg = svgLayout.append("g").attr("transform", "translate(25, 0)");

    const profitMin = Math.min(...Object.keys(histogram).map(Number)) - 0.3;
    const profitMax = Math.max(...Object.keys(histogram).map(Number)) + 0.3;
    const x = d3
      .scaleLinear()
      .domain([profitMin, profitMax])
      .range([0, width])
      .nice();

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(Object.values(histogram))! + 0.5])
      .range([height, 0])
      .nice();

    // x축 생성
    const xAxis = d3
      .axisBottom(x)
      .ticks(10)
      .tickFormat((d) => String(d));

    // y축 생성
    const yAxis = d3.axisLeft(y).tickFormat((d) => {
      if (d === 0 || !Number.isInteger(d)) return "";
      return String(d);
    });

    // 축 추가
    const xAxisGroup = svg
      .append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(xAxis);
    const yAxisGroup = svg.append("g").call(yAxis);
    xAxisGroup.selectAll("line").remove();
    yAxisGroup.selectAll("line").remove();
    svg
      .selectAll(".tick line")
      .style("stroke", colors.gray)
      .style("stroke-width", 0.2);
    svg
      .selectAll(".domain")
      .style("stroke", colors.gray)
      .style("stroke-width", 2);
    svg
      .selectAll(".tick text")
      .style("font-size", "10px")
      .style("fill", colors.gray);

    // 히스토그램 바 생성
    const barWidth = (x(0.1) - x(0)) * 0.9;

    svg
      .selectAll("rect")
      .data(Object.entries(histogram))
      .enter()
      .append("rect")
      .attr("x", (d) => x(Number(d[0])) + barWidth * 0.05)
      .attr("y", (d) => y(d[1]))
      .attr("width", barWidth)
      .attr("height", (d) => height - y(d[1]))
      .attr("fill", colors.blue)
      .on("mouseover", function (event, d) {
        // d3.select(this).attr('fill', colors.green);
      })
      .on("mousemove", function (event) {})
      .on("mouseout", function () {
        // d3.select(this).attr('fill', colors.blue);
      });

    return () => {
      if (divRef.current) {
        d3.select(divRef.current).selectAll("*").remove();
      }
    };
  }, [historyList, width, height, histogram]);

  return <div className="w-1/2 h-full relative " ref={divRef}></div>;
}
