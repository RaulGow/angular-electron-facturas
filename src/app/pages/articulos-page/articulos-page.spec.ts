import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArticulosPage } from './articulos-page';

describe('ArticulosPage', () => {
  let component: ArticulosPage;
  let fixture: ComponentFixture<ArticulosPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArticulosPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ArticulosPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
