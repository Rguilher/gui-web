import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Verifica se estamos no navegador (segurança para SSR) e busca o token
  const token =
    typeof localStorage !== 'undefined'
      ? localStorage.getItem('auth-token')
      : null;

  if (token) {
    // Clona a requisição e injeta o header conforme o padrão do seu Backend (SecurityFilter.java)
    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
    return next(cloned);
  }

  // Se não tem token, segue com a requisição original (ex: Login, Cadastro)
  return next(req);
};
