import { computed, signal } from "@angular/core";
import { EdgeLabel } from "../interfaces/edge-label.interface";
import { Point } from '../interfaces/point.interface';

export class EdgeLabelModel {
  public size = signal({ width: 0, height: 0 });

  public labelPoint = computed(() => {
    const point = this.pointSignal();
    const { width, height } = this.size();

    return {
      x: point.x - width / 2,
      y: point.y - height / 2,
    };
  });

  public set point(point: Point) {
    this.pointSignal.set(point);
  }

  protected pointSignal = signal({ x: 0, y: 0 });

  constructor(public edgeLabel: EdgeLabel) {}
}
