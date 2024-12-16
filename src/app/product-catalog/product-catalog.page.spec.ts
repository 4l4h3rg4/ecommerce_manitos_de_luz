import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductCatalogPage } from './product-catalog.page';

describe('ProductCatalogPage', () => {
  let component: ProductCatalogPage;
  let fixture: ComponentFixture<ProductCatalogPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductCatalogPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
