import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Client } from '../models/client/client.model';
import { CreateClient } from '../models/client/create-client.model';
import { UpdateClient } from '../models/client/update-client.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  private apiUrl = `${environment.apiBaseUrl}/client`;

  constructor(private http: HttpClient) {}

  /** Returns all clients with their location and payments. */
  getAll(): Observable<Client[]> {
    return this.http.get<Client[]>(this.apiUrl);
  }

  /** Returns all clients belonging to a specific location by its URL key (e.g. "riverside"). */
  getByLocation(locationKey: string): Observable<Client[]> {
    return this.http.get<Client[]>(`${this.apiUrl}/location/${locationKey}`);
  }

  /** Creates a new client. Returns 409 if a duplicate is detected. */
  create(client: CreateClient): Observable<Client> {
    return this.http.post<Client>(this.apiUrl, client);
  }

  /** Updates an existing client by ID. */
  update(id: number, client: UpdateClient): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, client);
  }

  /** Deletes a client by ID. Associated payments are removed via cascade. */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}