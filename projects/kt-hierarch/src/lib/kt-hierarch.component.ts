import { Component, ElementRef, EventEmitter, Input, OnInit, Output, Renderer2, ViewChild } from '@angular/core';
import { configData } from './default.model';

@Component({
  selector: 'kt-hierarch',
  template: `
    <div>
    <div class="kt-hierarch-self-{{configData.orientation}} zoom-container" #zoomContainer
        (mousedown)="onMouseDown($event)" (mousemove)="onMouseMove($event)" (mouseup)="onMouseUp($event)"
        (wheel)="onWheel($event)">
        <kt-hierarchy-chart-renderer [node]="data" [config]="configData" [hasParent]="false"
            (nodeClick)="onNodeClick($event)"></kt-hierarchy-chart-renderer>
    </div>
</div>
  `,
  styles: [
    `
    .kt-hierarch-border {
    border-color: #9E9E9E;
  }
  
  .kt-hierarch-self-vertical {
    margin-bottom: 2%;
  }
  
  .zoom-container {
    transition: transform 0.3s ease-out;
    cursor: grab;
    user-select: none;
  }`
  ]
})
export class KtHierarchComponent implements OnInit {

  @ViewChild('zoomContainer') zoomContainer!: ElementRef;
  scale = 1;
  isDragging = false;
  dragStartX = 0;
  dragStartY = 0;
  translateX = 0;
  translateY = 0;
  @Input() config:any;
  @Input() data:any;
  @Output() nodeClick = new EventEmitter<any>();
  constructor(private renderer: Renderer2
  ) { }
 configData:any = configData
  ngOnInit(): void {
    this.configData = {...this.configData,...this.config};
  }
  onNodeClick(value: any): void {
    this.nodeClick.emit(value);
  }
  zoomIn() {
    if (this.scale < 2) {
      const newScale = this.scale + 0.1;
      this.scale = newScale > 2 ? 2 : newScale;
      this.updateTransform();
    }
  }

  zoomOut() {
    if (this.scale > 0.2) {
      this.scale -= 0.1;
      this.updateTransform();
    } else {
      this.scale = 0.2;
    }
  }

  onMouseDown(event: MouseEvent) {
    this.isDragging = true;
    this.dragStartX = event.clientX - this.translateX;
    this.dragStartY = event.clientY - this.translateY;
    this.renderer.setStyle(
      this.zoomContainer.nativeElement,
      'cursor',
      'grabbing'
    );
  }

  onMouseMove(event: MouseEvent) {
    if (this.isDragging) {
      this.translateX = event.clientX - this.dragStartX;
      this.translateY = event.clientY - this.dragStartY;
      this.updateTransform();
    }
  }

  onMouseUp(event: MouseEvent) {
    this.isDragging = false;
    this.renderer.setStyle(
      this.zoomContainer.nativeElement,
      'cursor',
      'grab'
    );
  }

  onWheel(event: WheelEvent) {
    event.preventDefault();
    const delta = Math.sign(event.deltaY) * 0.05;
    if (delta < 0) {
      this.zoomIn();
    } else {
      this.zoomOut();
    }
  }

  private updateTransform() {
    this.renderer.setStyle(
      this.zoomContainer.nativeElement,
      'transform',
      `scale(${this.scale}) translate(${this.translateX}px, ${this.translateY}px)`
    );
  }


}
