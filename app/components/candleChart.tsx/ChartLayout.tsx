"use client";
import * as React from "react";
import * as d3 from "d3";
import {
  createBaseLine,
  createGuideLines,
  createIndicators,
} from "../../libs/D3/candlesChart";
import Draw from "./Draw";
// import Update from "./Update";
import { colors } from "../../libs/constants";
import { BybitKline, IndicatorData, TradingHistory } from "../../types/type";

type Props = {
  initialWidth?: number;
  height?: number;
  candleData: BybitKline[];
  indicators: IndicatorData;
  tradingHistory?: TradingHistory[];
};

export default function ChartLayout({
  initialWidth = 500,
  height = 600,
  candleData,
  indicators,
  tradingHistory,
}: Props) {
  const svgRef = React.useRef<SVGSVGElement>(null);
  const [renderComplete, setRenderComplete] = React.useState(false);
  const candleChartHeightRatio = 0.5;
  const macdChartHeightRatio = 0.625;
  const macd2ChartHeightRatio = 0.75;
  const rsiChartHeightRatio = 0.875;

  React.useEffect(() => {
    if (!svgRef.current) return;

    setRenderComplete(false);

    const svg = d3
      .select(svgRef.current)
      .attr("class", "bg-bgPrimary")
      .attr("width", initialWidth)
      .attr("height", height + 20)
      .attr("border", "1px solid steelblue");

    const width = initialWidth - 20;
    const { gray } = colors;

    createBaseLine(
      svg,
      width,
      height,
      candleChartHeightRatio,
      macdChartHeightRatio,
      macd2ChartHeightRatio,
      rsiChartHeightRatio
    );

    d3.scaleTime()
      .domain([
        new Date(Number(candleData[0][0])),
        new Date(Number(candleData[candleData.length - 1][0])),
      ])
      .range([Math.min(0, width - initialWidth), width]);

    svg
      .append("g")
      .attr("class", "y-volume-axis")
      .attr("transform", `translate(${width}, 0)`)
      .style("color", gray);

    svg
      .append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0, ${height})`)
      .style("color", gray);

    svg
      .append("g")
      .attr("class", "y-axis")
      .attr("transform", `translate(${width}, 0)`)
      .style("color", gray);

    // MACD, MACD2, RSI 축 그룹 생성
    svg
      .append("g")
      .attr("class", "y-macd-axis")
      .attr(
        "transform",
        `translate(${width}, ${height * candleChartHeightRatio})`
      )
      .style("color", gray);

    svg
      .append("g")
      .attr("class", "y-macd2-axis")
      .attr(
        "transform",
        `translate(${width}, ${height * macdChartHeightRatio})`
      )
      .style("color", gray);

    svg
      .append("g")
      .attr("class", "y-rsi-axis")
      .attr(
        "transform",
        `translate(${width}, ${height * macd2ChartHeightRatio})`
      )
      .style("color", gray);

    // text on left-top
    svg
      .append("text")
      .attr("class", "candle-info")
      .attr("x", 10)
      .attr("y", 20)
      .style("font-size", "16px")
      .style("fill", gray)
      .style("text-anchor", "start");
    //
    svg
      .append("text")
      .text("MACD")
      .attr("class", "macd-title")
      .attr("x", 0)
      .attr("y", height * candleChartHeightRatio + 10)
      .style("font-size", "10px")
      .style("fill", gray)
      .style("text-anchor", "start");
    svg
      .append("text")
      .attr("class", "macd-text")
      .attr("x", 65)
      .attr("y", height * candleChartHeightRatio + 10)
      .style("font-size", "10px")
      .style("fill", gray)
      .style("text-anchor", "end");
    svg
      .append("text")
      .text("VWAP-MACD")
      .attr("class", "macd2-title")
      .attr("x", 0)
      .attr("y", height * macdChartHeightRatio + 10)
      .style("font-size", "10px")
      .style("fill", gray)
      .style("text-anchor", "start");
    svg
      .append("text")
      .text("VWAP-MACD")
      .attr("class", "macd2-text")
      .attr("x", 100)
      .attr("y", height * macdChartHeightRatio + 10)
      .style("font-size", "10px")
      .style("fill", gray)
      .style("text-anchor", "end");

    svg
      .append("text")
      .text("RSI")
      .attr("class", "rsi-title")
      .attr("x", 0)
      .attr("y", height * macd2ChartHeightRatio + 10)
      .style("font-size", "10px")
      .style("fill", gray)
      .style("text-anchor", "start");

    svg
      .append("text")
      .attr("class", "rsi-text")
      .attr("x", 50)
      .attr("y", height * macd2ChartHeightRatio + 10)
      .style("font-size", "10px")
      .style("fill", gray)
      .style("text-anchor", "end");

    svg
      .append("text")
      .text("Volume")
      .attr("class", "volume-text")
      .attr("x", 0)
      .attr("y", height * rsiChartHeightRatio + 10)
      .style("font-size", "10px")
      .style("fill", gray)
      .style("text-anchor", "start");

    createGuideLines(svg);
    createIndicators(svg, width, height, 1);

    setTimeout(() => setRenderComplete(true), 0);

    return () => {
      svg.selectAll("*").remove();
      setRenderComplete(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="h-[600px]">
      <svg ref={svgRef} />
      {renderComplete && (
        <Draw
          svgRef={svgRef}
          candleData={candleData}
          height={height}
          candleChartHeightRatio={candleChartHeightRatio}
          macdChartHeightRatio={macdChartHeightRatio}
          macd2ChartHeightRatio={macd2ChartHeightRatio}
          rsiChartHeightRatio={rsiChartHeightRatio}
          indicators={indicators}
          tradingHistory={tradingHistory}
        />
      )}
      {/* {renderComplete && (
        <Update
          svgRef={svgRef}
          candleData={candleData}
          height={height}
          width={initialWidth}
        />
      )} */}
      {/* {renderComplete && (
        <BackTest svgRef={svgRef} candleData={candleData} height={height} width={initialWidth} />
      )} */}
    </div>
  );
}
