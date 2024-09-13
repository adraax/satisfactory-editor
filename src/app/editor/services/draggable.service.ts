import { Injectable } from "@angular/core";
import { zoomTransform } from "d3-zoom";
import {
  animationFrameScheduler,
  fromEvent,
  map,
  mergeMap,
  Observable,
  observeOn,
  share,
  skip,
  Subscription,
  takeUntil,
  tap,
} from "rxjs";
import { NodeModel } from "../models/node.model";
import { round } from "../utils/round";

@Injectable()
export class DraggableService {
  private events$: Map<
    Element,
    {
      mouseDown: Observable<MouseEvent>;
      mouseUp: Observable<MouseEvent>;
      mouseMove: Observable<MouseEvent>;
      mouseMovement: Observable<any>;
      drag?: Subscription;
    }
  > = new Map();

  public enable(element: Element, rootSvg: SVGSVGElement, model: NodeModel) {
    let mouseDown$ = fromEvent<MouseEvent>(element, "mousedown");
    let mouseUp$ = fromEvent<MouseEvent>(document, "mouseup");
    let mouseMove$ = fromEvent<MouseEvent>(document, "mousemove");

    let previous = { x: 0, y: 0 };

    let mouseMovement$ = mouseDown$.pipe(
      tap((event) => {
        event.stopPropagation();
        previous = { x: event.x, y: event.y };
      }),
      mergeMap((down) => {
        return mouseMove$.pipe(
          skip(1),
          map((event) => ({
            dx: down.x,
            dy: down.y,
            tx: event.x - previous.x,
            ty: event.y - previous.y,
            x: event.x,
            y: event.y,
            originalEvent: event,
          })),
          observeOn(animationFrameScheduler),
          tap((event) => (previous = { x: event.x, y: event.y })),
          share(),
          takeUntil(mouseUp$)
        );
      })
    );

    let drag = mouseMovement$.subscribe((event) => {
      event.originalEvent.stopPropagation();
      const transform = zoomTransform(rootSvg);
      let deltaX = model.point().x;
      let deltaY = model.point().y;
      let point = { x: round(event.tx / transform.k + deltaX), y: round(event.ty / transform.k + deltaY) };

      const parent = model.parent();

      if (parent) {
      }

      model.setPoint(point);
    });

    this.events$.set(element, {
      mouseDown: mouseDown$,
      mouseUp: mouseUp$,
      mouseMove: mouseMove$,
      mouseMovement: mouseMovement$,
      drag: drag,
    });
  }

  public destroy(element: Element) {
    let events = this.events$.get(element)!;
    events.drag?.unsubscribe();
    this.events$.delete(element);
  }
}
