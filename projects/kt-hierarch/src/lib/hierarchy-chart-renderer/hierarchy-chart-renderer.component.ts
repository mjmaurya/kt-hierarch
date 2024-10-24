import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NodeModel } from '../default.model';

@Component({
  selector: 'kt-hierarchy-chart-renderer',
  templateUrl: './hierarchy-chart-renderer.component.html',
  styleUrls: ['./hierarchy-chart-renderer.component.css']
})
export class HierarchyChartRendererComponent implements OnInit {

  @Input() node: NodeModel = new NodeModel();
  @Input() hasParent = false;
  @Output() nodeClick = new EventEmitter<any>();
  @Input() config:any;
  constructor() { }

  ngOnInit(): void {
  }
  applyConnectorStyle(edge: any = undefined){
    let style = {
      borderWidth: edge ? '1px' :this.config?.connector.borderWidth,
      borderStyle: this.config?.connector.borderStyle,
      borderColor: this.config?.connector.borderColor
    }
    return style
  }
  onNodeClick(value: any): void {
    this.nodeClick.emit(value);
  }
}
