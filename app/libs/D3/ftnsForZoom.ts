import * as d3 from "d3";
import { BybitKline, IndicatorData } from "../../types/type";

export const getLocalLimitCandleArea = ({
  candleData,
  indicators,
  firstDate,
  lastDate,
}: {
  candleData: BybitKline[];
  indicators: any;
  firstDate: Date;
  lastDate: Date;
}) => {
  const visiblecandleData = candleData.filter((d) => {
    const date = new Date(d[0]);
    return date >= firstDate && date <= lastDate;
  });

  // 가격/볼륨 스케일 설정
  let maxPrice = Number(d3.max(visiblecandleData, (d) => d[2])) + 10;
  let minPrice = Number(d3.min(visiblecandleData, (d) => d[3])) - 10;
  const volumeMax = Number(d3.max(visiblecandleData, (d) => d[5]));
  if (indicators.bollingerBands) {
    const visibleBollingerBands = indicators.bollingerBands.filter((d: any) => {
      const date = new Date(d.timestamp);
      return date >= firstDate && date <= lastDate;
    });
    maxPrice = Math.max(
      maxPrice,
      Number(d3.max(visibleBollingerBands, (d: any) => d.upper)) + 10
    );
    minPrice = Math.min(
      minPrice,
      Number(d3.min(visibleBollingerBands, (d: any) => d.lower)) - 10
    );
  }
  if (indicators.vwap) {
    const visibleVWAPcandleData = indicators.vwap.filter((d: any) => {
      const date = new Date(d.timestamp);
      return date >= firstDate && date <= lastDate;
    });
    maxPrice = Math.max(
      maxPrice,
      Number(d3.max(visibleVWAPcandleData, (d: any) => d.value)) + 10
    );
    minPrice = Math.min(
      minPrice,
      Number(d3.min(visibleVWAPcandleData, (d: any) => d.value)) - 10
    );
  }
  // MACD를 위한 y축 스케일 설정
  const visibleMACDcandleData = indicators.macd.filter((d: any) => {
    const date = new Date(d.timestamp);
    return date >= firstDate && date <= lastDate;
  });
  // const macdMax = Math.max(...visibleMACDcandleData.map((d: any) => Math.max(d.macd, d.signal)));
  // const macdMin = Math.min(...visibleMACDcandleData.map((d: any) => Math.min(d.macd, d.signal)));
  const macdMax = Math.max(
    ...visibleMACDcandleData.map((d: any) => Math.abs(d.histogram))
  );
  const macdMin = Math.min(
    ...visibleMACDcandleData.map((d: any) => d.histogram)
  );
  const macdFluctuation = Math.max(macdMax, -macdMin) * 1.2;

  const visibleVWAPMACDcandleData = indicators.vwapmacd.filter((d: any) => {
    const date = new Date(d.timestamp);
    return date >= firstDate && date <= lastDate;
  });
  const vwapmacdMax = Math.max(
    ...visibleVWAPMACDcandleData.map((d: any) => Math.abs(d.histogram))
  );
  const vwapmacdMin = Math.min(
    ...visibleVWAPMACDcandleData.map((d: any) => d.histogram)
  );
  const vwapmacdFluctuation = Math.max(vwapmacdMax, -vwapmacdMin) * 1.2;

  const visibleRSIcandleData = indicators.rsi.filter((d: any) => {
    const date = new Date(d.timestamp);
    return date >= firstDate && date <= lastDate;
  });
  const rsiMax = Math.max(...visibleRSIcandleData.map((d: any) => d.rsi));
  const rsiMin = Math.min(...visibleRSIcandleData.map((d: any) => d.rsi));
  const rsiFluctuation = Math.max(rsiMax, -rsiMin) * 1.2;

  return {
    maxPrice,
    minPrice,
    volumeMax,
    macdFluctuation,
    macdMax,
    macdMin,
    vwapmacdFluctuation,
    vwapmacdMax,
    vwapmacdMin,
    rsiFluctuation,
  };
};

export const getScales = ({
  height,
  candleChartHeightRatio,
  macdChartHeightRatio,
  macd2ChartHeightRatio,
  rsiChartHeightRatio,
  candleData,
  indicators,
  firstDate,
  lastDate,
}: {
  candleData: BybitKline[];
  indicators: IndicatorData;
  firstDate: Date;
  lastDate: Date;
  height: number;
  candleChartHeightRatio: number;
  macdChartHeightRatio: number;
  macd2ChartHeightRatio: number;
  rsiChartHeightRatio: number;
}) => {
  const {
    maxPrice,
    minPrice,
    volumeMax,
    macdFluctuation,
    vwapmacdFluctuation,
    macdMax,
    macdMin,
    vwapmacdMax,
    vwapmacdMin,
  } = getLocalLimitCandleArea({
    candleData,
    indicators,
    firstDate,
    lastDate,
  });
  const gap = (maxPrice - minPrice) * 0.02;
  const y = d3
    .scaleLinear()
    .domain([minPrice - gap, maxPrice + gap])
    .range([height * candleChartHeightRatio, 0]);

  const yMACD = d3
    .scaleLinear()
    .domain([-macdFluctuation, macdFluctuation])
    .range([height * macdChartHeightRatio, height * candleChartHeightRatio]);

  const yMACD2 = d3
    .scaleLinear()
    .domain([-vwapmacdFluctuation, vwapmacdFluctuation])
    .range([height * macd2ChartHeightRatio, height * macdChartHeightRatio]);

  const yRSI = d3
    .scaleLinear()
    .domain([0, 100])
    .range([height * rsiChartHeightRatio, height * macd2ChartHeightRatio]);

  const yVolume = d3
    .scaleLinear()
    .domain([0, volumeMax])
    .range([height, height * rsiChartHeightRatio + 4]);
  return { y, yVolume, yMACD, yMACD2, yRSI };
};
