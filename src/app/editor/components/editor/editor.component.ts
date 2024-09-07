import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ContentChild,
  inject,
  Injector,
  Input,
  OnInit,
  runInInjectionContext,
  ViewChild,
} from "@angular/core";
import { MapContextDirective } from "../../directives/map-context.directive";
import { SpacePointContextDirective } from "../../directives/space-point-context.directive";
import { GroupNodeTemplateDirective, NodeHtmlTemplateDirective } from "../../directives/template.directive";
import { DynamicNode, Node } from "../../interfaces/node.interface";
import { Point } from "../../interfaces/point.interface";
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
export class EditorComponent implements OnInit {
  private editorSettingsService = inject(EditorSettingsService);
  private entitiesService = inject(EntitiesService);
  private nodeRenderingService = inject(NodeRenderingService);
  private injector = inject(Injector);

  @Input()
  public set view(view: [number, number] | "auto") {
    this.editorSettingsService.view.set(view);
  }

  @Input()
  public set minZoom(value: number) {
    this.editorSettingsService.minZoom.set(value);
  }

  @Input()
  public set maxZoom(value: number) {
    this.editorSettingsService.maxZoom.set(value);
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

  @ContentChild(NodeHtmlTemplateDirective)
  protected nodeTemplateDirective?: NodeHtmlTemplateDirective;

  @ContentChild(GroupNodeTemplateDirective)
  protected groupNodeTemplateDirective?: GroupNodeTemplateDirective;

  @ViewChild(MapContextDirective)
  protected mapContext!: MapContextDirective;

  @ViewChild(SpacePointContextDirective)
  protected spacePointContext!: SpacePointContextDirective;

  // #region signals

  // #endregion

  public ngOnInit(): void {
    this.setInitialNodesOrder();
  }

  public getNode<T = unknown>(id: string): Node<T> | DynamicNode<T> | undefined {
    return this.entitiesService.getNode<T>(id)?.node;
  }

  public documentPointToFlowPoint(point: Point) {
    return this.spacePointContext.documentPointToFlowPoint(point);
  }

  protected trackNodes(idx: number, { node }: NodeModel) {
    return node;
  }

  private setInitialNodesOrder() {
    this.nodeModels().forEach((model) => {
      switch (model.node.type) {
        case "default-group":
        case "template-group": {
          this.nodeRenderingService.pullNode(model);
        }
      }
    });
  }
}
