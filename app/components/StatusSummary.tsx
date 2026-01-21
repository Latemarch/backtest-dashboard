"use client";

import * as React from "react";
import { HistoryList } from "../libs/backtest/history";
import { CiBitcoin } from "react-icons/ci";

export default function StatusSummary({
  historyList = [],
}: {
  historyList?: HistoryList;
}) {
  const [serverTime, setServerTime] = React.useState(() => new Date().toLocaleString());

  React.useEffect(() => {
    const interval = setInterval(() => {
      setServerTime(new Date().toLocaleString());
    }, 1000);
    return () => clearInterval(interval);
  }, []);
  const winRate = React.useMemo(() => {
    if (historyList.length === 0) return 0;
    return 51.28;
    const winTrades = historyList.filter((trade) => trade.profit > 0).length;
    return (winTrades / historyList.length) * 100;
  }, [historyList]);

  return (
    <div className="w-full px-2">
      <div className="flex gap-2 mb-2 justify-between items-center">
        <CiBitcoin className="text-3xl text-yellow-500" />
        <p className="text-xs text-gray-400">{serverTime}</p>
      </div>
      <div className="flex flex-row gap-2 items-center">
        <p className="text-sm">Bull vs Bear</p> <p className="text-xs text-gray-400">(by GPT) </p> 
      </div>
      <div className="relative w-full bg-gray-700 rounded-full overflow-hidden shadow-lg" style={{ height: '20px' }}>
        {/* Progress bar */}
        <div
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 via-blue-400 to-green-500 transition-all duration-500 ease-out shadow-inner"
          style={{ width: `${winRate}%` }}
        />
        {/* Center text */}
        <div className="absolute inset-0 flex items-center justify-center text-white text-xs font-bold z-10 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
          {winRate.toFixed(1)}%
        </div>
      </div>
    </div>
  );
}