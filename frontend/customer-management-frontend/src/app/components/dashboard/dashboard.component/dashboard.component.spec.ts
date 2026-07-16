import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { DashboardComponent } from './dashboard.component';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        DashboardComponent,
        HttpClientTestingModule,
        RouterTestingModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should start with zero totals', () => {
    // Before data loads, all counters should be zero
    expect(component.totalPayments).toBe(0);
    expect(component.totalPending).toBe(0);
    expect(component.totalRegistos).toBe(0);
  });

  it('should start with empty locationStats', () => {
    expect(component.locationStats).toEqual([]);
  });

  it('should render the dashboard header', () => {
    const h1 = fixture.nativeElement.querySelector('h1');
    expect(h1?.textContent).toContain('Financial Dashboard');
  });

  it('should render 3 summary cards', () => {
    const cards = fixture.nativeElement.querySelectorAll('.card');
    expect(cards.length).toBe(3);
  });

  it('should render 2 chart canvases', () => {
    const canvases = fixture.nativeElement.querySelectorAll('canvas');
    expect(canvases.length).toBe(2);
  });
});