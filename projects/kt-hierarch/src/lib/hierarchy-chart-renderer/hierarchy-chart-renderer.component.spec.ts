import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HierarchyChartRendererComponent } from './hierarchy-chart-renderer.component';

describe('HierarchyChartRendererComponent', () => {
  let component: HierarchyChartRendererComponent;
  let fixture: ComponentFixture<HierarchyChartRendererComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HierarchyChartRendererComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HierarchyChartRendererComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
