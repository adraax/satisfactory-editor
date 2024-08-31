import { DestroyRef, Directive, EventEmitter, inject, Input, OnInit, signal } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { merge, tap } from "rxjs";
import { ComponentDynamicNode, ComponentNode } from "../../interfaces/node.interface";

@Directive()
export abstract class CustomNodeBaseComponent<T = unknown> implements OnInit {
  // TODO event bus

  protected destroyRef = inject(DestroyRef);

  protected node!: ComponentNode | ComponentDynamicNode;

  @Input()
  public set _selected(value: boolean) {
    this.selected.set(value);
  }

  public selected = signal(false);
  public data = signal<T | undefined>(undefined);

  public ngOnInit(): void {
    this.trackEvents().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
  }

  private trackEvents() {
    const props = Object.getOwnPropertyNames(this);

    const emitters = new Map<EventEmitter<unknown>, string>();
    for (const prop of props) {
      const field = (this as Record<string, unknown>)[prop];

      if (field instanceof EventEmitter) {
        emitters.set(field, prop);
      }
    }

    return merge(
      ...Array.from(emitters.keys()).map((emitter) =>
        emitter.pipe(
          tap((event) => {
            // TODO add event to bus
          })
        )
      )
    );
  }
}
