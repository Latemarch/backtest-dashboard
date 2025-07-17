"use client";
import { BybitKline, IndicatorData } from "../types/type";
import React from "react";
import ChartLayout from "./candleChart.tsx/ChartLayout";
import { useChartStore } from "../store/chartStore";
import { makeIndicators } from "../libs/backtest/makeIndicators";
import History from "./History";
import GraphContainer from "./GraphContainer";
import InfoPanel from "./InfoPanel";
import { HistoryList, makeHistoryList } from "../libs/backtest/history";
import { backtestV2 } from "../libs/v2/backtestV2";

export default function BackTest({ candleData }: { candleData: BybitKline[] }) {
  const [indicatorsState, setIndicatorsState] = React.useState<IndicatorData>(
    {}
  );
  const chartOptions = useChartStore((state) => state.chartOptions);

  const indicators = React.useMemo(
    () => makeIndicators(candleData),
    [candleData]
  );
  // const tradingHistory = React.useMemo(() => backtest(candleData, indicators), [indicators]);
  const tradingHistory = React.useMemo(
    () => backtestV2(candleData, indicators),
    [indicators]
  );
  const historyList: HistoryList = React.useMemo(
    () => makeHistoryList(tradingHistory),
    [tradingHistory]
  );

  React.useEffect(() => {
    setIndicatorsState({
      macd: chartOptions.macd ? indicators.macd : null,
      ma5: chartOptions.ma5 ? indicators.ma5 : null,
      ma10: chartOptions.ma10 ? indicators.ma10 : null,
      ma20: chartOptions.ma20 ? indicators.ma20 : null,
      bollingerBands: chartOptions.bollingerBands
        ? indicators.bollingerBands
        : null,
      vwap: chartOptions.vwap ? indicators.vwap : null,
      vwap2: chartOptions.vwap ? indicators.vwap2 : null,
      vwapmacd: chartOptions.macd ? indicators.vwapmacd : null,
      rsi: indicators.rsi,
      sar: chartOptions.sar ? indicators.sar : null,
      boundaries: chartOptions.boundaries ? indicators.boundaries : null,
    });
  }, [indicators, chartOptions]);

  return (
    <div className="flex flex-col gap-8 h-full w-full ">
      <div className="flex relative">
        <ChartLayout
          candleData={candleData}
          indicators={indicatorsState}
          tradingHistory={tradingHistory}
        />
      </div>
      <div className="flex-col-reverse flex md:flex-row gap-4 w-full h-full md:overflow-hidden">
        <History historyList={historyList} />
        <div className="w-full ">
          <InfoPanel historyList={historyList} />
          <GraphContainer historyList={historyList} />
        </div>
      </div>
    </div>
  );
}
