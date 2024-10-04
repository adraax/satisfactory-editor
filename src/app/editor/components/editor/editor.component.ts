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
import { toObservable } from "@angular/core/rxjs-interop";
import { skip } from "rxjs";
import { ConnectionControllerDirective } from "../../directives/connection-controller.directive";
import { MapContextDirective } from "../../directives/map-context.directive";
import { SpacePointContextDirective } from "../../directives/space-point-context.directive";
import {
  ConnectionTemplateDirective,
  EdgeLabelHtmlTemplateDirective,
  EdgeTemplateDirective,
  GroupNodeTemplateDirective,
  NodeHtmlTemplateDirective,
} from "../../directives/template.directive";
import { ConnectionSettings } from "../../interfaces/connection-settings.interface";
import { Edge } from "../../interfaces/edge.interface";
import { FitViewOptions } from "../../interfaces/fit-view-options.interface";
import { DynamicNode, Node } from "../../interfaces/node.interface";
import { Point } from "../../interfaces/point.interface";
import { ViewportState } from "../../interfaces/viewport.interface";
import { ConnectionModel } from "../../models/connection.model";
import { ConnectionStatusService } from "../../services/connection-status.service";
import { DraggableService } from "../../services/draggable.service";
import { EditorSettingsService } from "../../services/editor-settings.service";
import { EntitiesService } from "../../services/entities.service";
import { NodeRenderingService } from "../../services/node-rendering.service";
import { SelectionService } from "../../services/selection.service";
import { ViewportService } from "../../services/viewport.service";
import { Background } from "../../types/background.type";
import { addNodesToEdges } from "../../utils/add-nodes-to-edges";
import { ReferenceKeeper } from "../../utils/reference-keeper";

const connectionControllerHostDirective = {
  directive: ConnectionControllerDirective,
  outputs: ["onConnect", "onConnectCancel"],
};

@Component({
  selector: "editor",
  templateUrl: "./editor.component.html",
  styleUrl: "./editor.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    ConnectionStatusService,
    DraggableService,
    EditorSettingsService,
    EntitiesService,
    NodeRenderingService,
    ViewportService,
    SelectionService,
  ],
  hostDirectives: [connectionControllerHostDirective],
})
export class EditorComponent implements OnInit {
  // #region Dependecy Injection
  private viewportService = inject(ViewportService);
  private entitiesService = inject(EntitiesService);
  // TODO nodes change service
  // TODO edge change service
  private nodeRenderingService = inject(NodeRenderingService);
  private editorSettingsService = inject(EditorSettingsService);
  // TODO event bus service
  private injector = inject(Injector);
  // #endregion Dependecy Injection

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

  // TODO entitiesSelectable

  @Input({ transform: (settings: ConnectionSettings) => new ConnectionModel(settings) })
  public set connection(connection: ConnectionModel) {
    this.entitiesService.connection.set(connection);
  }

  public get connection() {
    return this.entitiesService.connection();
  }

  // #region Main Inputs
  @Input({ required: true })
  public set nodes(newNodes: Node[] | DynamicNode[]) {
    const newModels = runInInjectionContext(this.injector, () =>
      ReferenceKeeper.nodes(newNodes, this.entitiesService.nodes())
    );

    addNodesToEdges(newModels, this.edgeModels());

    this.entitiesService.nodes.set(newModels);
  }

  protected nodeModels = computed(() => this.nodeRenderingService.nodes());

  @Input()
  public set edges(newEdges: Edge[]) {
    const newModels = runInInjectionContext(this.injector, () =>
      ReferenceKeeper.edges(newEdges, this.entitiesService.edges())
    );

    addNodesToEdges(this.nodeModels(), newModels);

    this.entitiesService.edges.set(newModels);
  }

  protected edgeModels = computed(() => this.entitiesService.validEdges());
  // #endregion

  // TODO event output

  // #region Templates
  @ContentChild(NodeHtmlTemplateDirective)
  protected nodeTemplateDirective?: NodeHtmlTemplateDirective;

  @ContentChild(GroupNodeTemplateDirective)
  protected groupNodeTemplateDirective?: GroupNodeTemplateDirective;

  @ContentChild(EdgeTemplateDirective)
  protected edgeTemplateDirective?: EdgeTemplateDirective;

  @ContentChild(EdgeLabelHtmlTemplateDirective)
  protected edgeLabelHtmlTemplateDirective?: EdgeLabelHtmlTemplateDirective;

  @ContentChild(ConnectionTemplateDirective)
  protected connectionTemplateDirective?: ConnectionTemplateDirective;
  // #endregion

  // #region Directives
  @ViewChild(MapContextDirective)
  protected mapContext!: MapContextDirective;

  @ViewChild(SpacePointContextDirective)
  protected spacePointContext!: SpacePointContextDirective;
  // #endregion

  // #region Signals
  public readonly viewport = this.viewportService.readableViewport.asReadonly();

  // TODO nodes change signal
  // TODO edges change signal
  // #endregion

  // #region Observables
  public readonly viewport$ = toObservable(this.viewportService.readableViewport).pipe(skip(1));

  // TODO nodes change signal
  // TODO edges change signal
  // #endregion

  protected markers = this.entitiesService.markers;

  public ngOnInit(): void {
    this.setInitialNodesOrder();
  }

  // #region Public API
  public viewportTo(viewport: ViewportState) {
    this.viewportService.writableViewport.set({ changeType: "absolute", state: viewport, duration: 0 });
  }

  public zoomTo(zoom: number) {
    this.viewportService.writableViewport.set({ changeType: "absolute", state: { zoom }, duration: 0 });
  }

  public panTo(point: Point) {
    this.viewportService.writableViewport.set({ changeType: "absolute", state: point, duration: 0 });
  }

  public fitView(options?: FitViewOptions) {
    this.viewportService.fitView(options);
  }

  public getNode<T = unknown>(id: string): Node<T> | DynamicNode<T> | undefined {
    return this.entitiesService.getNode<T>(id)?.node;
  }

  public documentPointToEditorPoint(point: Point) {
    return this.spacePointContext.documentPointToEditorPoint(point);
  }
  // #endregion

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
