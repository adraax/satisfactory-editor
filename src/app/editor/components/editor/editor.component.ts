import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ContentChild,
  inject,
  Injector,
  Input,
  runInInjectionContext,
} from "@angular/core";
import { NodeHtmlTemplateDirective } from "../../directives/template.directive";
import { DynamicNode, Node } from "../../interfaces/node.interface";
import { NodeModel } from "../../models/node.model";
import { EditorSettingsService } from "../../services/editor-settings.service";
import { EntitiesService } from "../../services/entities.service";
import { NodeRenderingService } from "../../services/node-rendering.service";
import { ViewportService } from "../../services/viewport.service";
import { Background } from "../../types/background.type";
import { ReferenceKeeper } from "../../utils/reference-keeper";

@Component({
  selector: "editor",
  templateUrl: "./editor.component.html",
  styleUrl: "./editor.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [EditorSettingsService, ViewportService, NodeRenderingService, EntitiesService],
})
export class EditorComponent {
  private editorSettingsService = inject(EditorSettingsService);
  private entitiesService = inject(EntitiesService);
  private nodeRenderingService = inject(NodeRenderingService);
  private injector = inject(Injector);

  @Input()
  public set view(view: [number, number] | "auto") {
    this.editorSettingsService.view.set(view);
  }

  @Input()
  public background: Background | string = "#fff";

  @Input({ required: true })
  public set nodes(newNodes: Node[] | DynamicNode[]) {
    const newModels = runInInjectionContext(this.injector, () =>
      ReferenceKeeper.nodes(newNodes, this.entitiesService.nodes())
    );

    this.entitiesService.nodes.set(newModels);
  }

  protected nodeModels = computed(() => this.nodeRenderingService.nodes());

  protected trackNodes(idx: number, { node }: NodeModel) {
    return node;
  }

  @ContentChild(NodeHtmlTemplateDirective)
  protected nodeTemplateDirective?: NodeHtmlTemplateDirective;
}
