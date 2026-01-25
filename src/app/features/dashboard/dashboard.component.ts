import { Component, inject, OnInit, signal } from '@angular/core';
import {
  Appointment,
  AppointmentService,
} from '../../core/services/appointment.service';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { DatePipe, CurrencyPipe } from '@angular/common'; // Pipes para formatar data e preço
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatSnackBarModule,
    DatePipe,
    CurrencyPipe,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  private appointmentService = inject(AppointmentService);
  private snackBar = inject(MatSnackBar);

  appointments = signal<Appointment[]>([]);
  isLoading = signal(true);

  ngOnInit() {
    this.loadAppointments();
  }

  loadAppointments() {
    this.isLoading.set(true);
    // Vamos começar buscando a agenda da semana para ter mais chance de ver dados
    this.appointmentService.getAppointmentsWeek().subscribe({
      next: (data) => {
        this.appointments.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.snackBar.open('Erro ao carregar agendamentos.', 'Fechar');
      },
    });
  }

  cancel(id: number) {
    if (!confirm('Tem certeza que deseja cancelar?')) return;

    this.appointmentService.cancelAppointment(id).subscribe({
      next: () => {
        this.snackBar.open('Agendamento cancelado!', 'Ok', { duration: 3000 });
        this.loadAppointments(); // Recarrega a lista
      },
      error: (err) => {
        this.snackBar.open(err.error?.message || 'Erro ao cancelar.', 'Fechar');
      },
    });
  }
}
