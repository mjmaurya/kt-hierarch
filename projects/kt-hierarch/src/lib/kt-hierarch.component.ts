import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { configData } from './default.model';
import { KtZoomPanComponent } from './kt-zoom-pan/kt-zoom-pan.component';

@Component({
  selector: 'kt-hierarch',
  template: `
    <kt-zoom-pan [disabled]="!zoomable" [minZoom]="minZoom" [maxZoom]="maxZoom" [showControls]="zoomControls">
      <div class="kt-hierarch-self-{{configData.orientation}}">
        <kt-hierarchy-chart-renderer [node]="data" [config]="configData" [hasParent]="false"
            (nodeClick)="onNodeClick($event)"></kt-hierarchy-chart-renderer>
      </div>
    </kt-zoom-pan>
  `,
  styles: [
    `
    :host {
    display: block;
    height: 100%;
  }

  .kt-hierarch-border {
    border-color: #9E9E9E;
  }
  
  .kt-hierarch-self-vertical {
    margin-bottom: 2%;
  }`
  ]
})
export class KtHierarchComponent implements OnInit, OnChanges {

  @ViewChild(KtZoomPanComponent) zoomPan?: KtZoomPanComponent;
  /** Drag to pan, wheel / buttons to zoom. Set false for a static chart. */
  @Input() zoomable = true;
  @Input() zoomControls = true;
  @Input() minZoom = 0.2;
  @Input() maxZoom = 3;
  @Input() config:any;
  @Input() data:any;
  @Output() nodeClick = new EventEmitter<any>();
 configData:any = configData
  ngOnInit(): void {
    this.configData = this.mergeConfig(configData, this.config);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['config']) {
      this.configData = this.mergeConfig(configData, this.config);
    }
  }

  private mergeConfig(base: any, override: any): any {
    const merged = { ...base };
    if (!override) {
      return merged;
    }
    Object.keys(override).forEach((key) => {
      const value = override[key];
      const isPlainObject = value && typeof value === 'object' && !Array.isArray(value);
      merged[key] = isPlainObject ? { ...(base ? base[key] : {}), ...value } : value;
    });
    return merged;
  }
  onNodeClick(value: any): void {
    this.nodeClick.emit(value);
  }
  zoomIn(): void {
    this.zoomPan?.zoomIn();
  }

  zoomOut(): void {
    this.zoomPan?.zoomOut();
  }

  resetZoom(): void {
    this.zoomPan?.reset();
  }

  fitToView(): void {
    this.zoomPan?.fit();
  }
}
