import { Observable } from 'rxjs';

export function resizable(elems: Element[]) {
  return new Observable<ResizeObserverEntry[]>((sub) => {
    let ro = new ResizeObserver((entries) => {
      sub.next(entries);
    });

    elems.forEach((e) => ro.observe(e));

    return () => ro.disconnect();
  });
}
