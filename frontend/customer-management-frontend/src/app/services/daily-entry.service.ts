import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DailyEntry } from '../models/daily-entry/daily-entry.model';
import { CreateDailyEntry } from '../models/daily-entry/create-daily-entry.model';
import { UpdateDailyEntry } from '../models/daily-entry/update-daily-entry.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DailyEntryService {
  private apiUrl = `${environment.apiBaseUrl}/dailyEntry`;

  constructor(private http: HttpClient) {}

  /** Returns all daily entries with their location and payments. */
  getAll(): Observable<DailyEntry[]> {
    return this.http.get<DailyEntry[]>(`${this.apiUrl}/getAll`);
  }

  /** Returns all daily entries for a specific location by its URL key (e.g. "fairview"). */
  getByLocation(locationKey: string): Observable<DailyEntry[]> {
    return this.http.get<DailyEntry[]>(`${this.apiUrl}/location/${locationKey}`);
  }

  /** Creates a new daily entry. Returns 409 if an entry already exists for the same location and date. */
  create(entry: CreateDailyEntry): Observable<DailyEntry> {
    return this.http.post<DailyEntry>(this.apiUrl, entry);
  }

  /** Updates the notes or date of an existing daily entry. */
  update(id: number, entry: UpdateDailyEntry): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, entry);
  }

  /** Deletes a daily entry by ID. Associated payments are removed via cascade. */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}