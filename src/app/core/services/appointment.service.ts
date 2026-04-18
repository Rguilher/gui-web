import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ServiceOption {
  id: number;
  name: string;
  price: number;
  durationMin?: number;
}

export interface ProfessionalOption {
  id: number;
  name: string;
}

export interface CreateGuestAppointmentRequest {
  guestName: string;
  guestPhone: string;
  professionalId: number;
  serviceId: number;
  startTime: string;
}

export interface CreateAppointmentRequest {
  professionalId: number;
  serviceId: number;
  startTime: string;
}

export interface Appointment {
  id: number;
  clientName: string;
  professionalName: string;
  serviceName: string;
  price: number;
  startTime: string;
  endTime: string;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELED';
}

@Injectable({
  providedIn: 'root',
})
export class AppointmentService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;


  getAppointmentsToday(): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${this.apiUrl}/appointments/today`);
  }

  getAppointmentsWeek(): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${this.apiUrl}/appointments/week`);
  }

  cancelAppointment(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/appointments/${id}`);
  }


  getServices(): Observable<ServiceOption[]> {
    return this.http.get<ServiceOption[]>(`${this.apiUrl}/services`);
  }

  getProfessionals(): Observable<ProfessionalOption[]> {
    return this.http
      .get<any>(`${this.apiUrl}/users/profissional`)
      .pipe(map((response) => response.content || []));
  }


  getAvailability(professionalId: number, date: string): Observable<string[]> {
    const params = new HttpParams()
      .set('professionalId', professionalId.toString())
      .set('date', date);

    return this.http.get<string[]>(`${this.apiUrl}/appointments/availability`, {
      params,
    });
  }

  schedule(data: CreateAppointmentRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/appointments`, data);
  }

  getAppointmentsMonth(): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${this.apiUrl}/appointments/month`);
  }

  scheduleGuest(data: CreateGuestAppointmentRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/appointments/admin/guest`, data);
  }
}
