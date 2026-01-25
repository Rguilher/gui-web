import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment.development';  // Verifique se o caminho dos ".." está correto para sua estrutura de pastas

// --- Interfaces de Cadastro (Register) ---
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

// --- Interfaces de Login ---
export interface LoginRequest {
  username: string; // Mapeado para o campo "username" que o Spring Security espera
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  expiresIn: number;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);

  // Aponta para http://localhost:8080/api/auth
  private baseUrl = `${environment.apiUrl}/auth`;

  // Signal para que a aplicação saiba reativamente se o usuário está logado
  // Inicializa verificando se já existe um token salvo no localStorage
  isAuthenticated = signal<boolean>(this.hasToken());

  // --- Métodos de Autenticação ---

  register(data: RegisterRequest): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.baseUrl}/register`, data);
  }

  login(data: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/login`, data).pipe(
      tap((response) => {
        // Efeito colateral: Salva o token e avisa o app que o usuário logou
        this.saveToken(response.accessToken);
        this.isAuthenticated.set(true);
      }),
    );
  }

  logout() {
    localStorage.removeItem('auth-token');
    this.isAuthenticated.set(false);
  }

  // --- Métodos Auxiliares de Token ---

  private saveToken(token: string) {
    localStorage.setItem('auth-token', token);
  }

  private hasToken(): boolean {
    // Verifica se estamos rodando no navegador (boa prática para Angular 18/SSR)
    if (typeof localStorage !== 'undefined') {
      return !!localStorage.getItem('auth-token');
    }
    return false;
  }
}
