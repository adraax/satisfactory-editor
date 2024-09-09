import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { BackgroundComponent } from "./components/background/background.component";
import { EdgeLabelComponent } from "./components/edge-label/edge-label.component";
import { EdgeComponent } from "./components/edge/edge.component";
import { EditorComponent } from "./components/editor/editor.component";
import { HandleComponent } from "./components/handle/handle.component";
import { NodeComponent } from "./components/node/node.component";
import { EditorSizeControllerDirective } from "./directives/editor-size-controller.directive";
import { HandleSizeControllerDirective } from "./directives/handle-size-controller.directive";
import { MapContextDirective } from "./directives/map-context.directive";
import { RootSvgReferenceDirective } from "./directives/reference.directive";
import { RootPointerDirective } from "./directives/root-pointer.directive";
import { SpacePointContextDirective } from "./directives/space-point-context.directive";
import {
  EdgeLabelHtmlTemplateDirective,
  EdgeTemplateDirective,
  GroupNodeTemplateDirective,
  HandleTemplateDirective,
  NodeHtmlTemplateDirective,
} from "./directives/template.directive";

const components = [
  BackgroundComponent,
  EdgeComponent,
  EdgeLabelComponent,
  EditorComponent,
  NodeComponent,
  HandleComponent,
];

const directives = [
  EditorSizeControllerDirective,
  MapContextDirective,
  RootPointerDirective,
  RootSvgReferenceDirective,
  SpacePointContextDirective,
  HandleSizeControllerDirective,
];

const templateDirectives = [
  NodeHtmlTemplateDirective,
  GroupNodeTemplateDirective,
  EdgeTemplateDirective,
  EdgeLabelHtmlTemplateDirective,
  HandleTemplateDirective,
];

@NgModule({
  declarations: [...components, ...directives, ...templateDirectives],
  imports: [CommonModule],
  exports: [EditorComponent, HandleComponent, ...templateDirectives],
})
export class EditorModule {}
