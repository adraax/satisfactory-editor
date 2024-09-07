import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { BackgroundComponent } from './components/background/background.component';
import { EditorComponent } from './components/editor/editor.component';
import { EditorSizeControllerDirective } from './directives/editor-size-controller.directive';
import { MapContextDirective } from './directives/map-context.directive';
import { RootSvgReferenceDirective } from './directives/reference.directive';
import { SpacePointContextDirective } from './directives/space-point-context.directive';
import { RootPointerDirective } from './directives/root-pointer.directive';
import { NodeComponent } from './components/node/node.component';

const components = [EditorComponent, BackgroundComponent, NodeComponent];

const directives = [
  EditorSizeControllerDirective,
  MapContextDirective,
  RootPointerDirective,
  RootSvgReferenceDirective,
  SpacePointContextDirective
];

@NgModule({
  declarations: [...components, ...directives],
  imports: [CommonModule],
  exports: [EditorComponent],
})
export class EditorModule {}
