"use client";

import { useTradeStore } from "../store/tradeStore";
import * as React from "react";
import { HistoryList } from "../libs/backtest/history";

export default function History({ historyList }: { historyList: HistoryList }) {
  const {
    setSelectedTrade,
    selectedTrade,
    setSelectedTradeInfo,
    selectedTradeInfo,
  } = useTradeStore();

  const handleDoubleClick = (item: any) => {
    setSelectedTradeInfo({ ...item, focus: true });
  };

  React.useEffect(() => {
    if (historyList.length === 0) return;
    setTimeout(() => {
      setSelectedTradeInfo({ ...historyList[0], focus: true });
    }, 100);
  }, [historyList]);

  return (
    <div className="flex flex-col w-full text-center text-sm h-full overflow-hidden">
      <div className="grid grid-cols-10">
        <div className="col-span-1 flex justify-center">Side</div>
        <div className="col-span-2">Open Price</div>
        <div className="col-span-2">Close Price</div>
        <div className="col-span-2">Open Time</div>
        <div className="col-span-2">Close Time</div>
        <div className="col-span-1 flex justify-end pr-1">Profit </div>
      </div>
      <div className="border border-gray-500"></div>

      <div className="flex flex-col overflow-y-auto scrollbar-hide h-full">
        {historyList.map((item: any, i: number) => (
          <div
            key={item.openTime}
            className={`grid grid-cols-10 py-1 items-center cursor-pointer transition-colors duration-200 ${
              item.profit < 0 ? "text-red-500" : "text-green-500"
            } ${
              selectedTrade === item.id ? "bg-gray-800" : "hover:bg-gray-800"
            } ${selectedTradeInfo?.id === item.id ? "bg-blue-800" : ""}`}
            onMouseEnter={() => {
              setSelectedTrade(item.id);
            }}
            onMouseLeave={() => {
              setSelectedTrade(0);
            }}
            onClick={() => {
              setSelectedTradeInfo(item);
            }}
            onDoubleClick={() => {
              handleDoubleClick(item);
            }}
          >
            <div className="col-span-1 flex justify-center">
              {item.side === "buy" ? "Long" : "Short"}
            </div>
            <div className="col-span-2">{item.openPrice}</div>
            <div className="col-span-2">{item.closePrice}</div>
            <div className="col-span-2">{item.openTime}</div>
            <div className="col-span-2">{item.closeTime}</div>
            <div className="col-span-1 flex justify-end">
              {item.profit.toFixed(2)}%
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
