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
  /**
   * Style for one segment of the connector bar.
   * `hidden` blanks the segment on the outer edge of the first/last child.
   * Every key is always returned: NgStyle only removes styles it can diff, so
   * omitting a key (or passing null) leaves the previous value on the element
   * when a node is added or removed, which used to leave a stray line behind.
   */
  applyConnectorStyle(hidden: boolean = false){
    let style = {
      borderWidth: this.config?.connector.borderWidth,
      borderStyle: this.config?.connector.borderStyle,
      borderColor: hidden ? 'transparent' : this.config?.connector.borderColor
    }
    return style
  }
  onNodeClick(value: any): void {
    this.nodeClick.emit(value);
  }
}
