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

  // if (historyList.length === 0) return <div>No data</div>;

  return (
    <div className="flex flex-col w-full text-center overflow-hidden text-xs md:text-sm h-full flex-1">
      <div className="grid grid-cols-10">
        <div className="col-span-1 flex justify-center">Side</div>
        <div className="col-span-2">OpenPrice</div>
        <div className="col-span-2">ClosePrice</div>
        <div className="col-span-2">OpenTime</div>
        <div className="col-span-2">CloseTime</div>
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
            <div className="col-span-2">{item.openTime.split(" ").pop()}</div>
            <div className="col-span-2">{item.closeTime.split(" ").pop()}</div>
            <div className="col-span-1 flex justify-end">
              {item.profit.toFixed(2)}%
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const historyListDummy =[
  {
      "side": "buy",
      "openPrice": "100600.18",
      "closePrice": "100781.92",
      "openTime": "07 Jan 18:38",
      "closeTime": "07 Jan 21:43",
      "profit": 0.05226170263531942,
      "profitRate": 0.13065425658829855,
      "id": 1736260980004,
      "holdingPeriod": 11100000,
      "openTimeStamp": 1736249880000,
      "closeTimeStamp": 1736260980000,
      "qty": 0.4
  },
  {
      "side": "buy",
      "openPrice": "97142.72",
      "closePrice": "96627.95",
      "openTime": "07 Jan 22:01",
      "closeTime": "08 Jan 03:50",
      "profit": -3.711447128633175,
      "profitRate": -0.5799136138489336,
      "id": 1736283000004,
      "holdingPeriod": 20940000,
      "openTimeStamp": 1736262060000,
      "closeTimeStamp": 1736283000000,
      "qty": 6.4
  },
  {
      "side": "buy",
      "openPrice": "96463.14",
      "closePrice": "96519.34",
      "openTime": "08 Jan 10:07",
      "closeTime": "08 Jan 12:19",
      "profit": 0.0016529869743109786,
      "profitRate": 0.008264934871554892,
      "id": 1736313540004,
      "holdingPeriod": 7920000,
      "openTimeStamp": 1736305620000,
      "closeTimeStamp": 1736313540000,
      "qty": 0.2
  },
  {
      "side": "buy",
      "openPrice": "95660.12",
      "closePrice": "95946.93",
      "openTime": "08 Jan 13:32",
      "closeTime": "08 Jan 15:18",
      "profit": 0.09992704049847081,
      "profitRate": 0.24981760124617702,
      "id": 1736324280004,
      "holdingPeriod": 6360000,
      "openTimeStamp": 1736317920000,
      "closeTimeStamp": 1736324280000,
      "qty": 0.4
  },
  {
      "side": "buy",
      "openPrice": "95498.97",
      "closePrice": "95854.13",
      "openTime": "08 Jan 16:58",
      "closeTime": "08 Jan 17:29",
      "profit": 0.06438032181910647,
      "profitRate": 0.32190160909553234,
      "id": 1736332140004,
      "holdingPeriod": 1860000,
      "openTimeStamp": 1736330280000,
      "closeTimeStamp": 1736332140000,
      "qty": 0.2
  },
  {
      "side": "buy",
      "openPrice": "95335.12",
      "closePrice": "95358.22",
      "openTime": "08 Jan 18:32",
      "closeTime": "08 Jan 19:38",
      "profit": -0.005153588126991504,
      "profitRate": -0.025767940634957517,
      "id": 1736339880004,
      "holdingPeriod": 3960000,
      "openTimeStamp": 1736335920000,
      "closeTimeStamp": 1736339880000,
      "qty": 0.2
  },
  {
      "side": "buy",
      "openPrice": "93482.06",
      "closePrice": "94368.08",
      "openTime": "09 Jan 00:23",
      "closeTime": "09 Jan 01:04",
      "profit": 0.17955977477112925,
      "profitRate": 0.8977988738556462,
      "id": 1736359440004,
      "holdingPeriod": 2460000,
      "openTimeStamp": 1736356980000,
      "closeTimeStamp": 1736359440000,
      "qty": 0.2
  },
  {
      "side": "buy",
      "openPrice": "94117.99",
      "closePrice": "94586.56",
      "openTime": "09 Jan 09:06",
      "closeTime": "09 Jan 09:16",
      "profit": 0.1791394568600259,
      "profitRate": 0.4478486421500647,
      "id": 1736388960004,
      "holdingPeriod": 600000,
      "openTimeStamp": 1736388360000,
      "closeTimeStamp": 1736388960000,
      "qty": 0.4
  },
  {
      "side": "buy",
      "openPrice": "93473.69",
      "closePrice": "93502.90",
      "openTime": "09 Jan 14:31",
      "closeTime": "09 Jan 16:18",
      "profit": -0.007502226676187417,
      "profitRate": -0.01875556669046854,
      "id": 1736414280004,
      "holdingPeriod": 6420000,
      "openTimeStamp": 1736407860000,
      "closeTimeStamp": 1736414280000,
      "qty": 0.4
  },
  {
      "side": "buy",
      "openPrice": "92120.00",
      "closePrice": "92707.40",
      "openTime": "09 Jan 20:37",
      "closeTime": "09 Jan 21:57",
      "profit": 0.23505682136102576,
      "profitRate": 0.5876420534025644,
      "id": 1736434620004,
      "holdingPeriod": 4800000,
      "openTimeStamp": 1736429820000,
      "closeTimeStamp": 1736434620000,
      "qty": 0.4
  },
  {
      "side": "buy",
      "openPrice": "92812.58",
      "closePrice": "93228.70",
      "openTime": "10 Jan 00:49",
      "closeTime": "10 Jan 02:10",
      "profit": 0.0796697808301325,
      "profitRate": 0.3983489041506625,
      "id": 1736449800004,
      "holdingPeriod": 4860000,
      "openTimeStamp": 1736444940000,
      "closeTimeStamp": 1736449800000,
      "qty": 0.2
  },
  {
      "side": "buy",
      "openPrice": "91943.40",
      "closePrice": "92258.27",
      "openTime": "10 Jan 02:49",
      "closeTime": "10 Jan 04:17",
      "profit": 0.11698121703503735,
      "profitRate": 0.29245304258759336,
      "id": 1736457420004,
      "holdingPeriod": 5280000,
      "openTimeStamp": 1736452140000,
      "closeTimeStamp": 1736457420000,
      "qty": 0.4
  },
  {
      "side": "buy",
      "openPrice": "93257.42",
      "closePrice": "93922.33",
      "openTime": "10 Jan 20:30",
      "closeTime": "10 Jan 21:08",
      "profit": 0.132595912088923,
      "profitRate": 0.6629795604446149,
      "id": 1736518080004,
      "holdingPeriod": 2280000,
      "openTimeStamp": 1736515800000,
      "closeTimeStamp": 1736518080000,
      "qty": 0.2
  },
  {
      "side": "buy",
      "openPrice": "92240.50",
      "closePrice": "93605.00",
      "openTime": "10 Jan 22:13",
      "closeTime": "10 Jan 22:37",
      "profit": 0.2858574422337724,
      "profitRate": 1.429287211168862,
      "id": 1736523420004,
      "holdingPeriod": 1440000,
      "openTimeStamp": 1736521980000,
      "closeTimeStamp": 1736523420000,
      "qty": 0.2
  },
  {
      "side": "buy",
      "openPrice": "93877.31",
      "closePrice": "94245.77",
      "openTime": "11 Jan 11:34",
      "closeTime": "11 Jan 12:36",
      "profit": 0.06849895802492541,
      "profitRate": 0.342494790124627,
      "id": 1736573760004,
      "holdingPeriod": 3720000,
      "openTimeStamp": 1736570040000,
      "closeTimeStamp": 1736573760000,
      "qty": 0.2
  },
  {
      "side": "buy",
      "openPrice": "94042.40",
      "closePrice": "94319.07",
      "openTime": "12 Jan 00:15",
      "closeTime": "12 Jan 02:03",
      "profit": 0.04883838094961074,
      "profitRate": 0.2441919047480537,
      "id": 1736622180004,
      "holdingPeriod": 6480000,
      "openTimeStamp": 1736615700000,
      "closeTimeStamp": 1736622180000,
      "qty": 0.2
  },
  {
      "side": "buy",
      "openPrice": "94253.66",
      "closePrice": "94338.89",
      "openTime": "13 Jan 04:16",
      "closeTime": "13 Jan 06:31",
      "profit": 0.01616868692250082,
      "profitRate": 0.04042171730625205,
      "id": 1736724660004,
      "holdingPeriod": 8100000,
      "openTimeStamp": 1736716560000,
      "closeTimeStamp": 1736724660000,
      "qty": 0.4
  },
  {
      "side": "buy",
      "openPrice": "94016.65",
      "closePrice": "94437.00",
      "openTime": "13 Jan 08:49",
      "closeTime": "13 Jan 11:09",
      "profit": 0.3176802488022102,
      "profitRate": 0.3971003110027627,
      "id": 1736741340004,
      "holdingPeriod": 8400000,
      "openTimeStamp": 1736732940000,
      "closeTimeStamp": 1736741340000,
      "qty": 0.8
  },
  {
      "side": "buy",
      "openPrice": "91288.22",
      "closePrice": "91342.99",
      "openTime": "13 Jan 13:47",
      "closeTime": "13 Jan 19:07",
      "profit": 0.1279999999999719,
      "profitRate": 0.009999999999997802,
      "id": 1736770020004,
      "holdingPeriod": 19200000,
      "openTimeStamp": 1736750820000,
      "closeTimeStamp": 1736770020000,
      "qty": 12.8
  },
  {
      "side": "buy",
      "openPrice": "89364.10",
      "closePrice": "90893.83",
      "openTime": "13 Jan 21:35",
      "closeTime": "13 Jan 21:41",
      "profit": 0.3323588687662376,
      "profitRate": 1.661794343831188,
      "id": 1736779260004,
      "holdingPeriod": 360000,
      "openTimeStamp": 1736778900000,
      "closeTimeStamp": 1736779260000,
      "qty": 0.2
  },
  {
      "side": "buy",
      "openPrice": "98644.95",
      "closePrice": "98944.29",
      "openTime": "16 Jan 00:58",
      "closeTime": "16 Jan 01:15",
      "profit": 0.05069052354366482,
      "profitRate": 0.2534526177183241,
      "id": 1736964900004,
      "holdingPeriod": 1020000,
      "openTimeStamp": 1736963880000,
      "closeTimeStamp": 1736964900000,
      "qty": 0.2
  },
  {
      "side": "buy",
      "openPrice": "98811.52",
      "closePrice": "99178.14",
      "openTime": "16 Jan 15:48",
      "closeTime": "16 Jan 16:46",
      "profit": 0.06420632686268543,
      "profitRate": 0.3210316343134271,
      "id": 1737020760004,
      "holdingPeriod": 3480000,
      "openTimeStamp": 1737017280000,
      "closeTimeStamp": 1737020760000,
      "qty": 0.2
  },
  {
      "side": "buy",
      "openPrice": "97880.53",
      "closePrice": "98427.80",
      "openTime": "16 Jan 21:45",
      "closeTime": "16 Jan 22:28",
      "profit": 0.10182327611887632,
      "profitRate": 0.5091163805943816,
      "id": 1737041280004,
      "holdingPeriod": 2580000,
      "openTimeStamp": 1737038700000,
      "closeTimeStamp": 1737041280000,
      "qty": 0.2
  },
  {
      "side": "buy",
      "openPrice": "100837.83",
      "closePrice": "101150.98",
      "openTime": "17 Jan 09:51",
      "closeTime": "17 Jan 10:01",
      "profit": 0.0521091743725174,
      "profitRate": 0.260545871862587,
      "id": 1737082860004,
      "holdingPeriod": 600000,
      "openTimeStamp": 1737082260000,
      "closeTimeStamp": 1737082860000,
      "qty": 0.2
  },
  {
      "side": "buy",
      "openPrice": "103463.09",
      "closePrice": "103688.06",
      "openTime": "18 Jan 10:37",
      "closeTime": "18 Jan 12:01",
      "profit": 0.06697281245960311,
      "profitRate": 0.1674320311490078,
      "id": 1737176460004,
      "holdingPeriod": 5040000,
      "openTimeStamp": 1737171420000,
      "closeTimeStamp": 1737176460000,
      "qty": 0.4
  },
  {
      "side": "buy",
      "openPrice": "102880.14",
      "closePrice": "103458.10",
      "openTime": "18 Jan 12:57",
      "closeTime": "18 Jan 13:36",
      "profit": 0.10235687870597206,
      "profitRate": 0.5117843935298603,
      "id": 1737182160004,
      "holdingPeriod": 2340000,
      "openTimeStamp": 1737179820000,
      "closeTimeStamp": 1737182160000,
      "qty": 0.2
  },
  {
      "side": "buy",
      "openPrice": "103511.00",
      "closePrice": "104510.81",
      "openTime": "19 Jan 16:21",
      "closeTime": "19 Jan 16:35",
      "profit": 0.183179752262143,
      "profitRate": 0.915898761310715,
      "id": 1737279300004,
      "holdingPeriod": 840000,
      "openTimeStamp": 1737278460000,
      "closeTimeStamp": 1737279300000,
      "qty": 0.2
  },
  {
      "side": "buy",
      "openPrice": "101535.93",
      "closePrice": "101596.85",
      "openTime": "20 Jan 04:25",
      "closeTime": "20 Jan 06:22",
      "profit": 0.03199999999996977,
      "profitRate": 0.009999999999990551,
      "id": 1737328920004,
      "holdingPeriod": 7020000,
      "openTimeStamp": 1737321900000,
      "closeTimeStamp": 1737328920000,
      "qty": 3.2
  },
  {
      "side": "buy",
      "openPrice": "106383.37",
      "closePrice": "107263.31",
      "openTime": "20 Jan 19:17",
      "closeTime": "20 Jan 19:48",
      "profit": 0.155428537812901,
      "profitRate": 0.777142689064505,
      "id": 1737377280004,
      "holdingPeriod": 1860000,
      "openTimeStamp": 1737375420000,
      "closeTimeStamp": 1737377280000,
      "qty": 0.2
  },
  {
      "side": "buy",
      "openPrice": "104691.30",
      "closePrice": "106232.34",
      "openTime": "20 Jan 22:18",
      "closeTime": "20 Jan 23:40",
      "profit": 2.275170803991021,
      "profitRate": 1.421981752494388,
      "id": 1737391200004,
      "holdingPeriod": 4920000,
      "openTimeStamp": 1737386280000,
      "closeTimeStamp": 1737391200000,
      "qty": 1.6
  },
  {
      "side": "buy",
      "openPrice": "103109.79",
      "closePrice": "105085.63",
      "openTime": "21 Jan 00:05",
      "closeTime": "21 Jan 00:09",
      "profit": 0.37324950775797194,
      "profitRate": 1.8662475387898596,
      "id": 1737392940004,
      "holdingPeriod": 240000,
      "openTimeStamp": 1737392700000,
      "closeTimeStamp": 1737392940000,
      "qty": 0.2
  },
  {
      "side": "buy",
      "openPrice": "102213.07",
      "closePrice": "103535.87",
      "openTime": "21 Jan 05:02",
      "closeTime": "21 Jan 05:38",
      "profit": 0.24883224353508004,
      "profitRate": 1.2441612176754002,
      "id": 1737412680004,
      "holdingPeriod": 2160000,
      "openTimeStamp": 1737410520000,
      "closeTimeStamp": 1737412680000,
      "qty": 0.2
  }
]