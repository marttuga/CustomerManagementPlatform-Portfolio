import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Location } from '../models/location/location.model';
import { CreateLocation } from '../models/location/create-location.model';
import { UpdateLocation } from '../models/location/update-location.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  private apiUrl = `${environment.apiBaseUrl}/location`;

  constructor(private http: HttpClient) {}

  /** Returns all locations with their client and daily entry counts. */
  getAll(): Observable<Location[]> {
    return this.http.get<Location[]>(this.apiUrl);
  }

  /** Returns a single location by ID. */
  getById(id: number): Observable<Location> {
    return this.http.get<Location>(`${this.apiUrl}/${id}`);
  }

  /** Creates a new location. */
  create(location: CreateLocation): Observable<Location> {
    return this.http.post<Location>(this.apiUrl, location);
  }

  /** Updates an existing location name. */
  update(id: number, location: UpdateLocation): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, location);
  }

  /** Deletes a location by ID. Clients will have LocationId set to null; DailyEntries will be deleted. */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}