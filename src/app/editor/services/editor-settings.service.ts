import { Injectable, signal, WritableSignal } from '@angular/core';
import { HandlePositions } from '../interfaces/handle-positions.interface';

@Injectable()
export class EditorSettingsService {
  public entitiesSelectable = signal(true)

  /**
   * Global setting with handle positions. Nodes derive this value
   *
   * @deprecated
   */
  public handlePositions: WritableSignal<HandlePositions> = signal({ source: "right", target: "left" });
  
  public view: WritableSignal<[number, number] | "auto"> = signal([400, 400]);

  public computedEditorWidth = signal(0);
  public computedEditorHeight = signal(0);
  public minZoom = signal(0.5);
  public maxZoom = signal(3);
}
