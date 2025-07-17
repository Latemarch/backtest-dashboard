"use client";

import * as React from "react";
import { useChartStore } from "../store/chartStore";

export default function OptionPanel() {
  const chartOptions = useChartStore((state: any) => state.chartOptions);
  const toggleIndicator = useChartStore((state: any) => state.toggleIndicator);

  return (
    <div className="flex h-10 text-gray-500 items-start gap-2 rounded-lg shadow-lg ">
      <div className="flex gap-4">
        <span
          className="cursor-pointer select-none hover:opacity-70 transition-opacity"
          style={{ color: chartOptions.ma5 ? "white" : "gray" }}
          onClick={() => toggleIndicator("ma5")}
        >
          ma50
        </span>
        <span
          className="cursor-pointer select-none hover:opacity-70 transition-opacity"
          style={{ color: chartOptions.ma10 ? "white" : "gray" }}
          onClick={() => toggleIndicator("ma10")}
        >
          ma100
        </span>
        <span
          className="cursor-pointer select-none hover:opacity-70 transition-opacity"
          style={{ color: chartOptions.ma20 ? "white" : "gray" }}
          onClick={() => toggleIndicator("ma20")}
        >
          ma200
        </span>
        <span
          className="cursor-pointer select-none hover:opacity-70 transition-opacity"
          style={{ color: chartOptions.bollingerBands ? "white" : "gray" }}
          onClick={() => toggleIndicator("bollingerBands")}
        >
          bollingerBands
        </span>
        <span
          className="cursor-pointer select-none hover:opacity-70 transition-opacity"
          style={{ color: chartOptions.vwap ? "white" : "gray" }}
          onClick={() => toggleIndicator("vwap")}
        >
          vwap
        </span>
        <span
          className="cursor-pointer select-none hover:opacity-70 transition-opacity"
          style={{ color: chartOptions.sar ? "white" : "gray" }}
          onClick={() => toggleIndicator("sar")}
        >
          sar
        </span>
        <span
          className="cursor-pointer select-none hover:opacity-70 transition-opacity"
          style={{ color: chartOptions.boundaries ? "white" : "gray" }}
          onClick={() => toggleIndicator("boundaries")}
        >
          boundaries
        </span>
      </div>
    </div>
  );
}
