import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HierarchyChartNodeComponent } from './hierarchy-chart-node.component';

describe('HierarchyChartNodeComponent', () => {
  let component: HierarchyChartNodeComponent;
  let fixture: ComponentFixture<HierarchyChartNodeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HierarchyChartNodeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HierarchyChartNodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
