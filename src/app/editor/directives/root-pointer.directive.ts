import { Directive, ElementRef, inject } from "@angular/core";
import {
  animationFrameScheduler,
  fromEvent,
  map,
  mergeMap,
  observeOn,
  share,
  startWith,
  Subject,
  takeUntil,
  tap,
} from "rxjs";

@Directive({ selector: "svg[rootPointer]" })
export class RootPointerDirective {
  private host = inject<ElementRef<SVGSVGElement>>(ElementRef).nativeElement;

  private initialTouch$ = new Subject<TouchEvent>();

  private previous = { x: 0, y: 0 };

  private mouseDownWithCapture$ = fromEvent<MouseEvent>(this.host, "mousedown", { capture: true });

  private mouseDown$ = fromEvent<MouseEvent>(this.host, "mousedown");
  private mouseUp$ = fromEvent(document, "mouseup");
  private mouseMove$ = fromEvent<MouseEvent>(document, "mousemove");

  public mousePosition$ = this.mouseDownWithCapture$.pipe(
    mergeMap((down) => {
      return this.mouseMove$.pipe(
        map((event) => ({
          x: event.x,
          y: event.y,
          originalEvent: event,
        })),
        startWith({ x: down.x, y: down.y }),
        observeOn(animationFrameScheduler),
        takeUntil(this.mouseUp$),
        share()
      );
    })
  );

  public mouseMovement$ = this.mouseDown$.pipe(
    tap((event) => (this.previous = { x: event.clientX, y: event.clientY })),
    mergeMap((down) => {
      return this.mouseMove$.pipe(
        map((event) => ({
          tX: event.clientX - this.previous.x,
          tY: event.clientY - this.previous.y,
          x: event.clientX,
          y: event.clientY,
        })),
        observeOn(animationFrameScheduler),
        takeUntil(this.mouseUp$),
        tap((event) => {
          this.previous = { x: event.x, y: event.y };
        }),
        share()
      );
    })
  );

  public setInitialTouch(event: TouchEvent) {
    this.initialTouch$.next(event);
  }
}
