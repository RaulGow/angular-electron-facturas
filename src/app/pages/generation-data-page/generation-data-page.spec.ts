import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenerationDataPage } from './generation-data-page';

describe('GenerationDataPage', () => {
  let component: GenerationDataPage;
  let fixture: ComponentFixture<GenerationDataPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GenerationDataPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GenerationDataPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
