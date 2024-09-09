import { computed, signal } from "@angular/core";
import { toObservable } from "@angular/core/rxjs-interop";
import { EdgeLabelPosition } from "../interfaces/edge-label.interface";
import { Curve, Edge, EdgeType } from "../interfaces/edge.interface";
import { Entity } from "../interfaces/entity.interface";
import { bezierPath } from "../math/edge-path/bezier-path";
import { straightPath } from "../math/edge-path/straight-path";
import { UsingPoints } from "../types/using-points.type";
import { EdgeLabelModel } from "./edge-label.model";
import { HandleModel } from "./handle.model";
import { NodeModel } from "./node.model";

export class EdgeModel implements Entity {
  public source = signal<NodeModel | undefined>(undefined);
  public target = signal<NodeModel | undefined>(undefined);
  public curve: Curve;
  public type: EdgeType;

  public selected = signal(false);
  public selected$ = toObservable(this.selected);

  public detached = computed(() => {
    const source = this.source();
    const target = this.target();

    if (!source || !target) {
      return true;
    }

    let existsSourceHandle = false;
    let existsTargetHandle = false;

    if (this.edge.sourceHandle) {
      existsSourceHandle = !!source.handles().find((handle) => handle.rawHandle.id === this.edge.sourceHandle);
    } else {
      existsSourceHandle = !!source.handles().find((handle) => handle.rawHandle.type === "source");
    }

    if (this.edge.targetHandle) {
      existsTargetHandle = !!target.handles().find((handle) => handle.rawHandle.id === this.edge.targetHandle);
    } else {
      existsTargetHandle = !!target.handles().find((handle) => handle.rawHandle.type === "target");
    }

    return !existsSourceHandle || !existsTargetHandle;
  });

  public detached$ = toObservable(this.detached);

  public path = computed(() => {
    let source: HandleModel | undefined;
    let target: HandleModel | undefined;

    if (this.edge.sourceHandle) {
      source = this.source()
        ?.handles()
        .find((handle) => handle.rawHandle.id === this.edge.sourceHandle);
    } else {
      source = this.source()
        ?.handles()
        .find((handle) => handle.rawHandle.type === "source");
    }

    if (this.edge.targetHandle) {
      target = this.target()
        ?.handles()
        .find((handle) => handle.rawHandle.id === this.edge.targetHandle);
    } else {
      target = this.target()
        ?.handles()
        .find((handle) => handle.rawHandle.type === "target");
    }

    if (!source || !target) {
      return {
        path: "",
        points: {
          start: { x: 0, y: 0 },
          center: { x: 0, y: 0 },
          end: { x: 0, y: 0 },
        },
      };
    }

    switch (this.curve) {
      case "straight":
        return straightPath(source.pointAbsolute(), target.pointAbsolute(), this.usingPoints);
      case "bezier":
        return bezierPath(
          source.pointAbsolute(),
          target.pointAbsolute(),
          source.rawHandle.position,
          target.rawHandle.position,
          this.usingPoints
        );
    }
  });

  public edgeLabels: { [position in EdgeLabelPosition]?: EdgeLabelModel } = {};

  private usingPoints: UsingPoints;

  constructor(public edge: Edge) {
    this.type = edge.type ?? "default";
    this.curve = edge.curve ?? "bezier";

    if (edge.edgeLabels?.start) {
      this.edgeLabels.start = new EdgeLabelModel(edge.edgeLabels.start);
    }
    if (edge.edgeLabels?.center) {
      this.edgeLabels.center = new EdgeLabelModel(edge.edgeLabels.center);
    }
    if (edge.edgeLabels?.end) {
      this.edgeLabels.end = new EdgeLabelModel(edge.edgeLabels.end);
    }

    this.usingPoints = [!!this.edgeLabels.start, !!this.edgeLabels.center, !!this.edgeLabels.end];
  }
}
