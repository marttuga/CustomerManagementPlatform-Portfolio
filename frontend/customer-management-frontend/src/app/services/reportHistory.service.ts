import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ReportHistory } from '../models/report-history/report-history.model';
import { CreateReportHistory } from '../models/report-history/create-report-history.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ReportHistoryService {
  private apiUrl = `${environment.apiBaseUrl}/report`;

  constructor(private http: HttpClient) {}

  /** Returns all report history records ordered by most recent first. */
  getAll(): Observable<ReportHistory[]> {
    return this.http.get<ReportHistory[]>(this.apiUrl);
  }

  /** Returns a single report history record by ID. */
  getById(id: number): Observable<ReportHistory> {
    return this.http.get<ReportHistory>(`${this.apiUrl}/${id}`);
  }

  /** Saves a new report generation record to history. */
  create(report: CreateReportHistory): Observable<ReportHistory> {
    return this.http.post<ReportHistory>(this.apiUrl, report);
  }

  /** Deletes a report history record by ID. */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
   * Generates a pending items report for a given location and period.
   * Month 13 is a frontend convention to request the full annual report.
   * Locations 4-8 use the daily entry model; locations 1-3 use the client model.
   */
  generateMonthlyReport(locationId: number, month: number, year: number): Observable<any> {
    const params = new HttpParams()
      .set('month', month.toString())
      .set('year', year.toString());

    return this.http.get(`${this.apiUrl}/generate-monthly/${locationId}`, { params });
  }
}