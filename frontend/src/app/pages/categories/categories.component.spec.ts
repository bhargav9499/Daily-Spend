import { of } from 'rxjs';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { CategoriesComponent } from './categories.component';
import { ApiService } from '../../services/api.service';

describe('CategoriesComponent', () => {
  let fixture: ComponentFixture<CategoriesComponent>;
  let component: CategoriesComponent;

  const apiMock = jasmine.createSpyObj<ApiService>('ApiService', [
    'getCategories',
    'createCategory',
    'updateCategory',
    'deleteCategory',
  ]);

  beforeEach(async () => {
    apiMock.getCategories.and.returnValue(of([
      { id: 1, name: 'Groceries', type: 'SPEND', created_at: '2025-08-01T00:00:00Z' },
      { id: 2, name: 'Gift Card',  type: 'INCOME', created_at: '2025-08-01T00:00:00Z' },
    ]));
    apiMock.createCategory.and.returnValue(
      of({ id: 3, name: 'Rent', type: 'SPEND', created_at: '2025-08-02T00:00:00Z' })
    );

    await TestBed.configureTestingModule({
      imports: [CategoriesComponent],
      providers: [{ provide: ApiService, useValue: apiMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(CategoriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('loads categories on init', () => {
    expect(apiMock.getCategories).toHaveBeenCalled();
    expect(component.categories.length).toBe(2);
  });

  it('calls createCategory on save()', () => {
    component.form = { name: 'Rent', type: 'SPEND' };

    component.save();

    expect(apiMock.createCategory).toHaveBeenCalledWith({ name: 'Rent', type: 'SPEND' });
  });
});
