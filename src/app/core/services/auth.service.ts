import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';


// DTOs baseados no seu Backend (RegisterUserRequest.java)
export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phone: string;
}

export interface RegisterResponse {
  name: string;
  email: string;
  phone: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/auth`; // http://localhost:8080/api/auth

  register(data: RegisterRequest): Observable<RegisterResponse> {
    // Post para /api/auth/register
    return this.http.post<RegisterResponse>(`${this.baseUrl}/register`, data);
  }
}
