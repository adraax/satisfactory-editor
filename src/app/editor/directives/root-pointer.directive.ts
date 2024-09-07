import { Directive, ElementRef, inject } from "@angular/core";
import { animationFrameScheduler, fromEvent, map, mergeMap, observeOn, share, skip, Subject, takeUntil, tap } from "rxjs";

@Directive({ selector: "svg[rootPointer]" })
export class RootPointerDirective {
  private host = inject<ElementRef<SVGSVGElement>>(ElementRef).nativeElement;

  private initialTouch$ = new Subject<TouchEvent>();

  private previous = { x: 0, y: 0 };

  private mouseDown$ = fromEvent<MouseEvent>(this.host, "mousedown");
  private mouseUp$ = fromEvent(document, "mouseup");
  private mouseMove$ = fromEvent<MouseEvent>(this.host, "mousemove");

  public mouseMovement$ = this.mouseDown$.pipe(
    tap((event) => this.previous = {x: event.clientX, y: event.clientY}),
    mergeMap((down) => {
      return this.mouseMove$.pipe(
        skip(1),
        map((event) => ({
          tX: event.clientX - this.previous.x,
          tY: event.clientY - this.previous.y,
          x: event.x,
          y: event.y,
          originalEvent: event,
        })),
        observeOn(animationFrameScheduler),
        tap((event) => (this.previous = { x: event.x, y: event.y })),
        share(),
        takeUntil(this.mouseUp$)
      );
    })
  );

  public setInitialTouch(event: TouchEvent) {
    this.initialTouch$.next(event);
  }
}
