import { Injectable, signal, WritableSignal } from '@angular/core';

@Injectable()
export class EditorSettingsService {
  public view: WritableSignal<[number, number] | 'auto'> = signal([400, 400]);

  public computedEditorWidth = signal(0)
  public computedEditorHeight = signal(0)
}
