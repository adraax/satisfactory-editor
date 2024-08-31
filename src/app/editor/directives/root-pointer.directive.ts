import { Directive, ElementRef, inject } from '@angular/core';
import {
  animationFrameScheduler,
  fromEvent,
  map,
  mergeMap,
  observeOn,
  share,
  Subject,
  takeUntil,
  tap,
} from 'rxjs';

@Directive({ selector: 'svg[rootPointer]' })
export class RootPointerDirective {
  private host = inject<ElementRef<SVGSVGElement>>(ElementRef).nativeElement;

  private initialTouch$ = new Subject<TouchEvent>();

  private translate = {x: 0, y: 0}
  private translateStart = {x: 0, y: 0};

  private mouseDown$ = fromEvent<MouseEvent>(this.host, 'mousedown');
  private mouseUp$ = fromEvent(document, 'mouseup');
  private mouseMove$ = fromEvent<MouseEvent>(this.host, 'mousemove');

  public mouseMovement$ = this.mouseDown$.pipe(
    tap(() => {
      this.translateStart = this.translate;
    }),
    mergeMap((down) => {
      return this.mouseMove$.pipe(
        tap((event) => {
          this.translate.x = (this.translateStart.x + event.pageX - down.pageX) / 2;
          this.translate.y = (this.translateStart.y + event.pageY - down.pageY) / 2;
        }),
        map((event) => ({
          tX: this.translate.x,
          tY: this.translate.y,
          x: event.x,
          y: event.y,
          originalEvent: event,
        })),
        observeOn(animationFrameScheduler),
        share(),
        takeUntil(this.mouseUp$)
      );
    })
  );

  public setInitialTouch(event: TouchEvent) {
    this.initialTouch$.next(event);
  }
}
