import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ClientService } from './client.service';
import { Client } from '../models/client/client.model';
import { environment } from '../../environments/environment';

describe('ClientService', () => {
  let service: ClientService;
  let httpMock: HttpTestingController;

  const mockClient: Client = {
    clientId: 1,
    name: 'João Silva',
    scmlCode: '000100',
    surgeryType: 'Septoplastia',
    insuranceType: 'Multicare',
    locationId: 1,
    locationName: 'Riverside',
    notes: '',
    payments: [],
    clientDate: '2026-01-01'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(ClientService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    // Verifies that no unexpected HTTP requests were made
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call GET /api/client on getAll()', () => {
    service.getAll().subscribe(clients => {
      expect(clients.length).toBe(1);
      expect(clients[0].name).toBe('João Silva');
    });

    const req = httpMock.expectOne(`${environment.apiBaseUrl}/client`);
    expect(req.request.method).toBe('GET');
    req.flush([mockClient]);
  });

  it('should call GET /api/client/location/:key on getByLocation()', () => {
    service.getByLocation('riverside').subscribe(clients => {
      expect(clients).toBeTruthy();
    });

    const req = httpMock.expectOne(`${environment.apiBaseUrl}/client/location/riverside`);
    expect(req.request.method).toBe('GET');
    req.flush([mockClient]);
  });

  it('should call POST /api/client on create()', () => {
    const newClient = {
      name: 'Maria Costa',
      locationId: 1,
      clientDate: '2026-02-01'
    };

    service.create(newClient).subscribe(client => {
      expect(client.name).toBe('João Silva');
    });

    const req = httpMock.expectOne(`${environment.apiBaseUrl}/client`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body.name).toBe('Maria Costa');
    req.flush(mockClient);
  });

  it('should call PUT /api/client/:id on update()', () => {
    const updateData = { name: 'João Actualizado', clientDate: '2026-01-01' };

    service.update(1, updateData).subscribe();

    const req = httpMock.expectOne(`${environment.apiBaseUrl}/client/1`);
    expect(req.request.method).toBe('PUT');
    req.flush(null);
  });

  it('should call DELETE /api/client/:id on delete()', () => {
    service.delete(1).subscribe();

    const req = httpMock.expectOne(`${environment.apiBaseUrl}/client/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});