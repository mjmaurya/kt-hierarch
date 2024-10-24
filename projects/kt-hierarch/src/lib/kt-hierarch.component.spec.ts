import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KtHierarchComponent } from './kt-hierarch.component';

describe('KtHierarchComponent', () => {
  let component: KtHierarchComponent;
  let fixture: ComponentFixture<KtHierarchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ KtHierarchComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(KtHierarchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
