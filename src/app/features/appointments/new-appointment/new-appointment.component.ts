import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips'; // Importante para os botões
import { MatIconModule } from '@angular/material/icon';
import { CurrencyPipe, DatePipe } from '@angular/common';
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
    MatChipsModule,
    MatIconModule,
    CurrencyPipe,
  ],
  providers: [DatePipe],
  templateUrl: './new-appointment.component.html',
  styleUrl: './new-appointment.component.scss',
})
export class NewAppointmentComponent implements OnInit {
  private fb = inject(FormBuilder);
  private appointmentService = inject(AppointmentService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private datePipe = inject(DatePipe);

  services = signal<ServiceOption[]>([]);
  professionals = signal<ProfessionalOption[]>([]);

  // Controle visual dos horários
  availableSlots = signal<string[]>([]);
  isSearchingSlots = signal<boolean>(false);

  minDate = new Date();

  form = this.fb.group({
    serviceId: ['', Validators.required],
    professionalId: ['', Validators.required],
    date: [new Date(), Validators.required],
    time: ['', Validators.required], // O valor vem do clique no botão (Chip)
  });

  ngOnInit() {
    this.loadResources();

    this.form.valueChanges.subscribe(() => {
      this.updateAvailability();
    });
  }

  loadResources() {
    this.appointmentService.getServices().subscribe({
      next: (data) => this.services.set(data),
      error: () => this.snackBar.open('Erro ao carregar serviços.', 'Fechar'),
    });

    this.appointmentService.getProfessionals().subscribe({
      next: (data) => this.professionals.set(data),
      error: () =>
        this.snackBar.open('Erro ao carregar profissionais.', 'Fechar'),
    });
  }

  updateAvailability() {
    const { serviceId, professionalId, date } = this.form.value;

    if (serviceId && professionalId && date) {
      const formattedDate = this.datePipe.transform(date, 'yyyy-MM-dd');
      if (!formattedDate) return;

      // Limpa horário selecionado anteriormente se ele não existir na nova data
      const currentTime = this.form.value.time;
      if (currentTime && !this.isSearchingSlots()) {
        // Opcional: resetar time aqui se desejar forçar nova escolha
      }

      this.isSearchingSlots.set(true);

      this.appointmentService
        .getAvailability(+serviceId, +professionalId, formattedDate)
        .subscribe({
          next: (slots) => {
            this.availableSlots.set(slots);
            this.isSearchingSlots.set(false);
          },
          error: () => {
            this.availableSlots.set([]);
            this.isSearchingSlots.set(false);
          },
        });
    } else {
      this.availableSlots.set([]);
    }
  }

  selectTime(time: string) {
    this.form.patchValue({ time });
  }

  onSubmit() {
    if (this.form.invalid) return;

    const { serviceId, professionalId, date, time } = this.form.value;

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
        const msg = err.error?.message || 'Erro ao realizar agendamento.';
        this.snackBar.open(msg, 'Fechar', {
          duration: 5000,
          panelClass: ['error-snackbar'],
        });
      },
    });
  }
}
