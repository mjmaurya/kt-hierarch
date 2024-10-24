import { TestBed } from '@angular/core/testing';

import { KtHierarchService } from './kt-hierarch.service';

describe('KtHierarchService', () => {
  let service: KtHierarchService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(KtHierarchService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
