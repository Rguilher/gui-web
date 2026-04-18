import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import {
  AuthService,
  RegisterRequest,
} from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
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
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  // Controle de loading para feedback visual
  isLoading = signal(false);

  // Formulário Reativo
  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    // Regex simples para telefone, ajustável conforme o backend
    phone: [
      '',
      [
        Validators.required,
        Validators.pattern(/^\(?\d{2}\)?[\s-]?9?\d{4}-?\d{4}$/),
      ],
    ],
  });

  onSubmit() {
    if (this.form.invalid) return;

    this.isLoading.set(true);
    const request = this.form.value as RegisterRequest;

    this.authService.register(request).subscribe({
      next: () => {
        this.snackBar.open('Cadastro realizado com sucesso!', 'Fechar', {
          duration: 3000,
        });
        this.router.navigate(['/login']);
      },
      error: (err) => {
        // Tratamento de erro robusto
        const msg =
          err.error?.message || 'Erro ao realizar cadastro. Tente novamente.';
        this.snackBar.open(msg, 'Fechar', {
          duration: 5000,
          panelClass: ['error-snackbar'],
        });
        this.isLoading.set(false);
      },
    });
  }
}
