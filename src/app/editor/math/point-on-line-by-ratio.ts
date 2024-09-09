import { Point } from "../interfaces/point.interface";

export function getPointOnLineByRatio(start: Point, end: Point, ratio: number): Point {
  return {
    x: (1 - ratio) * start.x + ratio * end.x,
    y: (1 - ratio) * start.y + ratio * end.y,
  };
}
