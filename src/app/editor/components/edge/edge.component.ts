import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  Injector,
  Input,
  OnInit,
  TemplateRef,
} from "@angular/core";
import { EdgeContext } from "../../interfaces/edge-context.interface";
import { EdgeModel } from "../../models/edge.model";
import { EditorSettingsService } from "../../services/editor-settings.service";
import { hashCode } from "../../utils/hash";
import { SelectionService } from '../../services/selection.service';

@Component({
  selector: "g[edge]",
  templateUrl: "./edge.component.html",
  styleUrl: "./edge.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: "selectable",
  },
})
export class EdgeComponent implements OnInit {
  protected injector = inject(Injector);
  private selectionService = inject(SelectionService)
  private editorSettingsService = inject(EditorSettingsService);

  @Input()
  public model!: EdgeModel;

  @Input()
  public edgeTemplate?: TemplateRef<EdgeContext>;

  @Input()
  public edgeLabelHtmlTemplate?: TemplateRef<any>;

  public markerStartUrl = computed(() => {
    const marker = this.model.edge.markers?.start;

    return marker ? `url(#${hashCode(JSON.stringify(marker))})` : "";
  });

  public markerEndUrl = computed(() => {
    const marker = this.model.edge.markers?.end;

    return marker ? `url(#${hashCode(JSON.stringify(marker))})` : "";
  });

  protected edgeContext!: EdgeContext;

  ngOnInit(): void {
    this.edgeContext = {
      $implicit: {
        edge: this.model.edge,
        path: computed(() => this.model.path().path),
        markerStart: this.markerStartUrl,
        markerEnd: this.markerEndUrl,
        selected: this.model.selected.asReadonly(),
      },
    };
  }

  public onEdgeMouseDown(event: MouseEvent) {
    if (this.editorSettingsService.entitiesSelectable()) {
      this.selectionService.select(this.model, event.ctrlKey)
    }
  }
}
