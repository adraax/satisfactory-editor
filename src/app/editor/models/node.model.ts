import { computed, effect, inject, Signal, signal } from "@angular/core";
import { toObservable, toSignal } from "@angular/core/rxjs-interop";
import { animationFrameScheduler, observeOn } from "rxjs";
import { Entity } from "../interfaces/entity.interface";
import { DynamicNode, isDynamicNode, Node } from "../interfaces/node.interface";
import { Point } from "../interfaces/point.interface";
import { CustomDynamicNodeComponent } from "../public-components/custom-dynamic-node.component";
import { CustomNodeComponent } from "../public-components/custom-node.component";
import { EditorSettingsService } from "../services/editor-settings.service";
import { EntitiesService } from "../services/entities.service";
import { HandleModel } from "./handle.model";

export class NodeModel<T = unknown> implements Entity {
  private static defaultWidth = 100;
  private static defaultHeight = 50;
  private static defaultColor = "#1b262c";

  private editorSettingsService = inject(EditorSettingsService);
  private entitiesService = inject(EntitiesService);

  private internalPoint = this.createInternalPointSignal();
  private throttledPoint$ = toObservable(this.internalPoint).pipe(observeOn(animationFrameScheduler));

  private parentId = signal<string | null>(null);

  public parent: Signal<NodeModel | null> = computed(
    () => this.entitiesService.nodes().find((n) => n.node.id === this.parentId()) ?? null
  );

  public point = toSignal(this.throttledPoint$, {
    initialValue: this.internalPoint(),
  });

  public point$ = this.throttledPoint$;

  public size = signal({ width: 0, height: 0 });

  public renderOrder = signal(0);

  public selected = signal(false);
  public selected$ = toObservable(this.selected);

  public globalPoint = computed(() => {
    let parent = this.parent();
    let x = this.point().x;
    let y = this.point().y;

    while (parent !== null) {
      x += parent.point().x;
      y += parent.point().y;

      parent = parent.parent();
    }

    return { x, y };
  });

  public pointTransform = computed(() => `translate(${this.globalPoint().x}, ${this.globalPoint().y})`);

  public sourcePosition = computed(() => this.editorSettingsService.handlePositions().source);
  public targetPosition = computed(() => this.editorSettingsService.handlePositions().target);

  public handles = signal<HandleModel[]>([]);
  public handles$ = toObservable(this.handles);

  public draggable = signal(true);

  public readonly magnetRadius = 20;

  public isComponentType =
    CustomNodeComponent.isPrototypeOf(this.node.type) || CustomDynamicNodeComponent.isPrototypeOf(this.node.type);

  public componentTypeInputs = computed(() => {
    return {
      node: this.node,
      _selected: this.selected(),
    };
  });

  public text = this.createTextSignal();

  public color = signal(NodeModel.defaultColor);

  constructor(public node: Node<T> | DynamicNode<T>) {}

  private createTextSignal(): Signal<string> {
    const node = this.node;

    if (node.type === "default") {
      if (isDynamicNode(node)) {
        return node.text ?? signal("");
      } else {
        return signal(node.text ?? "");
      }
    }

    return signal("");
  }

  private createInternalPointSignal() {
    return isDynamicNode(this.node) ? this.node.point : signal({ x: this.node.point.x, y: this.node.point.y });
  }

  public setPoint(point: Point) {
    this.internalPoint.set(point);
  }

  public linkDefaultNodeSizeWithModelSize() {
    const node = this.node;

    switch (node.type) {
      case "default":
      case "default-group":
      case "template-group":
        if (isDynamicNode(node)) {
          effect(
            () => {
              this.size.set({
                width: node.width?.() ?? NodeModel.defaultWidth,
                height: node.height?.() ?? NodeModel.defaultHeight,
              });
            },
            { allowSignalWrites: true }
          );
        } else {
          this.size.set({
            width: node.width ?? NodeModel.defaultWidth,
            height: node.height ?? NodeModel.defaultHeight,
          });
        }
    }
  }
}
