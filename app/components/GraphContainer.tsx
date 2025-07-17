"use client";

import * as React from "react";
import ScatterChart from "./ScatterChart";
import Histogram from "./Histogram";
import { HistoryList } from "../libs/backtest/history";

type Props = {
  historyList: HistoryList;
};

export default function GraphContainer({ historyList }: Props) {
  return (
    <div className="flex w-full flex-col gap-2 h-full  ">
      Graph
      <div className="w-full  flex gap-2 ">
        <ScatterChart historyList={historyList} />
        <Histogram historyList={historyList} />
      </div>
    </div>
  );
}
