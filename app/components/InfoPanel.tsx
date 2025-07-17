"use client";

import * as React from "react";
import { HistoryList } from "../libs/backtest/history";

export default function InfoPanel({
  historyList,
}: {
  historyList: HistoryList;
}) {
  const stats = React.useMemo(() => {
    // 전체 통계
    const totalTrades = historyList.length;
    const winTrades = historyList.filter((trade) => trade.profit > 0).length;
    const winRate = totalTrades > 0 ? (winTrades / totalTrades) * 100 : 0;

    const totalMean =
      historyList.reduce((acc, curr) => acc + curr.profit, 0) / totalTrades;
    const totalStd = Math.sqrt(
      historyList.reduce(
        (acc, curr) => acc + Math.pow(curr.profit - totalMean, 2),
        0
      ) /
        (totalTrades - 1)
    );

    // 기간 동안의 상승률 계산
    let periodReturn = 0;
    if (historyList.length > 0) {
      const firstOpenPrice = parseFloat(historyList[0].openPrice);
      const lastClosePrice = parseFloat(
        historyList[historyList.length - 1].closePrice
      );
      periodReturn = ((lastClosePrice - firstOpenPrice) / firstOpenPrice) * 100;
    }

    // 수익률 총 합 계산
    const totalProfitSum = historyList.reduce(
      (acc, curr) => acc + curr.profit,
      0
    );
    const totalReturnSum = historyList.reduce(
      (acc, curr) => acc + curr.profitRate,
      0
    );

    // Long 포지션 통계 (side: "buy")
    const longTrades = historyList.filter((trade) => trade.side === "buy");
    const longWinTrades = longTrades.filter((trade) => trade.profit > 0).length;
    const longWinRate =
      longTrades.length > 0 ? (longWinTrades / longTrades.length) * 100 : 0;
    const longMean =
      longTrades.length > 0
        ? longTrades.reduce((acc, curr) => acc + curr.profit, 0) /
          longTrades.length
        : 0;
    const longStd =
      longTrades.length > 1
        ? Math.sqrt(
            longTrades.reduce(
              (acc, curr) => acc + Math.pow(curr.profit - longMean, 2),
              0
            ) /
              (longTrades.length - 1)
          )
        : 0;

    // Short 포지션 통계 (side: "sell")
    const shortTrades = historyList.filter((trade) => trade.side === "sell");
    const shortWinTrades = shortTrades.filter(
      (trade) => trade.profit > 0
    ).length;
    const shortWinRate =
      shortTrades.length > 0 ? (shortWinTrades / shortTrades.length) * 100 : 0;
    const shortMean =
      shortTrades.length > 0
        ? shortTrades.reduce((acc, curr) => acc + curr.profit, 0) /
          shortTrades.length
        : 0;
    const shortStd =
      shortTrades.length > 1
        ? Math.sqrt(
            shortTrades.reduce(
              (acc, curr) => acc + Math.pow(curr.profit - shortMean, 2),
              0
            ) /
              (shortTrades.length - 1)
          )
        : 0;

    return {
      total: { trades: totalTrades, winRate, mean: totalMean, std: totalStd },
      long: {
        trades: longTrades.length,
        winRate: longWinRate,
        mean: longMean,
        std: longStd,
      },
      short: {
        trades: shortTrades.length,
        winRate: shortWinRate,
        mean: shortMean,
        std: shortStd,
      },
      periodReturn,
      totalProfitSum,
      totalReturnSum,
    };
  }, [historyList]);

  return (
    <div className="p-2">
      {/* 상단 요약 정보 */}
      <div className="mb-4 grid grid-cols-2 gap-4 border-b border-gray-300 pb-2">
        <div className=" rounded-lg">
          <div className="text-sm text-gray-400">Period Return</div>
          <div
            className={`text-lg font-semibold ${
              stats.periodReturn >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            {stats.periodReturn.toFixed(2)}%
          </div>
        </div>
        <div className=" rounded-lg">
          <div className="text-sm text-gray-400">Period Profit</div>
          <div
            className={`text-lg font-semibold ${
              stats.totalProfitSum >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            {stats.totalProfitSum.toFixed(2)}% (
            {stats.totalReturnSum.toFixed(2)}%)
          </div>
        </div>
      </div>

      {/* 기존 통계 테이블 */}
      <table className="w-full border-b border-gray-300 pb-2">
        <thead>
          <tr className="text-left">
            <th className="pb-2 font-semibold">Metric</th>
            <th className="pb-2 font-semibold">Overall</th>
            <th className="pb-2 font-semibold">Long</th>
            <th className="pb-2 font-semibold">Short</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="py-1 text-gray-700">Total Trades</td>
            <td className="py-1">{stats.total.trades}</td>
            <td className="py-1">{stats.long.trades}</td>
            <td className="py-1">{stats.short.trades}</td>
          </tr>
          <tr>
            <td className="py-1 text-gray-700">Win Rate</td>
            <td className="py-1">{stats.total.winRate.toFixed(2)}%</td>
            <td className="py-1">{stats.long.winRate.toFixed(2)}%</td>
            <td className="py-1">{stats.short.winRate.toFixed(2)}%</td>
          </tr>
          <tr>
            <td className="py-1 text-gray-700">Average Return</td>
            <td className="py-1">{stats.total.mean.toFixed(2)}%</td>
            <td className="py-1">{stats.long.mean.toFixed(2)}%</td>
            <td className="py-1">{stats.short.mean.toFixed(2)}%</td>
          </tr>
          <tr>
            <td className="py-1 text-gray-700">Standard Deviation</td>
            <td className="py-1">{stats.total.std.toFixed(2)}%</td>
            <td className="py-1">{stats.long.std.toFixed(2)}%</td>
            <td className="py-1">{stats.short.std.toFixed(2)}%</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
