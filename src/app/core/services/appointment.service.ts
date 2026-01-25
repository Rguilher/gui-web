import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';

export interface Appointment {
  id: number;
  clientName: string;
  professionalName: string;
  serviceName: string;
  price: number;
  startTime: string; // O Angular converte datas JSON para string ISO automaticamente
  endTime: string;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELED';
}

@Injectable({
  providedIn: 'root',
})
export class AppointmentService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/appointments`;

  // Busca agendamentos de hoje
  getAppointmentsToday(): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${this.baseUrl}/today`);
  }

  // Busca agendamentos da semana (opcional para o futuro)
  getAppointmentsWeek(): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${this.baseUrl}/week`);
  }

  // Cancela um agendamento
  cancelAppointment(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
