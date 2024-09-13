import { Directive, ElementRef, EventEmitter, HostListener, inject, Output } from "@angular/core";

@Directive({ selector: "[pointerStart], [pointerEnd], [pointerOver], [pointerOut]" })
export class PointerDirective {
  protected host = inject<ElementRef<Element>>(ElementRef).nativeElement;

  @Output()
  protected pointerOver = new EventEmitter<Event>();

  @Output()
  protected pointerOut = new EventEmitter<Event>();

  @Output()
  protected pointerStart = new EventEmitter<Event>();

  @Output()
  protected pointerEnd = new EventEmitter<Event>();

  @HostListener("mousedown", ["$event"])
  protected onPointerStart(event: Event) {
    this.pointerStart.emit(event);
  }

  @HostListener("mouseup", ["$event"])
  protected onPointerEnd(event: Event) {
    this.pointerEnd.emit(event);
  }

  @HostListener("mouseover", ["$event"])
  protected onPointOver(event: Event) {
    this.pointerOver.emit(event);
  }

  @HostListener("mouseout", ["$event"])
  protected onPointerOut(event: Event) {
    this.pointerOut.emit(event);
  }
}
