import { NextRequest, NextResponse } from "next/server";
import { BybitKlineResponse } from "@/app/types/realtime";
import { BybitKline } from "@/app/libs/backtest/rsi";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // 필수 파라미터
    const symbol = searchParams.get("symbol");
    const interval = searchParams.get("interval");

    // 선택적 파라미터
    const category = searchParams.get("category") || "linear";
    const limit = searchParams.get("limit") || "200";
    const start = searchParams.get("start");
    const end = searchParams.get("end");

    // 필수 파라미터 검증
    if (!symbol || !interval) {
      return NextResponse.json(
        { error: "symbol과 interval은 필수 파라미터입니다." },
        { status: 400 }
      );
    }

    // 바이비트 API URL 구성
    const baseUrl = "https://api.bybit.com";
    const apiUrl = new URL("/v5/market/kline", baseUrl);

    // 쿼리 파라미터 추가
    apiUrl.searchParams.set("category", category);
    apiUrl.searchParams.set("symbol", symbol.toUpperCase());
    apiUrl.searchParams.set("interval", interval);
    apiUrl.searchParams.set("limit", limit);

    if (start) {
      apiUrl.searchParams.set("start", start);
    }

    if (end) {
      apiUrl.searchParams.set("end", end);
    }

    // 바이비트 API 호출
    const response = await fetch(apiUrl.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`바이비트 API 호출 실패: ${response.status}`);
    }

    const data: BybitKlineResponse = await response.json();

    // 응답 검증
    if (data.retCode !== 0) {
      throw new Error(`바이비트 API 오류: ${data.retMsg}`);
    }

    // 데이터 변환 및 시간순 정렬
    const klines: BybitKline[] = data.result.list
      .map((item) => ({
        0: parseInt(item[0]), // startTime
        1: parseFloat(item[1]), // openPrice
        2: parseFloat(item[2]), // highPrice
        3: parseFloat(item[3]), // lowPrice
        4: parseFloat(item[4]), // closePrice
        5: parseFloat(item[5]), // volume
        6: parseFloat(item[6]), // turnover
      }))
      .sort((a, b) => a[0] - b[0]); // startTime 기준 오름차순 정렬

    return NextResponse.json({
      success: true,
      data: {
        symbol: data.result.symbol,
        category: data.result.category,
        klines,
        count: klines.length,
      },
    });
  } catch (error) {
    console.error("캔들 데이터 가져오기 오류:", error);
    return NextResponse.json(
      {
        error: "캔들 데이터를 가져오는 중 오류가 발생했습니다.",
        details: error instanceof Error ? error.message : "알 수 없는 오류",
      },
      { status: 500 }
    );
  }
}
