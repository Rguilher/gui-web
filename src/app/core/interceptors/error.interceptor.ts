import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const snackBar = inject(MatSnackBar);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'Ocorreu um erro inesperado. Tente novamente.';

      // Tratamento de erros comuns
      if (error.status === 401) {
        errorMessage = 'Sessão expirada. Faça login novamente.';
      } else if (error.status === 403) {
        errorMessage = 'Acesso negado.';
      } else if (error.status >= 500) {
        errorMessage = 'Erro no servidor. Contate o suporte.';
      } else if (error.error?.message) {
        // Se o backend enviar uma mensagem customizada
        errorMessage = error.error.message;
      }

      snackBar.open(errorMessage, 'Fechar', {
        duration: 5000,
        horizontalPosition: 'end',
        verticalPosition: 'top',
        panelClass: ['error-snackbar'], // Você pode estilizar isso no styles.scss global
      });

      return throwError(() => error);
    }),
  );
};
