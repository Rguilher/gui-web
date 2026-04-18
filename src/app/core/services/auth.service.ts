import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment.development';

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

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  expiresIn: number;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  code: string;
  newPassword: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private baseUrl = `${environment.apiUrl}/auth`;

  isAuthenticated = signal<boolean>(this.hasToken());

  register(data: RegisterRequest): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.baseUrl}/register`, data);
  }

  login(data: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/login`, data).pipe(
      tap((response) => {
        this.saveToken(response.accessToken);
        this.isAuthenticated.set(true);
      }),
    );
  }

  forgotPassword(email: string): Observable<void> {
    const request: ForgotPasswordRequest = { email };
    return this.http.post<void>(`${this.baseUrl}/forgot-password`, request);
  }

  resetPassword(data: ResetPasswordRequest): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/reset-password`, data);
  }

  logout() {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('auth-token');
    }

    this.isAuthenticated.set(false);

    this.router.navigate(['/auth/login']);
  }

  private saveToken(token: string) {
    localStorage.setItem('auth-token', token);
  }

  private hasToken(): boolean {
    if (typeof localStorage !== 'undefined') {
      return !!localStorage.getItem('auth-token');
    }
    return false;
  }

  getToken(): string | null {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem('auth-token');
    }
    return null;
  }

  getUserRoles(): string[] {
    const token = this.getToken();
    if (!token) return [];

    try {
      const payloadBase64 = token.split('.')[1];
      const payloadJson = atob(payloadBase64);
      const payload = JSON.parse(payloadJson);
      const roles: string[] = payload.roles || [];

      return roles.map((role) => role.replace('ROLE_', ''));
    } catch (error) {
      console.error('Erro ao decodificar o token JWT', error);
      return [];
    }
  }
}
