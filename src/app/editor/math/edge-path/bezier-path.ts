import { path as d3Path, Path } from "d3-path";
import { PathData } from "../../interfaces/path-data.interface";
import { Point } from "../../interfaces/point.interface";
import { Position } from "../../types/position.type";
import { UsingPoints } from "../../types/using-points.type";
import { getPointOnLineByRatio } from "../point-on-line-by-ratio";

export function bezierPath(
  source: Point,
  target: Point,
  sourcePosition: Position,
  targetPosition: Position,
  usingPoints: UsingPoints = [false, false, false]
): PathData {
  const path = d3Path();

  path.moveTo(source.x, source.y);

  const distanceVector = { x: source.x - target.x, y: source.y - target.y };

  const firstControl = calcControlPoint(source, sourcePosition, distanceVector);
  const secondControl = calcControlPoint(target, targetPosition, distanceVector);

  path.bezierCurveTo(firstControl.x, firstControl.y, secondControl.x, secondControl.y, target.x, target.y);

  return getPathData(path, source, target, firstControl, secondControl, usingPoints);
}

/**
 * Calculate control point based on provided point
 *
 * @param point relative this point control point is gonna be computed (the source or the target)
 * @param pointPosition position of {point} on block
 * @param distanceVector transmits the distance between the source and the target as x and y coordinates
 */
function calcControlPoint(point: Point, pointPosition: Position, distanceVector: Point) {
  const factorPoint = { x: 0, y: 0 };

  switch (pointPosition) {
    case "top":
      factorPoint.y = 1;
      break;
    case "bottom":
      factorPoint.y = -1;
      break;
    case "left":
      factorPoint.x = -1;
      break;
    case "right":
      factorPoint.x = 1;
      break;
  }

  const fullDistanceVector = {
    x: distanceVector.x * Math.abs(factorPoint.x),
    y: distanceVector.y * Math.abs(factorPoint.y),
  };

  const curvature = 0.25;
  const controlOffset = curvature * 25 * Math.sqrt(Math.abs(fullDistanceVector.x + fullDistanceVector.y));

  return {
    x: point.x + factorPoint.x * controlOffset,
    y: point.y - factorPoint.y * controlOffset,
  };
}

function getPathData(
  path: Path,
  source: Point,
  target: Point,
  firstControl: Point,
  secondControl: Point,
  usingPoints: UsingPoints
): PathData {
  const [start, center, end] = usingPoints;

  const nullPoint = { x: 0, y: 0 };

  return {
    path: path.toString(),
    points: {
      start: start ? getPointOnBezierByRatio(source, target, firstControl, secondControl, 0.15) : nullPoint,
      center: center ? getPointOnBezierByRatio(source, target, firstControl, secondControl, 0.5) : nullPoint,
      end: end ? getPointOnBezierByRatio(source, target, firstControl, secondControl, 0.85) : nullPoint,
    },
  };
}

function getPointOnBezierByRatio(
  sourcePoint: Point,
  targetPoint: Point,
  firstControl: Point,
  secondControl: Point,
  ratio: number
): Point {
  const fromSourceToFirstControl: Point = getPointOnLineByRatio(sourcePoint, firstControl, ratio);
  const fromFirstControlToSecondControl: Point = getPointOnLineByRatio(firstControl, secondControl, ratio);
  const fromSecondControlToTarget: Point = getPointOnLineByRatio(secondControl, targetPoint, ratio);

  return getPointOnLineByRatio(
    getPointOnLineByRatio(fromSourceToFirstControl, fromFirstControlToSecondControl, ratio),
    getPointOnLineByRatio(fromFirstControlToSecondControl, fromSecondControlToTarget, ratio),
    ratio
  );
}
