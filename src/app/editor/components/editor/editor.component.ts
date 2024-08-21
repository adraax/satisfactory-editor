import {
  ChangeDetectionStrategy,
  Component,
  inject,
  Injector,
  Input,
} from '@angular/core';
import { EditorSettingsService } from '../../services/editor-settings.service';
import { Background } from '../../types/background.types';

@Component({
  selector: 'editor',
  templateUrl: './editor.component.html',
  styleUrl: './editor.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [EditorSettingsService],
})
export class EditorComponent {
  private flowSettingsService = inject(EditorSettingsService);
  private injector = inject(Injector);

  @Input()
  public set view(view: [number, number] | 'auto') {
    this.flowSettingsService.view.set(view);
  }

  @Input()
  public background: Background | string = '#fff';
}
