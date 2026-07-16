import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { LocationBaseComponent } from './location-base.component';

describe('LocationBaseComponent', () => {
  let component: LocationBaseComponent;
  let fixture: ComponentFixture<LocationBaseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        LocationBaseComponent,
        HttpClientTestingModule,
        RouterTestingModule
      ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { paramMap: of({ get: () => 'riverside' }) }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LocationBaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set locationKey from route params', () => {
    expect(component.locationKey).toBe('riverside');
  });

  it('should load column config for riverside', () => {
    // Riverside has 10 columns defined in LOCATION_CONFIG
    expect(component.columns.length).toBeGreaterThan(0);
  });

  it('should set locationName from config', () => {
    // Title comes from LOCATION_CONFIG[riverside].title
    expect(component.locationName).toContain('Riverside');
  });
});

describe('LocationBaseComponent - unknown location', () => {
  let component: LocationBaseComponent;
  let fixture: ComponentFixture<LocationBaseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        LocationBaseComponent,
        HttpClientTestingModule,
        RouterTestingModule
      ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { paramMap: of({ get: () => 'unknown-place' }) }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LocationBaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should set locationName to Unknown location for invalid keys', () => {
    expect(component.locationName).toBe('Unknown location');
  });

  it('should set empty columns for invalid location keys', () => {
    expect(component.columns.length).toBe(0);
  });
});