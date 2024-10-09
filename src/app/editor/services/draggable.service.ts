import { inject, Injectable } from "@angular/core";
import { zoomTransform } from "d3-zoom";
import {
  animationFrameScheduler,
  fromEvent,
  map,
  mergeMap,
  Observable,
  observeOn,
  share,
  Subscription,
  takeUntil,
  tap,
} from "rxjs";
import { NodeModel } from "../models/node.model";
import { round } from "../utils/round";
import { EntitiesService } from './entities.service';

@Injectable()
export class DraggableService {
  private entitiesService = inject(EntitiesService);

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
          map((event) => ({
            tx: event.x - previous.x,
            ty: event.y - previous.y,
            x: event.x,
            y: event.y,
            originalEvent: event,
          })),
          observeOn(animationFrameScheduler),
          takeUntil(mouseUp$),
          tap((event) => (previous = { x: event.x, y: event.y })),
          share()
        );
      })
    );

    let drag = mouseMovement$.subscribe((event) => {
      event.originalEvent.stopPropagation();
      const transform = zoomTransform(rootSvg);

      this.entitiesService.nodes().filter(e => e.selected()).forEach(n => {
        let deltaX = n.point().x;
        let deltaY = n.point().y;
        let point = { x: round(event.tx / transform.k + deltaX), y: round(event.ty / transform.k + deltaY) };
        
        n.setPoint(point);
      }) 

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
