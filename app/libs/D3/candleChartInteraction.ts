import * as d3 from "d3";
import { writeCandleInfo } from "./candlesChart";
import { updateGuideLines } from "./candlesChart";
import { BybitKline, IndicatorData } from "../../types/type";
import { colors } from "../constants";

export function handleMouseMove({
  event,
  y,
  yVolume,
  yMACD,
  yMACD2,
  yRSI,
  width,
  height,
  candleChartHeightRatio,
  macdChartHeightRatio,
  macd2ChartHeightRatio,
  rsiChartHeightRatio,
  svg,
  data,
  x,
  indicators,
}: {
  event: any;
  y: d3.ScaleLinear<number, number>;
  x: d3.ScaleTime<number, number>;
  yVolume: d3.ScaleLinear<number, number>;
  yMACD: d3.ScaleLinear<number, number>;
  yMACD2: d3.ScaleLinear<number, number>;
  yRSI: d3.ScaleLinear<number, number>;
  width: number;
  height: number;
  candleChartHeightRatio: number;
  macdChartHeightRatio: number;
  macd2ChartHeightRatio: number;
  rsiChartHeightRatio: number;
  svg: any; //d3.Selection<SVGSVGElement, unknown, HTMLElement, unknown>;
  data: BybitKline[];
  indicators: IndicatorData;
}) {
  const [xCoord, yCoord] = d3.pointer(event);
  const bisectDate = d3.bisector((d: any) => d[0]).left;
  const x0 = x.invert(xCoord)?.getTime();
  const i = bisectDate(data, x0);
  const d0 = data[i - 1];
  const d1 = data[i];

  if (!d0 || !d1) return;
  const d = x0 < (d0[0] + d1[0]) / 2 ? d0 : d1;
  const xPos = x(d[0]);
  const yPos = yCoord;

  d3.select(".candle-info").call((text) => writeCandleInfo(text, d0));
  const macd = indicators.macd.find(
    (item: any) => item.timestamp === d0[0]
  )?.histogram;
  d3.select(".macd-text")
    .text(macd ? macd.toFixed(2) : "0")
    .style("fill", macd > 0 ? colors.green : colors.red);

  const rsi = indicators.rsi.find((item: any) => item.timestamp === d0[0])?.rsi;
  d3.select(".rsi-text").text(rsi.toFixed(2)).style("fill", colors.blue);

  const macd2 = indicators.vwapmacd.find(
    (item: any) => item.timestamp === d0[0]
  )?.histogram;
  d3.select(".macd2-text")
    .text(macd2.toFixed(2))
    .style("fill", macd2 > 0 ? colors.green : colors.red);

  let indicatorText = "";
  if (yCoord < height * candleChartHeightRatio) {
    indicatorText = y.invert(yCoord).toFixed(2);
  } else if (
    yCoord >= height * candleChartHeightRatio &&
    yCoord < height * macdChartHeightRatio
  ) {
    indicatorText = yMACD.invert(yCoord).toFixed(2);
  } else if (
    yCoord >= height * macdChartHeightRatio &&
    yCoord < height * macd2ChartHeightRatio
  ) {
    indicatorText = yMACD2.invert(yCoord).toFixed(2);
  } else if (
    yCoord >= height * macd2ChartHeightRatio &&
    yCoord < height * rsiChartHeightRatio
  ) {
    indicatorText = yRSI.invert(yCoord).toFixed(2);
  } else {
    indicatorText = (yVolume.invert(yCoord) / 1000).toFixed(2) + "k";
  }

  d3.select(".price-indicator")
    .attr("transform", `translate(${width}, ${yPos - 10})`)
    .select("text")
    .text(indicatorText)
    .attr("opacity", 1);

  const date = new Date(d[0]);
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

  d3.select(".date-indicator")
    .attr("transform", `translate(${xPos}, ${height})`)
    .select("text")
    .text(formattedDate);
  // .attr('opacity', 1);

  updateGuideLines({ svg, xPos, yPos, width, height });
}

export function handleMouseLeave() {
  d3.select(".guide-vertical-line").attr("opacity", 0);
  d3.select(".guide-horizontal-line").attr("opacity", 0);
  d3.select(".candle-info").selectAll("tspan").remove();
  d3.select(".price-indicator").attr("transform", `translate(-100, -100)`);
  d3.select(".date-indicator").attr("transform", `translate(-100, -100)`);
}
