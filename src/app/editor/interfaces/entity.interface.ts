import { WritableSignal } from '@angular/core';

export interface Entity {
  selected: WritableSignal<boolean>;
}
