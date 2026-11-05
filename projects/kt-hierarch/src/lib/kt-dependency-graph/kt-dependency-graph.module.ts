import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KtDependencyGraphComponent } from './kt-dependency-graph.component';
import { KtZoomPanModule } from '../kt-zoom-pan/kt-zoom-pan.module';

@NgModule({
  declarations: [KtDependencyGraphComponent],
  imports: [CommonModule, KtZoomPanModule],
  exports: [KtDependencyGraphComponent],
})
export class KtDependencyGraphModule {}
