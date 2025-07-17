import { Position } from "../../types/type";

type Res = { ok: boolean; execution: any; position: Position } | null;
export function makeHistory(res: Res) {
  if (!res?.ok || !res?.execution) return null;
  const { liqSide, price, timestamp } = res.execution;

  return [];
}
