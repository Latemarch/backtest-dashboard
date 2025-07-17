"use client";

import * as React from "react";
import BackTest from "./BackTest";
import { useCandles } from "../hooks/useCandles";
import OptionPanel from "./OptionPanel";

export default function ChartContainer() {
  const { candles, isLoading, error, isSuccess } = useCandles(
    20250107,
    20250121
  );

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error</div>;
  if (candles.length === 0) return <div>No data</div>;

  return (
    // <div className="relative">{candles.length > 0 && <ChartLayout candleData={candles} />}</div>
    <div className="flex flex-col w-full h-full">
      <OptionPanel />
      <div className="flex flex-col h-[calc(100vh-62px)] w-full">
        <BackTest candleData={candles} />
      </div>
    </div>
  );
}
