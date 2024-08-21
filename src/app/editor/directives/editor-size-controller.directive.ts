import {
  ChangeDetectorRef,
  Directive,
  effect,
  ElementRef,
  HostBinding,
  inject,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { tap } from 'rxjs';
import { EditorSettingsService } from '../services/editor-settings.service';
import { resizable } from '../utils/resizable';

@Directive({
  selector: 'svg[editorSizeController]',
})
export class EditorSizeControllerDirective {
  private editorSettingsService = inject(EditorSettingsService);

  @HostBinding('attr.width')
  public editorWidth: string | number = 0;

  @HostBinding('attr.height')
  public editorHeight: string | number = 0;

  constructor(private host: ElementRef, private ref: ChangeDetectorRef) {
    effect(() => {
      const view = this.editorSettingsService.view();

      this.editorWidth = view === 'auto' ? '100%' : view[0];
      this.editorHeight = view === 'auto' ? '100%' : view[1];
      ref.markForCheck();
    });

    resizable([this.host.nativeElement])
      .pipe(
        tap(([entry]) => {
          this.editorSettingsService.computedEditorWidth.set(
            entry.contentRect.width
          );
          this.editorSettingsService.computedEditorHeight.set(
            entry.contentRect.height
          );
        }),
        takeUntilDestroyed()
      )
      .subscribe();
  }
}
