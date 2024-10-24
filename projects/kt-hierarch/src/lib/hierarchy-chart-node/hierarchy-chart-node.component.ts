import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NodeModel } from '../default.model';

@Component({
  selector: 'kt-hierarchy-chart-node',
  templateUrl: './hierarchy-chart-node.component.html',
  styleUrls: ['./hierarchy-chart-node.component.css']
})
export class HierarchyChartNodeComponent implements OnInit {
  @Input()
  node: NodeModel = new NodeModel;
  @Input() hasParent = false;
  @Input() config:any;
  @Output() nodeClick = new EventEmitter<any>();
  constructor() { }

  ngOnInit(): void {
  }
applyNodeStyle(){
  let style = { 'backgroundColor': this.config?.node.backgroundColor, 'borderWidth': this.config?.node.borderWidth, 'borderColor': this.config?.node.borderColor, 'borderStyle': this.config?.node.borderStyle }
  console.table(style)
  return style
}

applyConnectorStyle(){
  let style = {
    borderWidth: this.config?.connector.borderWidth,
    borderStyle: this.config?.connector.borderStyle,
    borderColor: this.config?.connector.borderColor
  }
  return style
}
  onNodeClick(node: NodeModel): void {
    this.nodeClick.emit(node);
  };

}
