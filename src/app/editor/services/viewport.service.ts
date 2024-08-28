import { inject, Injectable, signal, WritableSignal } from '@angular/core';
import {
  ViewportState,
  WritableViewport,
} from '../interfaces/viewport.interface';
import { EditorSettingsService } from './editor-settings.service';

@Injectable()
export class ViewportService {
  private editorSettingsService = inject(EditorSettingsService);

  private static getDefaultViewport(): ViewportState {
    return { zoom: 1, x: 0, y: 0 };
  }

  public readonly writableViewport: WritableSignal<WritableViewport> = signal({
    changeType: 'initial',
    state: ViewportService.getDefaultViewport(),
    duration: 0,
  });

  public readonly readableViewport: WritableSignal<ViewportState> = signal(
    ViewportService.getDefaultViewport()
  );
}
