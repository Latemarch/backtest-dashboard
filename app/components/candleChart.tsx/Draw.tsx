"use client";

import * as React from "react";
import * as d3 from "d3";
import { BybitKline, TradingHistory } from "../../types/type";
import {
  createCanvasInSVG,
  drawCandlesOnCanvas,
  drawVolumeOnCanvas,
  updateAxis,
} from "../../libs/D3/candlesChart";
import {
  handleMouseLeave,
  handleMouseMove,
} from "../../libs/D3/candleChartInteraction";

import { IndicatorData } from "../../types/type";
import { getScales } from "../../libs/D3/ftnsForZoom";
import { drawIndicators } from "../../libs/D3/drawIndicators";
import { drawMarkers } from "../../libs/D3/drawMarkers";
// import Interaction, { drawTradeRect } from './Interaction';
import { useTradeStore } from "../../store/tradeStore";
import Interaction, { drawTradeRect } from "./Interaction";

type Props = {
  svgRef: React.RefObject<SVGSVGElement>;
  candleData: BybitKline[];
  height: number;
  candleChartHeightRatio?: number;
  macdChartHeightRatio?: number;
  macd2ChartHeightRatio?: number;
  rsiChartHeightRatio?: number;
  indicators: IndicatorData;
  tradingHistory?: TradingHistory[];
};

// 현재 보이는 영역에 따라 최대 10일치 데이터만 필터링하는 함수
const getVisibleCandleData = (
  candleData: BybitKline[],
  visibleDomain: [Date, Date],
  maxDays: number = 5
): BybitKline[] => {
  const [startDate, endDate] = visibleDomain;

  // 10일치 데이터에 해당하는 타임스탬프 범위 계산 (1분봉 기준)
  const maxTimeRange = maxDays * 24 * 60 * 60 * 1000; // 10일을 밀리초로 변환

  // 보이는 영역의 시간 범위 계산
  const visibleTimeRange = endDate.getTime() - startDate.getTime();

  // 10일보다 작은 범위면 원본 필터링 로직 사용
  if (visibleTimeRange <= maxTimeRange) {
    return candleData.filter((candle) => {
      const candleTime = new Date(Number(candle[0]));
      return candleTime >= startDate && candleTime <= endDate;
    });
  }

  // 10일보다 큰 범위면 중앙을 기준으로 10일치만 선택
  const centerTime = startDate.getTime() + visibleTimeRange / 2;
  const halfMaxRange = maxTimeRange / 2;

  const limitedStartTime = centerTime - halfMaxRange;
  const limitedEndTime = centerTime + halfMaxRange;

  return candleData.filter((candle) => {
    const candleTime = Number(candle[0]);
    return candleTime >= limitedStartTime && candleTime <= limitedEndTime;
  });
};

// 거래 히스토리도 동일하게 필터링하는 함수
const getVisibleTradingHistory = (
  tradingHistory: TradingHistory[],
  visibleDomain: [Date, Date],
  maxDays: number = 10
): TradingHistory[] => {
  const [startDate, endDate] = visibleDomain;

  const maxTimeRange = maxDays * 24 * 60 * 60 * 1000;
  const visibleTimeRange = endDate.getTime() - startDate.getTime();

  if (visibleTimeRange <= maxTimeRange) {
    return tradingHistory.filter((trade) => {
      const tradeTime = new Date(trade.timestamp);
      return tradeTime >= startDate && tradeTime <= endDate;
    });
  }

  const centerTime = startDate.getTime() + visibleTimeRange / 2;
  const halfMaxRange = maxTimeRange / 2;

  const limitedStartTime = centerTime - halfMaxRange;
  const limitedEndTime = centerTime + halfMaxRange;

  return tradingHistory.filter((trade) => {
    const tradeTime = new Date(trade.timestamp).getTime();
    return tradeTime >= limitedStartTime && tradeTime <= limitedEndTime;
  });
};

// 지표 데이터도 동일하게 필터링하는 함수
const getVisibleIndicators = (
  indicators: IndicatorData,
  visibleCandleData: BybitKline[]
): IndicatorData => {
  if (!visibleCandleData.length) return indicators;

  // 보이는 캔들 데이터의 타임스탬프 범위
  const visibleTimestamps = new Set(
    visibleCandleData.map((candle) => Number(candle[0]))
  );

  const filteredIndicators: IndicatorData = {};

  // 각 지표 타입별로 필터링
  if (indicators.macd) {
    filteredIndicators.macd = indicators.macd.filter((item: any) =>
      visibleTimestamps.has(item.timestamp)
    );
  }

  if (indicators.vwapmacd) {
    filteredIndicators.vwapmacd = indicators.vwapmacd.filter((item: any) =>
      visibleTimestamps.has(item.timestamp)
    );
  }

  if (indicators.ma5) {
    filteredIndicators.ma5 = indicators.ma5.filter((item: any) =>
      visibleTimestamps.has(item.timestamp)
    );
  }

  if (indicators.ma10) {
    filteredIndicators.ma10 = indicators.ma10.filter((item: any) =>
      visibleTimestamps.has(item.timestamp)
    );
  }

  if (indicators.ma20) {
    filteredIndicators.ma20 = indicators.ma20.filter((item: any) =>
      visibleTimestamps.has(item.timestamp)
    );
  }

  if (indicators.bollingerBands) {
    filteredIndicators.bollingerBands = indicators.bollingerBands.filter(
      (item: any) => visibleTimestamps.has(item.timestamp)
    );
  }

  if (indicators.vwap) {
    filteredIndicators.vwap = indicators.vwap.filter((item: any) =>
      visibleTimestamps.has(item.timestamp)
    );
  }

  if (indicators.vwap2) {
    filteredIndicators.vwap2 = indicators.vwap2.filter((item: any) =>
      visibleTimestamps.has(item.timestamp)
    );
  }

  if (indicators.rsi) {
    filteredIndicators.rsi = indicators.rsi.filter((item: any) =>
      visibleTimestamps.has(item.timestamp)
    );
  }

  if (indicators.sar) {
    filteredIndicators.sar = indicators.sar.filter((item: any) =>
      visibleTimestamps.has(item.timestamp)
    );
  }

  if (indicators.boundaries) {
    filteredIndicators.boundaries = indicators.boundaries.filter((item: any) =>
      visibleTimestamps.has(item.timestamp)
    );
  }

  return filteredIndicators;
};

export default function Draw({
  svgRef,
  candleData,
  height,
  candleChartHeightRatio = 0.55,
  macdChartHeightRatio = 0.7,
  macd2ChartHeightRatio = 0.85,
  rsiChartHeightRatio = 0.95,
  indicators,
  tradingHistory,
}: Props) {
  const [divWidth, setDivWidth] = React.useState(0);
  const divRef = React.useRef<HTMLDivElement>(null);
  const zoomRef = React.useRef<any>(d3.zoomIdentity);
  const zoomBehaviorRef = React.useRef<any>(null); // zoom behavior 저장
  const candleWidthRef = React.useRef<number>(0); // 기본 캔들 너비 저장
  const zoomedCandleWidthRef = React.useRef<number>(0); // 줌 적용된 캔들 너비 저장
  const { selectedTradeInfo } = useTradeStore();

  const scaleRef = React.useRef({
    x: d3.scaleTime(),
    xIndex: d3.scaleLinear(),
    y: d3.scaleLinear(),
    yVolume: d3.scaleLinear(),
    xDomain: [
      new Date(Number(candleData[0][0])),
      new Date(Number(candleData[candleData.length - 1][0])),
    ],
  });

  // selectedTradeInfo가 변경될 때 해당 거래 위치로 zoom behavior를 통해 애니메이션 이동
  React.useEffect(() => {
    if (
      !selectedTradeInfo ||
      !candleData.length ||
      !svgRef.current ||
      !zoomBehaviorRef.current
    )
      return;
    if (!selectedTradeInfo.focus) return;

    const { openTimeStamp, closeTimeStamp } = selectedTradeInfo;

    // 거래 기간 계산
    const tradePeriod = closeTimeStamp - openTimeStamp;

    // 거래 기간의 2배 정도를 보여주도록 범위 설정 (최소 1시간, 최대 1일)
    const minPadding = 60 * 60 * 1000; // 1시간
    const maxPadding = 24 * 60 * 60 * 1000; // 1일
    const padding = Math.max(minPadding, Math.min(maxPadding, tradePeriod));

    const newStartTime = openTimeStamp - padding;
    const newEndTime = closeTimeStamp + padding;

    // SVG와 width 계산
    const svg = d3.select(svgRef.current);
    const width = (divWidth || 300) - 70;

    // 원본 스케일 (전체 데이터 범위)
    const originalX = d3
      .scaleTime()
      .domain([
        new Date(Number(candleData[0][0])),
        new Date(Number(candleData[candleData.length - 1][0])),
      ])
      .range([Math.min(0, width - 1500), width]);

    // 타겟 도메인으로 transform 계산
    const targetDomain = [new Date(newStartTime), new Date(newEndTime)];
    const targetStartX = originalX(targetDomain[0]);
    const targetEndX = originalX(targetDomain[1]);
    const targetWidth = targetEndX - targetStartX;

    // 화면 너비에 맞추기 위한 스케일과 translate 계산
    const k = width / targetWidth;
    const tx = -targetStartX * k;

    const newTransform = d3.zoomIdentity.translate(tx, 0).scale(k);

    // zoom behavior를 통해 애니메이션으로 이동
    svg.call(zoomBehaviorRef.current.transform, newTransform).on("end", () => {
      // 애니메이션 완료 후 캔들과 다른 요소들 다시 그리기
      const rescaleX = newTransform.rescaleX(originalX);
      const visibleDomain = rescaleX.domain();

      // 줌된 상태에서도 보이는 영역의 데이터만 필터링
      const zoomedVisibleCandleData = getVisibleCandleData(
        candleData,
        visibleDomain as [Date, Date],
        5
      );
      const zoomedVisibleTradingData = getVisibleTradingHistory(
        tradingHistory || [],
        visibleDomain as [Date, Date],
        10
      );

      const {
        y: rescaleY,
        yVolume: rescaleYVolume,
        yMACD: rescaleYMACD,
        yMACD2: rescaleYMACD2,
        yRSI: rescaleYRSI,
      } = getScales({
        height,
        candleChartHeightRatio,
        macdChartHeightRatio,
        macd2ChartHeightRatio,
        rsiChartHeightRatio,
        candleData: zoomedVisibleCandleData,
        indicators,
        firstDate: visibleDomain[0],
        lastDate: visibleDomain[1],
      });

      // Canvas에서 기존 내용 지우고 다시 그리기
      const canvas = svg
        .select("foreignObject canvas")
        .node() as HTMLCanvasElement;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.clearRect(0, 0, width, height);

          // 줌 상태에 따라 캔들 너비 조정
          const zoomedCandleWidth = candleWidthRef.current * newTransform.k;
          zoomedCandleWidthRef.current = zoomedCandleWidth;

          // 필터링된 데이터로 렌더링
          drawCandlesOnCanvas(
            ctx,
            zoomedVisibleCandleData,
            rescaleX,
            rescaleY,
            zoomedCandleWidth
          );
          drawVolumeOnCanvas(
            ctx,
            zoomedVisibleCandleData,
            rescaleX,
            rescaleYVolume,
            zoomedCandleWidth,
            height
          );
          // 필터링된 지표 데이터 사용
          const filteredIndicators = getVisibleIndicators(
            indicators,
            zoomedVisibleCandleData
          );
          drawIndicators({
            ctx,
            indicators: filteredIndicators,
            x: rescaleX,
            yMACD: rescaleYMACD,
            yMACD2: rescaleYMACD2,
            yRSI: rescaleYRSI,
            y: rescaleY,
            activeWidth: zoomedCandleWidth,
          });
          drawMarkers(ctx, zoomedVisibleTradingData, rescaleX, rescaleY);
        }
      }

      // 거래 사각형도 다시 그리기
      drawTradeRect(svg, rescaleX, rescaleY, selectedTradeInfo);

      // zoomRef 업데이트
      zoomRef.current = newTransform;

      // 도메인 업데이트
      scaleRef.current.xDomain = visibleDomain;
    });
  }, [selectedTradeInfo, candleData, divWidth]);

  React.useEffect(() => {
    if (!svgRef.current || !indicators.macd) return;

    // SVG 선택 및 초기화
    const svg = d3.select(svgRef.current);
    const width = (divWidth || 300) - 70;

    svg.attr("width", divWidth);

    const currentDomain = scaleRef.current.xDomain;
    const originalX = d3
      .scaleTime()
      .domain([
        new Date(Number(candleData[0][0])),
        new Date(Number(candleData[candleData.length - 1][0])),
      ])
      .range([Math.min(0, width - 1500), width]);

    const x = originalX.copy().domain(currentDomain);
    const firstDate = x.invert(0);
    const lastDate = x.invert(width);

    // 현재 보이는 영역의 데이터만 필터링 (최대 10일)
    const visibleCandleData = getVisibleCandleData(
      candleData,
      [firstDate, lastDate],
      5
    );
    const visibleTradingData = getVisibleTradingHistory(
      tradingHistory || [],
      [firstDate, lastDate],
      5
    );

    const { y, yVolume, yMACD, yMACD2, yRSI } = getScales({
      height,
      candleChartHeightRatio,
      macdChartHeightRatio,
      macd2ChartHeightRatio,
      rsiChartHeightRatio,
      candleData: visibleCandleData, // 필터링된 데이터 사용
      indicators,
      firstDate,
      lastDate,
    });

    d3.select(".base-line-y").attr("x1", width).attr("x2", width);
    const yAxisGroup = d3
      .select(".y-axis")
      .attr("transform", `translate(${width}, 0)`);
    const yVolumeAxisGroup = d3
      .select(".y-volume-axis")
      .attr("transform", `translate(${width}, 0)`);
    const yMACDAxisGroup = d3
      .select(".y-macd-axis")
      .attr("transform", `translate(${width}, 0)`);
    const yMACD2AxisGroup = d3
      .select(".y-macd2-axis")
      .attr("transform", `translate(${width}, 0)`);
    const yRSIAxisGroup = d3
      .select(".y-rsi-axis")
      .attr("transform", `translate(${width}, 0)`);

    // 축 업데이트
    updateAxis({
      svg,
      x,
      y,
      yVolume,
      yMACD,
      yMACD2,
      yRSI,
      width,
      height,
      xAxisGroup: d3.select(".x-axis") as any,
      yAxisGroup: yAxisGroup as any,
      yVolumeAxisGroup: yVolumeAxisGroup as any,
      yMACDAxisGroup: yMACDAxisGroup as any,
      yMACD2AxisGroup: yMACD2AxisGroup as any,
      yRSIAxisGroup: yRSIAxisGroup as any,
    });

    // 캔들 너비 계산 (줌 상태에 따라 다르게 적용)
    let candleWidth: number;
    let activeWidth: number;

    // 새로운 기본 캔들 너비 계산
    const baseWidth =
      visibleCandleData.length > 1
        ? (x(new Date(Number(visibleCandleData[1][0]))) -
            x(new Date(Number(visibleCandleData[0][0])))) *
          0.7
        : (width / visibleCandleData.length) * 0.7;

    // 줌 상태인 경우
    if (zoomRef.current && zoomRef.current.k !== 1) {
      if (candleWidthRef.current === 0) {
        // 처음 줌이 설정된 경우
        candleWidthRef.current = baseWidth;
        candleWidth = baseWidth;
        activeWidth = candleWidth * zoomRef.current.k;
      } else {
        // 줌 상태에서 재렌더링된 경우 (indicators 변경 등)
        candleWidth = candleWidthRef.current;
        activeWidth = candleWidth * zoomRef.current.k;
      }
    } else {
      // 줌이 없는 상태
      candleWidthRef.current = baseWidth;
      candleWidth = baseWidth;
      activeWidth = candleWidth;
    }

    zoomedCandleWidthRef.current = activeWidth;

    // Canvas 생성 및 캔들/볼륨/MACD 그리기
    const { ctx } = createCanvasInSVG(svg, width, height);

    // 거래 사각형 그리기 (캔버스 아래에 그리기 위해 먼저 호출)
    drawTradeRect(svg, x, y, selectedTradeInfo);

    // 필터링된 데이터만 그리기
    drawCandlesOnCanvas(ctx, visibleCandleData, x, y, activeWidth);
    drawVolumeOnCanvas(ctx, visibleCandleData, x, yVolume, activeWidth, height);

    // 필터링된 지표 데이터 사용
    const filteredIndicators = getVisibleIndicators(
      indicators,
      visibleCandleData
    );
    drawIndicators({
      ctx,
      indicators: filteredIndicators,
      x,
      yMACD,
      yMACD2,
      yRSI,
      y,
      activeWidth,
    });

    // markers 그리기 (필터링된 거래 데이터 사용)
    drawMarkers(ctx, visibleTradingData, x, y);

    const listeningRect = svg
      .append("rect")
      .attr("class", "listening-rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "white")
      .attr("opacity", 0)
      .attr("cursor", "crosshair");

    // 이벤트 리스너 등록 (필터링된 데이터 사용)
    listeningRect
      .on("mousemove", (event) =>
        handleMouseMove({
          event,
          data: visibleCandleData, // 필터링된 데이터 사용
          svg,
          width,
          height,
          candleChartHeightRatio,
          macdChartHeightRatio,
          macd2ChartHeightRatio,
          rsiChartHeightRatio,
          y,
          yVolume,
          yMACD,
          yMACD2,
          yRSI,
          x,
          indicators,
        })
      )
      .on("mouseleave", handleMouseLeave);

    // --------------------------------------------- zoom 이벤트 처리
    const handleZoom = ({ transform }: any) => {
      // 새 transform 상태 저장
      zoomRef.current = transform;

      const rescaleX = transform.rescaleX(originalX);

      // Get visible domain
      const visibleDomain = rescaleX.domain();
      scaleRef.current.xDomain = visibleDomain;

      // 줌된 상태에서도 보이는 영역의 데이터만 필터링
      const zoomedVisibleCandleData = getVisibleCandleData(
        candleData,
        visibleDomain,
        5
      );
      const zoomedVisibleTradingData = getVisibleTradingHistory(
        tradingHistory || [],
        visibleDomain,
        5
      );

      // console.log(
      //   `줌 상태 - 전체 데이터: ${candleData.length}개, 필터링된 데이터: ${zoomedVisibleCandleData.length}개`
      // );

      const {
        y: rescaleY,
        yVolume: rescaleYVolume,
        yMACD: rescaleYMACD,
        yMACD2: rescaleYMACD2,
        yRSI: rescaleYRSI,
      } = getScales({
        height,
        candleChartHeightRatio,
        macdChartHeightRatio,
        macd2ChartHeightRatio,
        rsiChartHeightRatio,
        candleData: zoomedVisibleCandleData, // 필터링된 데이터 사용
        indicators,
        firstDate: visibleDomain[0],
        lastDate: visibleDomain[1],
      });

      updateAxis({
        svg,
        x: rescaleX,
        y: rescaleY,
        yVolume: rescaleYVolume,
        yMACD: rescaleYMACD,
        yMACD2: rescaleYMACD2,
        yRSI: rescaleYRSI,
        width,
        height,
        xAxisGroup: d3.select(".x-axis") as any,
        yAxisGroup: yAxisGroup as any,
        yVolumeAxisGroup: yVolumeAxisGroup as any,
        yMACDAxisGroup: yMACDAxisGroup as any,
        yMACD2AxisGroup: yMACD2AxisGroup as any,
        yRSIAxisGroup: yRSIAxisGroup as any,
      });

      // Canvas에 캔들과 거래량 다시 그리기
      if (ctx) {
        ctx.clearRect(0, 0, width, height);

        // 줌 상태에 따라 캔들 너비 조정
        const zoomedCandleWidth = candleWidthRef.current * transform.k;
        zoomedCandleWidthRef.current = zoomedCandleWidth;

        // 필터링된 데이터로 렌더링
        drawCandlesOnCanvas(
          ctx,
          zoomedVisibleCandleData,
          rescaleX,
          rescaleY,
          zoomedCandleWidth
        );
        drawVolumeOnCanvas(
          ctx,
          zoomedVisibleCandleData,
          rescaleX,
          rescaleYVolume,
          zoomedCandleWidth,
          height
        );
        // 필터링된 지표 데이터 사용
        const filteredIndicators = getVisibleIndicators(
          indicators,
          zoomedVisibleCandleData
        );
        drawIndicators({
          ctx,
          indicators: filteredIndicators,
          x: rescaleX,
          yMACD: rescaleYMACD,
          yMACD2: rescaleYMACD2,
          yRSI: rescaleYRSI,
          y: rescaleY,
          activeWidth: zoomedCandleWidth,
        });
        drawMarkers(ctx, zoomedVisibleTradingData, rescaleX, rescaleY);
      }

      // 줌 이벤트 후 거래 사각형 다시 그리기
      drawTradeRect(svg, rescaleX, rescaleY, selectedTradeInfo);

      listeningRect
        .on("mousemove", (event) =>
          handleMouseMove({
            event,
            data: zoomedVisibleCandleData, // 필터링된 데이터 사용
            indicators,
            svg,
            width,
            height,
            candleChartHeightRatio,
            macdChartHeightRatio,
            macd2ChartHeightRatio,
            rsiChartHeightRatio,
            x: rescaleX,
            y: rescaleY,
            yVolume: rescaleYVolume,
            yMACD: rescaleYMACD || yMACD,
            yMACD2: rescaleYMACD2 || yMACD2,
            yRSI: rescaleYRSI || yRSI,
          })
        )
        .on("mouseleave", handleMouseLeave);
    };

    // zoom 객체 새로 생성 - 매번 새로운 인스턴스를 만들어 이전 상태 제거
    const zoom = d3
      .zoom()
      .translateExtent([
        [Math.min(0, width - 1500), 0],
        [divWidth + 10, height],
      ])
      .on("zoom", handleZoom);

    // zoom behavior를 ref에 저장
    zoomBehaviorRef.current = zoom;

    svg.call(zoom as any);

    // 클린업 함수
    return () => {
      listeningRect.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    svgRef,
    divWidth,
    candleChartHeightRatio,
    candleData,
    indicators,
    selectedTradeInfo,
  ]);

  React.useEffect(() => {
    const handleResize = () => {
      if (!divRef.current) return;
      const { width } = divRef.current.getBoundingClientRect();
      setDivWidth(width);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [candleData]);

  return (
    <div className="absolute inset-0 pointer-events-none" ref={divRef}>
      <Interaction svgRef={svgRef} />
    </div>
  );
}
