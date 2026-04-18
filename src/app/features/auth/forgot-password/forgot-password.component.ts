import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    RouterLink,
  ],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss',
})
export class ForgotPasswordComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);

  // Controla em qual passo o usuário está: 1 (E-mail) ou 2 (Código + Nova Senha)
  step = signal<1 | 2>(1);
  isLoading = signal<boolean>(false);

  // Formulário do Passo 1
  emailForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  // Formulário do Passo 2
  resetForm = this.fb.group({
    code: ['', Validators.required],
    newPassword: ['', [Validators.required, Validators.minLength(6)]],
  });

  onRequestCode() {
    if (this.emailForm.invalid) return;

    this.isLoading.set(true);
    const email = this.emailForm.value.email!;

    this.authService.forgotPassword(email).subscribe({
      next: () => {
        this.snackBar.open('Código enviado para o seu e-mail!', 'Fechar', {
          duration: 5000,
        });
        this.step.set(2);
        this.isLoading.set(false);
      },
      error: () => {
        this.snackBar.open(
          'Erro ao solicitar código. Verifique o e-mail.',
          'Fechar',
          { duration: 5000 },
        );
        this.isLoading.set(false);
      },
    });
  }

  onResetPassword() {
    if (this.resetForm.invalid) return;

    this.isLoading.set(true);
    const request = {
      email: this.emailForm.value.email!,
      code: this.resetForm.value.code!,
      newPassword: this.resetForm.value.newPassword!,
    };

    this.authService.resetPassword(request).subscribe({
      next: () => {
        // 1. Dá o feedback claro de que deu certo e o que vai acontecer
        this.snackBar.open(
          'Senha alterada! Redirecionando para o login...',
          'Ok',
          {
            duration: 3000,
          },
        );

        // 2. Aguarda 1.5 segundos (1500ms) antes de mudar a rota (UX Profissional)
        setTimeout(() => {
          this.router.navigate(['/auth/login']);
        }, 1500);
      },
      error: () => {
        this.snackBar.open('Código inválido ou expirado.', 'Fechar', {
          duration: 5000,
        });
        this.isLoading.set(false);
      },
    });
  }
}
