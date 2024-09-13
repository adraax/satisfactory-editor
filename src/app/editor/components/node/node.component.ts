import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  Injector,
  Input,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewChild,
} from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { map, startWith, switchMap, tap } from "rxjs";
import { Microtask } from "../../decorators/microtask.decorator";
import { InjectionContext, WithInjector } from "../../decorators/run-in-injection-context.decorator";
import { ConnectionControllerDirective } from "../../directives/connection-controller.directive";
import { RootSvgReferenceDirective } from "../../directives/reference.directive";
import { HandleModel } from "../../models/handle.model";
import { NodeModel } from "../../models/node.model";
import { ConnectionStatusService } from "../../services/connection-status.service";
import { DraggableService } from "../../services/draggable.service";
import { EditorSettingsService } from "../../services/editor-settings.service";
import { HandleService } from "../../services/handle.service";
import { NodeRenderingService } from "../../services/node-rendering.service";
import { resizable } from "../../utils/resizable";

@Component({
  selector: "g[node]",
  templateUrl: "./node.component.html",
  styleUrl: "./node.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [HandleService],
})
export class NodeComponent implements OnInit, AfterViewInit, OnDestroy, WithInjector {
  public injector = inject(Injector);
  private handleService = inject(HandleService);
  private draggableService = inject(DraggableService);
  private connectionStatusService = inject(ConnectionStatusService);
  private nodeRenderingService = inject(NodeRenderingService);
  private editorSettingsService = inject(EditorSettingsService);
  // TODO selection service
  private connectionController = inject(ConnectionControllerDirective);
  private host = inject<ElementRef<SVGElement>>(ElementRef);
  protected rootSvg = inject(RootSvgReferenceDirective).element;

  @Input()
  public nodeModel!: NodeModel;

  @Input()
  public nodeTemplate?: TemplateRef<any>;

  @Input()
  public groupNodeTemplate?: TemplateRef<any>;

  @ViewChild("nodeContent")
  public nodeContentRed!: ElementRef<SVGGraphicsElement>;

  @ViewChild("htmlWrapper")
  public htmlWrapperRef!: ElementRef<HTMLDivElement>;

  protected showMagnet = computed(
    () =>
      this.connectionStatusService.status().state === "connection-start" ||
      this.connectionStatusService.status().state === "connection-validation"
  );

  protected styleWidth = computed(() => `${this.nodeModel.size().width}px`);
  protected styleHeight = computed(() => `${this.nodeModel.size().height}px`);

  @InjectionContext
  ngOnInit(): void {
    this.handleService.node.set(this.nodeModel);

    effect(() => {
      if (this.nodeModel.draggable()) {
        this.draggableService.enable(this.host.nativeElement, this.rootSvg, this.nodeModel);
      }
    });

    this.nodeModel.handles$
      .pipe(
        switchMap((handles) => resizable(handles.map((h) => h.parentReference!)).pipe(map(() => handles))),
        tap((handles) => {
          // TODO (performance) inspect how to avoid calls of this when flow initially rendered
          handles.forEach((h) => h.updateParent());
        })
      )
      .subscribe();
  }

  @Microtask // TODO (performance) check if we need microtask here
  @InjectionContext
  ngAfterViewInit(): void {
    this.nodeModel.linkDefaultNodeSizeWithModelSize();

    if (this.nodeModel.node.type === "html-template" || this.nodeModel.isComponentType) {
      resizable([this.htmlWrapperRef.nativeElement])
        .pipe(
          startWith(null),
          tap(() => {
            const width = this.htmlWrapperRef.nativeElement.clientWidth;
            const height = this.htmlWrapperRef.nativeElement.clientHeight;

            this.nodeModel.size.set({ width, height });
          }),
          takeUntilDestroyed()
        )
        .subscribe();
    }
  }

  ngOnDestroy(): void {
    this.draggableService.destroy(this.host.nativeElement);
  }

  protected startConnection(event: Event, handle: HandleModel) {
    event.stopPropagation();

    this.connectionController.startConnection(handle);
  }

  protected validateConnection(handle: HandleModel) {
    this.connectionController.validateConnection(handle);
  }

  protected resetValidateConnection(handle: HandleModel) {
    this.connectionController.resetValidateConnection(handle);
  }

  protected endConnection(handle: HandleModel) {
    this.connectionController.endConnection(handle);
  }

  protected pullNode() {
    this.nodeRenderingService.pullNode(this.nodeModel);
  }

  protected selectNode() {
    if (this.editorSettingsService.entitiesSelectable()) {
      // TODO selection service
    }
  }
}
