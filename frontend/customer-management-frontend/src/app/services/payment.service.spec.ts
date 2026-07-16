import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PaymentService } from './payment.service';
import { Payment } from '../models/payment/payment.model';
import { environment } from '../../environments/environment';

describe('PaymentService', () => {
  let service: PaymentService;
  let httpMock: HttpTestingController;

  const mockPayment: Payment = {
    paymentId: 1,
    clientId: 1,
    amount: 300,
    paymentDate: '2026-01-15',
    invoiceNumber: 'INV-001',
    clientName: 'João Silva',
    locationName: 'Riverside'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(PaymentService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call GET /api/payment on getAll()', () => {
    service.getAll().subscribe(payments => {
      expect(payments.length).toBe(1);
      expect(payments[0].invoiceNumber).toBe('INV-001');
    });

    const req = httpMock.expectOne(`${environment.apiBaseUrl}/payment`);
    expect(req.request.method).toBe('GET');
    req.flush([mockPayment]);
  });

  it('should call GET /api/payment/:id on getById()', () => {
    service.getById(1).subscribe(payment => {
      expect(payment.paymentId).toBe(1);
    });

    const req = httpMock.expectOne(`${environment.apiBaseUrl}/payment/1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockPayment);
  });

  it('should call GET /api/payment/client/:id on getByClient()', () => {
    service.getByClient(1).subscribe(payments => {
      expect(payments).toBeTruthy();
    });

    const req = httpMock.expectOne(`${environment.apiBaseUrl}/payment/client/1`);
    expect(req.request.method).toBe('GET');
    req.flush([mockPayment]);
  });

  it('should call GET /api/payment/dailyEntry/:id on getByDailyEntry()', () => {
    service.getByDailyEntry(2).subscribe(payments => {
      expect(payments).toBeTruthy();
    });

    const req = httpMock.expectOne(`${environment.apiBaseUrl}/payment/dailyEntry/2`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('should call POST /api/payment on create()', () => {
    const newPayment = {
      clientId: 1,
      dailyEntryId: null,
      amount: 450,
      paymentDate: '2026-02-01',
      invoiceNumber: 'INV-002'
    };

    service.create(newPayment).subscribe(payment => {
      expect(payment.paymentId).toBe(1);
    });

    const req = httpMock.expectOne(`${environment.apiBaseUrl}/payment`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body.amount).toBe(450);
    req.flush(mockPayment);
  });

  it('should call PUT /api/payment/:id on update()', () => {
    const updateData = { amount: 500, paymentDate: '2026-02-15', invoiceNumber: 'INV-003' };

    service.update(1, updateData).subscribe();

    const req = httpMock.expectOne(`${environment.apiBaseUrl}/payment/1`);
    expect(req.request.method).toBe('PUT');
    req.flush(null);
  });

  it('should call DELETE /api/payment/:id on delete()', () => {
    service.delete(1).subscribe();

    const req = httpMock.expectOne(`${environment.apiBaseUrl}/payment/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});