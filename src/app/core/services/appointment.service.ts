import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment.development';

// --- Interfaces de Apoio (Dropdowns) ---
export interface ServiceOption {
  id: number;
  name: string;
  price: number;
}

export interface ProfessionalOption {
  id: number;
  name: string;
}

// --- Interface de Request (Enviar ao Backend) ---
export interface CreateAppointmentRequest {
  professionalId: number;
  serviceId: number;
  startTime: string; // Formato ISO 8601
}

// --- Interface de Response (Meus Agendamentos) ---
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
  // Usa a URL base da API definida no environment (ex: http://localhost:8080/api)
  private apiUrl = environment.apiUrl;

  // --- Métodos de Leitura (Dashboard) ---

  getAppointmentsToday(): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${this.apiUrl}/appointments/today`);
  }

  getAppointmentsWeek(): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${this.apiUrl}/appointments/week`);
  }

  cancelAppointment(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/appointments/${id}`);
  }

  // --- Métodos de Escrita (Novo Agendamento) ---

  getServices(): Observable<ServiceOption[]> {
    return this.http.get<ServiceOption[]>(`${this.apiUrl}/services`);
  }

  getProfessionals(): Observable<ProfessionalOption[]> {
    // 🔥 Consome a nova rota criada no UserController (/api/users/profissional)
    return this.http.get<any>(`${this.apiUrl}/users/profissional`).pipe(
      // O Spring retorna um objeto Page { content: [], ... }, então extraímos o content
      map((response) => response.content || []),
    );
  }

  schedule(data: CreateAppointmentRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/appointments`, data);
  }
}
