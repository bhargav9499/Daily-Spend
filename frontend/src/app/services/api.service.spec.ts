// src/app/services/api.service.spec.ts
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ApiService } from './api.service';
import { environment } from '../../environments/environment';
import { Category } from '../models';

describe('ApiService', () => {
  let svc: ApiService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ApiService],
    });
    svc = TestBed.inject(ApiService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('GET /api/categories returns Category[]', () => {
    const mock: Category[] = [
      { id: 1, name: 'Groceries', type: 'SPEND',  created_at: '2025-08-01T00:00:00Z' },
      { id: 2, name: 'Gift Card', type: 'INCOME', created_at: '2025-08-01T00:00:00Z' },
    ];

    let received: Category[] | undefined;

    svc.getCategories().subscribe(r => (received = r));

    const req = http.expectOne(`${environment.apiBase}/api/categories`);
    expect(req.request.method).toBe('GET');
    req.flush(mock);

    expect(received).toEqual(mock);
  });
});
