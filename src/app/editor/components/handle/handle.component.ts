import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  Injector,
  Input,
  OnDestroy,
  OnInit,
  TemplateRef,
} from "@angular/core";
import { InjectionContext, WithInjector } from "../../decorators/run-in-injection-context.decorator";
import { HandleModel } from "../../models/handle.model";
import { HandleService } from "../../services/handle.service";
import { Position } from "../../types/position.type";

@Component({
  selector: "handle",
  templateUrl: "./handle.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HandleComponent implements OnInit, OnDestroy, WithInjector {
  public injector = inject(Injector);
  private handleService = inject(HandleService);
  private element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  @Input({ required: true })
  public position!: Position;

  @Input({ required: true })
  public type!: "source" | "target";

  @Input()
  public id?: string;

  @Input()
  public template?: TemplateRef<any>;

  public model!: HandleModel;

  @InjectionContext
  ngOnInit(): void {
    this.model = new HandleModel(
      {
        position: this.position,
        type: this.type,
        id: this.id,
        parentReference: this.element.parentElement!,
        template: this.template,
      },
      this.handleService.node()!
    );

    this.handleService.createHandle(this.model);

    requestAnimationFrame(() => this.model.updateParent());
  }
  ngOnDestroy(): void {
    this.handleService.destroyHandle(this.model);
  }
}
