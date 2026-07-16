import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Payment } from '../models/payment/payment.model';
import { CreatePayment } from '../models/payment/create-payment.model';
import { UpdatePayment } from '../models/payment/update-payment.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private apiUrl = `${environment.apiBaseUrl}/payment`;

  constructor(private http: HttpClient) {}

  /** Returns all payments with resolved client and location information. */
  getAll(): Observable<Payment[]> {
    return this.http.get<Payment[]>(this.apiUrl);
  }

  /** Returns a single payment by ID. */
  getById(id: number): Observable<Payment> {
    return this.http.get<Payment>(`${this.apiUrl}/${id}`);
  }

  /** Returns all payments linked to a specific client. */
  getByClient(clientId: number): Observable<Payment[]> {
    return this.http.get<Payment[]>(`${this.apiUrl}/client/${clientId}`);
  }

  /** Returns all payments linked to a specific daily entry. */
  getByDailyEntry(dailyEntryId: number): Observable<Payment[]> {
    return this.http.get<Payment[]>(`${this.apiUrl}/dailyEntry/${dailyEntryId}`);
  }

  /** Creates a new payment linked to either a Client or a DailyEntry. Returns 409 if duplicate. */
  create(payment: CreatePayment): Observable<Payment> {
    return this.http.post<Payment>(this.apiUrl, payment);
  }

  /** Updates an existing payment's amount, date and invoice number. */
  update(id: number, payment: UpdatePayment): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, payment);
  }

  /** Deletes a payment by ID. */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}