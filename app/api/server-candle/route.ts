import { NextResponse } from "next/server";
import { getLocalCandleData } from "./getLocalData";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const start = searchParams.get("start");
  const end = searchParams.get("end");
  // const interval = searchParams.get('interval') || '1h';
  // const intervalDay = BigInt(86400000);

  if (!start || !end) {
    return NextResponse.json(
      { error: "start 및 end 파라미터가 필요합니다." },
      { status: 400 }
    );
  }

  // 먼저 로컬 데이터에서 확인
  const localData = await getLocalCandleData(start, end);

  if (localData.hasLocalData && localData.data) {
    return NextResponse.json({
      ok: true,
      data: localData.data,
      source: "local",
    });
  }
  return NextResponse.json({
    ok: false,
    data: [],
    source: "local",
  });

  // 로컬 데이터가 없으면 데이터베이스에서 조회
  // const gte = dateToTimestamp(start);
  // const lte = dateToTimestamp(end);

  // const candles = await prisma.bTCUSDT1m.findMany({
  //   where: {
  //     timestamp: {
  //       gte,
  //       lte,
  //     },
  //   },
  // });

  // BigInt를 일반 숫자로 변환
  // const serializedCandles = candles.map((candle) => ({
  //   ...candle,
  //   timestamp: Number(candle.timestamp),
  // }));

  // return NextResponse.json({
  //   ok: true,
  //   data: serializedCandles,
  //   source: 'database',
  // });
}

// date = 20240501
function dateToTimestamp(date: string) {
  const year = date.slice(0, 4);
  const month = date.slice(4, 6);
  const day = date.slice(6, 8);
  return new Date(`${year}-${month}-${day}`).getTime();
}
