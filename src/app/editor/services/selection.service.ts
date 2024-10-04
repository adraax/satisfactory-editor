import { inject, Injectable } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { Subject, tap } from "rxjs";
import { Entity } from "../interfaces/entity.interface";
import { ViewportState } from "../interfaces/viewport.interface";
import { EntitiesService } from "./entities.service";

export interface ViewportForSelection {
  start: ViewportState;
  end: ViewportState;
  target?: Element;
}

@Injectable()
export class SelectionService {
  private static delta = 6;

  private entitiesService = inject(EntitiesService);

  protected viewport$ = new Subject<ViewportForSelection>();

  protected resetSelection = this.viewport$
    .pipe(
      tap(({ start, end, target }) => {
        if (start && end && target) {
          const delta = SelectionService.delta;

          const diffX = Math.abs(end.x - start.x);
          const diffY = Math.abs(end.y - start.y);

          // click (not drag)
          const isClick = diffX < delta && diffY < delta;
          // do not reset if event chain contains selectable elems
          const isNotSelectable = !target.closest(".selectable");

          if (isClick && isNotSelectable) {
            this.select(null);
          }
        }
      }),
      takeUntilDestroyed()
    )
    .subscribe();

  public setViewport(viewport: ViewportForSelection) {
    this.viewport$.next(viewport);
  }

  public select(entity: Entity | null, multiple: boolean = false) {
    if (!multiple) {
      this.entitiesService
        .entities()
        .filter((e) => e.selected)
        .forEach((e) => e.selected.set(false));
    }

    if (entity) {
      entity.selected.set(true);
    }
  }
}
