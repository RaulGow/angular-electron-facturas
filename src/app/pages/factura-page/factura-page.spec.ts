import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FacturaPage } from './factura-page';

describe('FacturaPage', () => {
  let component: FacturaPage;
  let fixture: ComponentFixture<FacturaPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FacturaPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FacturaPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
