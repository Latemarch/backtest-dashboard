import fs from 'fs';
import path from 'path';

interface CandleData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface LocalDataResponse {
  hasLocalData: boolean;
  data?: CandleData[];
}

// 사용 가능한 로컬 데이터 파일 목록
const LOCAL_DATA_FILES = [
  '20240901-20240930.json',
  '20241001-20241031.json',
  '20241001-20241231.json',
  '20241101-20241130.json',
  '20241201-20241231.json',
  '20250101-20250131.json',
  '20250101-20250331.json',
  '20250201-20250228.json',
  '20250301-20250331.json',
  '20250401-20250430.json',
  '20250501-20250531.json',
  '20250601-20250630.json',
];

/**
 * 날짜 문자열을 타임스탬프로 변환
 * @param date - YYYYMMDD 형식의 날짜 문자열
 * @returns 타임스탬프 (밀리초)
 */
function dateToTimestamp(date: string): number {
  const year = date.slice(0, 4);
  const month = date.slice(4, 6);
  const day = date.slice(6, 8);
  return new Date(`${year}-${month}-${day}`).getTime();
}

/**
 * 파일명에서 날짜 범위를 추출
 * @param filename - 파일명 (예: 20250101-20250131.json)
 * @returns 시작일과 종료일의 타임스탬프
 */
function extractDateRangeFromFilename(filename: string): { start: number; end: number } | null {
  const match = filename.match(/(\d{8})-(\d{8})\.json/);
  if (!match) return null;

  const startDate = match[1];
  const endDate = match[2];

  return {
    start: dateToTimestamp(startDate),
    end: dateToTimestamp(endDate) + 24 * 60 * 60 * 1000 - 1, // 해당 날짜의 마지막 밀리초
  };
}

/**
 * 요청된 날짜 범위를 포함하는 로컬 데이터 파일을 찾음
 * @param requestStart - 요청 시작 타임스탬프
 * @param requestEnd - 요청 종료 타임스탬프
 * @returns 적절한 파일명 또는 null
 */
function findMatchingLocalFile(requestStart: number, requestEnd: number): string | null {
  for (const filename of LOCAL_DATA_FILES) {
    const dateRange = extractDateRangeFromFilename(filename);
    if (!dateRange) continue;

    // 요청 범위가 로컬 데이터 범위에 포함되는지 확인
    if (requestStart >= dateRange.start && requestEnd <= dateRange.end) {
      return filename;
    }
  }
  return null;
}

/**
 * 로컬 데이터에서 요청된 범위의 캔들 데이터를 가져옴
 * @param start - 시작 날짜 (YYYYMMDD 형식)
 * @param end - 종료 날짜 (YYYYMMDD 형식)
 * @returns 로컬 데이터 응답
 */
export async function getLocalCandleData(start: string, end: string): Promise<LocalDataResponse> {
  try {
    const requestStart = dateToTimestamp(start);
    const requestEnd = dateToTimestamp(end) + 24 * 60 * 60 * 1000 - 1; // 해당 날짜의 마지막 밀리초

    // 적절한 로컬 파일 찾기
    const matchingFile = findMatchingLocalFile(requestStart, requestEnd);

    if (!matchingFile) {
      return { hasLocalData: false };
    }

    // 파일 읽기
    const filePath = path.join(process.cwd(), 'public', 'candles', matchingFile);
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const allCandles: CandleData[] = JSON.parse(fileContent);

    // 요청된 범위에 해당하는 데이터만 필터링
    const filteredCandles = allCandles.filter(
      (candle) => candle.timestamp >= requestStart && candle.timestamp <= requestEnd
    );

    return {
      hasLocalData: true,
      data: filteredCandles,
    };
  } catch (error) {
    console.error('로컬 데이터 읽기 오류:', error);
    return { hasLocalData: false };
  }
}
