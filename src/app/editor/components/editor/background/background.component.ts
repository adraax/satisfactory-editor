import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  Input,
  signal,
} from '@angular/core';
import { RootSvgReferenceDirective } from '../../../directives/reference.directive';
import { Background } from '../../../types/background.types';

const defaultBg = '#fff';

@Component({
  selector: 'g[background]',
  templateUrl: './background.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BackgroundComponent {
  private rootSvg = inject(RootSvgReferenceDirective).element;

  @Input({ required: true, transform })
  set background(value: Background) {
    this.backgroundSignal.set(value);
  }

  protected backgroundSignal = signal<Background>({
    type: 'solid',
    color: defaultBg,
  });
    
    protected patterId = 'test'
    protected patternUrl = `url(#${this.patterId})`

  constructor() {
    effect(() => {
      const background = this.backgroundSignal();

      if (background.type === 'dots') {
        this.rootSvg.style.backgroundColor = background.color ?? defaultBg;
      }

      if (background.type === 'solid') {
        this.rootSvg.style.backgroundColor = background.color;
      }
    });
  }
}

function transform(background: Background | string): Background {
  return typeof background === 'string'
    ? { type: 'solid', color: background }
    : background;
}
