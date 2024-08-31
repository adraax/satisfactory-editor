import { computed, inject, Signal, signal } from "@angular/core";
import { toObservable, toSignal } from "@angular/core/rxjs-interop";
import { animationFrameScheduler, observeOn } from "rxjs";
import { Entity } from "../interfaces/entity.interface";
import { DynamicNode, isDynamicNode, Node } from "../interfaces/node.interface";
import { EditorSettingsService } from "../services/editor-settings.service";
import { EntitiesService } from "../services/entities.service";

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

  constructor(public node: Node<T> | DynamicNode<T>) {}

  private createInternalPointSignal() {
    return isDynamicNode(this.node) ? this.node.point : signal({ x: this.node.point.x, y: this.node.point.y });
  }
}
