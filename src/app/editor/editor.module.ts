import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { BackgroundComponent } from './components/editor/background/background.component';
import { EditorComponent } from './components/editor/editor.component';
import { EditorSizeControllerDirective } from './directives/editor-size-controller.directive';
import { RootSvgReferenceDirective } from './directives/reference.directive';

const components = [EditorComponent, BackgroundComponent];

const directives = [EditorSizeControllerDirective, RootSvgReferenceDirective];

@NgModule({
  declarations: [...components, ...directives],
  imports: [CommonModule],
  exports: [EditorComponent],
})
export class EditorModule {}
