import { computed, Directive, effect, ElementRef, inject, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Point } from '../interfaces/point.interface';
import { RootSvgReferenceDirective } from './reference.directive';
import { RootPointerDirective } from './root-pointer.directive';

@Directive({ selector: 'g[spacePointContext]' })
export class SpacePointContextDirective {
  private rootPointerDirective = inject(RootPointerDirective);
  private rootSvg = inject(RootSvgReferenceDirective).element;
  private host = inject<ElementRef<SVGSVGElement>>(ElementRef).nativeElement;

  public svgCurrentSpacePoint: Signal<Point> = computed(() => {
    const movement = this.pointerMovement();

    if (!movement) {
      return { x: 0, y: 0 };
    }

    return { x: movement.x, y: movement.y };
  });

  public pointerMovement = toSignal(this.rootPointerDirective.mouseMovement$);

  public documentPointToFlowPoint(documentPoint: Point) {
    const point = this.rootSvg.createSVGPoint();
    point.x = documentPoint.x;
    point.y = documentPoint.y;

    return point.matrixTransform(this.host.getScreenCTM()!.inverse());
  }
}
