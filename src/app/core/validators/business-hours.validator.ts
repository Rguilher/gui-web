import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function businessHoursValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value; // Formato esperado: "HH:mm" (ex: "09:30")

    if (!value) {
      return null; // Deixa o Validators.required lidar com campo vazio
    }

    const [hoursStr] = value.split(':');
    const hours = parseInt(hoursStr, 10);

    // Regra: Aberto das 08:00 às 18:00
    // Se for antes das 8 ou depois das 18 (considerando que 18:01 já é fechado)
    // Nota: Se quiser permitir agendar AS 18:00, a lógica muda levemente.
    // Aqui bloqueamos qualquer coisa que comece com 19, 20... ou 07, 06...
    if (hours < 8 || hours >= 18) {
      return { businessHours: true };
    }

    return null;
  };
}
