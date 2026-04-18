import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface UserDetail {
  id: number;
  name: string;
  email: string;
  role: 'USER' | 'PROFESSIONAL' | 'ADMIN';
}

export interface ChangeRoleRequest {
  role: 'USER' | 'PROFESSIONAL' | 'ADMIN';
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getAllUsers(): Observable<UserDetail[]> {
    return this.http.get<UserDetail[]>(`${this.apiUrl}/users`);
  }

  changeRole(userId: number, request: ChangeRoleRequest): Observable<void> {
    return this.http.patch<void>(
      `${this.apiUrl}/users/${userId}/role`,
      request,
    );
  }

  findUserByEmail(email: string): Observable<UserDetail> {
    const params = new HttpParams().set('email', email);
    return this.http.get<UserDetail>(`${this.apiUrl}/users`, { params });
  }
}
