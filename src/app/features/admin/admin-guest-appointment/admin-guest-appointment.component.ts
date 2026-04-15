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
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { CurrencyPipe, DatePipe } from '@angular/common';
import {
  AppointmentService,
  ProfessionalOption,
  ServiceOption,
} from '../../../core/services/appointment.service';

@Component({
  selector: 'app-admin-guest-appointment',
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
  templateUrl: './admin-guest-appointment.component.html',
  styleUrl: './admin-guest-appointment.component.scss',
})
export class AdminGuestAppointmentComponent implements OnInit {
  private fb = inject(FormBuilder);
  private appointmentService = inject(AppointmentService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private datePipe = inject(DatePipe);

  services = signal<ServiceOption[]>([]);
  professionals = signal<ProfessionalOption[]>([]);

  availableSlots = signal<string[]>([]);
  isSearchingSlots = signal<boolean>(false);

  minDate = new Date();

  form = this.fb.group({
    guestName: ['', [Validators.required, Validators.minLength(3)]],
    guestPhone: ['', [Validators.required]],
    serviceId: ['', Validators.required],
    professionalId: ['', Validators.required],
    date: [new Date(), Validators.required],
    time: ['', Validators.required],
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
    const { professionalId, date } = this.form.value;

    if (professionalId && date) {
      const formattedDate = this.datePipe.transform(date, 'yyyy-MM-dd');
      if (!formattedDate) return;

      this.availableSlots.set([]);
      this.isSearchingSlots.set(true);

      this.appointmentService
        .getAvailability(+professionalId, formattedDate)
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
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { guestName, guestPhone, serviceId, professionalId, date, time } =
      this.form.value;

    const dateObj = new Date(date!);
    const [hours, minutes] = time!.split(':');
    dateObj.setHours(+hours, +minutes, 0);

    const localDateString = this.datePipe.transform(
      dateObj,
      'yyyy-MM-ddTHH:mm:ss',
    );

    const request = {
      guestName: guestName!,
      guestPhone: guestPhone!,
      serviceId: Number(serviceId),
      professionalId: Number(professionalId),
      startTime: localDateString!,
    };

    this.appointmentService.scheduleGuest(request).subscribe({
      next: () => {
        this.snackBar.open('Agendamento avulso realizado com sucesso!', 'Ok', {
          duration: 3000,
        });
        this.router.navigate(['/admin']);
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
