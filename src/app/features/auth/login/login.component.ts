import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService, LoginRequest } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    RouterLink,
    MatSnackBarModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  isLoading = signal(false);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  onSubmit() {
    if (this.form.invalid) return;

    this.isLoading.set(true);

    const loginData: LoginRequest = {
      username: this.form.value.email!,
      password: this.form.value.password!,
    };

    this.authService.login(loginData).subscribe({
      next: () => {
        const roles = this.authService.getUserRoles();

        if (roles.includes('ADMIN')) {
          this.router.navigate(['/admin']);
        } else if (roles.includes('PROFESSIONAL')) {
          this.router.navigate(['/painel-do-profissional']);
        } else {
          this.router.navigate(['/dashboard']);
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        const isAuthError = err.status === 401 || err.status === 403;
        const msg = isAuthError
          ? 'E-mail ou senha incorretos.'
          : 'Erro no servidor. Tente novamente mais tarde.';

        this.snackBar.open(msg, 'Fechar', {
          duration: 5000,
          panelClass: ['error-snackbar'],
        });
      },
    });
  }
}
