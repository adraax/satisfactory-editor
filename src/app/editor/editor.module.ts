import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { BackgroundComponent } from "./components/background/background.component";
import { EditorComponent } from "./components/editor/editor.component";
import { HandleComponent } from "./components/handle/handle.component";
import { NodeComponent } from "./components/node/node.component";
import { EditorSizeControllerDirective } from "./directives/editor-size-controller.directive";
import { HandleSizeControllerDirective } from "./directives/handle-size-controller.directive";
import { MapContextDirective } from "./directives/map-context.directive";
import { RootSvgReferenceDirective } from "./directives/reference.directive";
import { RootPointerDirective } from "./directives/root-pointer.directive";
import { SpacePointContextDirective } from "./directives/space-point-context.directive";

const components = [EditorComponent, BackgroundComponent, NodeComponent, HandleComponent];

const directives = [
  EditorSizeControllerDirective,
  MapContextDirective,
  RootPointerDirective,
  RootSvgReferenceDirective,
  SpacePointContextDirective,
  HandleSizeControllerDirective,
];

@NgModule({
  declarations: [...components, ...directives],
  imports: [CommonModule],
  exports: [EditorComponent],
})
export class EditorModule {}
