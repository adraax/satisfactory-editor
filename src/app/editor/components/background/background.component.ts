import { ChangeDetectionStrategy, Component, computed, effect, inject, Input, signal } from "@angular/core";
import { RootSvgReferenceDirective } from "../../directives/reference.directive";
import { ViewportService } from "../../services/viewport.service";
import { Background } from "../../types/background.type";
import { id } from "../../utils/id";

const defaultBg = "#fff";
const defaultGap = 20;
const defaultPatternSize = 2;
const defaultPatternColor = "rgb(177, 177, 183)";

@Component({
  selector: "g[background]",
  templateUrl: "./background.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BackgroundComponent {
  private viewPortService = inject(ViewportService);
  private rootSvg = inject(RootSvgReferenceDirective).element;

  @Input({ required: true, transform })
  set background(value: Background) {
    this.backgroundSignal.set(value);
  }

  protected backgroundSignal = signal<Background>({
    type: "solid",
    color: defaultBg,
  });

  protected scaledGap = computed(() => {
    const background = this.backgroundSignal();

    if (background.type === "dots" || background.type === "grid") {
      const zoom = this.viewPortService.readableViewport().zoom;

      return zoom * (background.gap ?? defaultGap);
    }

    return 0;
  });

  protected x = computed(() => this.viewPortService.readableViewport().x % this.scaledGap());

  protected y = computed(() => this.viewPortService.readableViewport().y % this.scaledGap());

  protected patternSize = computed(() => {
    const background = this.backgroundSignal();

    if (background.type === "dots" || background.type === "grid") {
      return (this.viewPortService.readableViewport().zoom * (background.size ?? defaultPatternSize)) / 2;
    }

    return 0;
  });

  protected patternPath = computed(() => `M ${this.scaledGap()} 0 L 0 0 0 ${this.scaledGap()}`);

  protected patternColor = computed(() => this.backgroundSignal().color ?? defaultPatternColor);

  protected patternId = id();
  protected patternUrl = `url(#${this.patternId})`;

  constructor() {
    effect(() => {
      const background = this.backgroundSignal();

      if (background.type === "dots" || background.type === "grid") {
        this.rootSvg.style.backgroundColor = background.backgroundColor ?? defaultBg;
      }

      if (background.type === "solid") {
        this.rootSvg.style.backgroundColor = background.color;
      }
    });
  }
}

function transform(background: Background | string): Background {
  return typeof background === "string" ? { type: "solid", color: background } : background;
}
