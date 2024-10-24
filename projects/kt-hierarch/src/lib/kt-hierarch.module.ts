import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { KtHierarchComponent } from './kt-hierarch.component';
import { HierarchyChartRendererComponent } from './hierarchy-chart-renderer/hierarchy-chart-renderer.component';
import { HierarchyChartNodeComponent } from './hierarchy-chart-node/hierarchy-chart-node.component';
import { CommonModule } from '@angular/common';



@NgModule({
  declarations: [
    KtHierarchComponent,
    HierarchyChartRendererComponent,
    HierarchyChartNodeComponent
  ],
  imports: [
    CommonModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  exports: [
    KtHierarchComponent,
  ]
})
export class KtHierarchModule { }
