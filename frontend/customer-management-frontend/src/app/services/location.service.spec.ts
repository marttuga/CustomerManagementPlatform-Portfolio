import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { LocationService } from './location.service';
import { Location } from '../models/location/location.model';
import { environment } from '../../environments/environment';

describe('LocationService', () => {
  let service: LocationService;
  let httpMock: HttpTestingController;

  const mockLocation: Location = {
    locationId: 1,
    name: 'Riverside',
    key: 'riverside',
    clientCount: 5,
    dailyEntriesCount: 0
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(LocationService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call GET /api/location on getAll()', () => {
    service.getAll().subscribe(locations => {
      expect(locations.length).toBe(1);
      expect(locations[0].key).toBe('riverside');
    });

    const req = httpMock.expectOne(`${environment.apiBaseUrl}/location`);
    expect(req.request.method).toBe('GET');
    req.flush([mockLocation]);
  });

  it('should call GET /api/location/:id on getById()', () => {
    service.getById(1).subscribe(location => {
      expect(location.locationId).toBe(1);
      expect(location.name).toBe('Riverside');
    });

    const req = httpMock.expectOne(`${environment.apiBaseUrl}/location/1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockLocation);
  });

  it('should call POST /api/location on create()', () => {
    service.create({ name: 'Porto' }).subscribe(location => {
      expect(location.name).toBe('Riverside');
    });

    const req = httpMock.expectOne(`${environment.apiBaseUrl}/location`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body.name).toBe('Porto');
    req.flush(mockLocation);
  });

  it('should call PUT /api/location/:id on update()', () => {
    service.update(1, { name: 'Riverside Nova' }).subscribe();

    const req = httpMock.expectOne(`${environment.apiBaseUrl}/location/1`);
    expect(req.request.method).toBe('PUT');
    req.flush(null);
  });

  it('should call DELETE /api/location/:id on delete()', () => {
    service.delete(1).subscribe();

    const req = httpMock.expectOne(`${environment.apiBaseUrl}/location/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});