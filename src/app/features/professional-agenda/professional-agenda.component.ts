import { Component, inject, OnInit, signal, OnDestroy } from '@angular/core';
import {
  Appointment,
  AppointmentService,
} from '../../core/services/appointment.service';
import { DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Subscription } from 'rxjs';

interface AgendaSlot {
  time: string;
  days: {
    date: Date;
    appointment: Appointment | null;
  }[];
}

@Component({
  selector: 'app-professional-agenda',
  standalone: true,
  imports: [DatePipe, MatButtonModule, MatIconModule],
  templateUrl: './professional-agenda.component.html',
  styleUrl: './professional-agenda.component.scss',
})
export class ProfessionalAgendaComponent implements OnInit, OnDestroy {
  private appointmentService = inject(AppointmentService);
  private breakpointObserver = inject(BreakpointObserver);

  appointmentsData = signal<Appointment[]>([]);
  agendaGrid = signal<AgendaSlot[]>([]);
  weekDays = signal<Date[]>([]);
  isLoading = signal(true);

  currentBaseDate = signal<Date>(this.getValidBusinessDay(new Date()));

  isMobile = signal<boolean>(false);
  private layoutSub!: Subscription;

  ngOnInit() {
    this.layoutSub = this.breakpointObserver
      .observe([Breakpoints.HandsetPortrait, Breakpoints.HandsetLandscape])
      .subscribe((result) => {
        this.isMobile.set(result.matches);
        if (this.appointmentsData().length > 0) {
          this.buildAgendaGrid();
        }
      });

    this.loadProfessionalAgenda();
  }

  ngOnDestroy() {
    if (this.layoutSub) this.layoutSub.unsubscribe();
  }

  loadProfessionalAgenda() {
    this.isLoading.set(true);
    this.appointmentService.getAppointmentsMonth().subscribe({
      next: (appointments) => {
        this.appointmentsData.set(appointments);
        this.buildAgendaGrid();
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }


  nextPeriod() {
    const next = new Date(this.currentBaseDate());
    if (this.isMobile()) {
      next.setDate(next.getDate() + 1);
    } else {
      next.setDate(next.getDate() + 7);
    }
    this.currentBaseDate.set(this.getValidBusinessDay(next));
    this.buildAgendaGrid();
  }

  previousPeriod() {
    const prev = new Date(this.currentBaseDate());
    if (this.isMobile()) {
      prev.setDate(prev.getDate() - 1);
      // Se voltando 1 dia cair na segunda(1), pula para o sábado(6) anterior
      if (prev.getDay() === 1) prev.setDate(prev.getDate() - 2);
      // Se voltando 1 dia cair no domingo(0), pula para o sábado(6) anterior
      if (prev.getDay() === 0) prev.setDate(prev.getDate() - 1);
    } else {
      prev.setDate(prev.getDate() - 7);
    }

    if (!this.isMobile()) {
      this.currentBaseDate.set(this.getValidBusinessDay(prev));
    } else {
      this.currentBaseDate.set(prev);
    }

    this.buildAgendaGrid();
  }

  resetToToday() {
    this.currentBaseDate.set(this.getValidBusinessDay(new Date()));
    this.buildAgendaGrid();
  }


  private buildAgendaGrid() {
    const slots: AgendaSlot[] = [];
    const visibleDays = this.getVisibleDays(this.currentBaseDate());
    this.weekDays.set(visibleDays);

    let currentTime = new Date();
    currentTime.setHours(8, 0, 0, 0);
    const closingTime = new Date();
    closingTime.setHours(18, 0, 0, 0);

    const appointments = this.appointmentsData();

    while (currentTime <= closingTime) {
      const timeString = currentTime.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      });

      const daysRow = visibleDays.map((day) => {
        const targetDateTime = new Date(day);
        targetDateTime.setHours(
          currentTime.getHours(),
          currentTime.getMinutes(),
          0,
          0,
        );

        const foundAppt = appointments.find((appt) => {
          const apptDate = new Date(appt.startTime);
          return (
            apptDate.getTime() === targetDateTime.getTime() &&
            appt.status !== 'CANCELED'
          );
        });

        return {
          date: day,
          appointment: foundAppt || null,
        };
      });

      slots.push({ time: timeString, days: daysRow });
      currentTime.setMinutes(currentTime.getMinutes() + 45);
    }

    this.agendaGrid.set(slots);
  }

  private getVisibleDays(baseDate: Date): Date[] {
    if (this.isMobile()) {
      return [new Date(baseDate)];
    }

    const currentDayOfWeek = baseDate.getDay();
    const distanceToMonday = currentDayOfWeek === 0 ? -6 : 1 - currentDayOfWeek;
    const monday = new Date(baseDate);
    monday.setDate(baseDate.getDate() + distanceToMonday);

    const workingDays: Date[] = [];
    for (let i = 1; i <= 5; i++) {
      const day = new Date(monday);
      day.setDate(monday.getDate() + i);
      workingDays.push(day);
    }
    return workingDays;
  }

  private getValidBusinessDay(date: Date): Date {
    const newDate = new Date(date);
    if (newDate.getDay() === 0) newDate.setDate(newDate.getDate() + 2); // Dom -> Terça
    if (newDate.getDay() === 1) newDate.setDate(newDate.getDate() + 1); // Seg -> Terça
    return newDate;
  }
}
