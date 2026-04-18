import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LoadingService {
  // Signal privado para controlar o estado
  private _isLoading = signal<boolean>(false);

  // Expor apenas como leitura para os componentes (Encapsulamento)
  public isLoading = this._isLoading.asReadonly();

  show() {
    this._isLoading.set(true);
  }

  hide() {
    this._isLoading.set(false);
  }
}
