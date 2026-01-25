import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core'; // Necessário para o Datepicker
import { MatSnackBar } from '@angular/material/snack-bar';
import { CurrencyPipe } from '@angular/common';
import {
  AppointmentService,
  ProfessionalOption,
  ServiceOption,
} from '../../../core/services/appointment.service';

@Component({
  selector: 'app-new-appointment',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    CurrencyPipe,
  ],
  templateUrl: './new-appointment.component.html',
  styleUrl: './new-appointment.component.scss',
})
export class NewAppointmentComponent implements OnInit {
  private fb = inject(FormBuilder);
  private appointmentService = inject(AppointmentService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  services = signal<ServiceOption[]>([]);
  professionals = signal<ProfessionalOption[]>([]);

  minDate = new Date(); // Impede agendar no passado

  form = this.fb.group({
    serviceId: ['', Validators.required],
    professionalId: ['', Validators.required],
    date: [new Date(), Validators.required],
    time: ['09:00', Validators.required],
  });

  ngOnInit() {
    this.loadResources();
  }

  loadResources() {
    // Carrega Serviços
    this.appointmentService.getServices().subscribe({
      next: (data) => this.services.set(data),
      error: () => this.snackBar.open('Erro ao carregar serviços.', 'Fechar'),
    });

    // Carrega Profissionais (Rota Nova)
    this.appointmentService.getProfessionals().subscribe({
      next: (data) => this.professionals.set(data),
      error: () =>
        this.snackBar.open('Erro ao carregar profissionais.', 'Fechar'),
    });
  }

  onSubmit() {
    if (this.form.invalid) return;

    const { serviceId, professionalId, date, time } = this.form.value;

    // Montagem da Data ISO (yyyy-MM-ddTHH:mm:ss) para o Java
    const dateObj = new Date(date!);
    const [hours, minutes] = time!.split(':');
    dateObj.setHours(+hours, +minutes, 0);

    const request = {
      serviceId: Number(serviceId),
      professionalId: Number(professionalId),
      startTime: dateObj.toISOString(),
    };

    this.appointmentService.schedule(request).subscribe({
      next: () => {
        this.snackBar.open('Agendamento realizado com sucesso!', 'Ok', {
          duration: 3000,
        });
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        // Exibe mensagem amigável vinda do backend (ex: "Conflito de horário")
        const msg = err.error?.message || 'Erro ao realizar agendamento.';
        this.snackBar.open(msg, 'Fechar', {
          duration: 5000,
          panelClass: ['error-snackbar'],
        });
      },
    });
  }
}
