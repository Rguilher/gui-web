import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { UserService, UserDetail } from '../../../core/services/user.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';


import {
  debounceTime,
  distinctUntilChanged,
  switchMap,
  catchError,
  filter,
  tap,
  Subscription,
  of,
} from 'rxjs';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [
    MatCardModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    MatSnackBarModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDialogModule,
  ],
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.scss',
})
export class UserManagementComponent implements OnInit, OnDestroy {
  private userService = inject(UserService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);


  filteredUsers = signal<UserDetail[]>([]);


  isSearching = signal(false);
  processingUserId = signal<number | null>(null);

  searchControl = new FormControl('');
  private searchSub!: Subscription;

  roles = ['USER', 'PROFESSIONAL', 'ADMIN'];

  ngOnInit() {
    this.setupSearchStream();
  }

  ngOnDestroy() {
    if (this.searchSub) this.searchSub.unsubscribe();
  }


  private setupSearchStream() {
    this.searchSub = this.searchControl.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        tap((term) => {
          if (!term || term.trim() === '') {
            this.filteredUsers.set([]);
            this.isSearching.set(false);
          }
        }),
        filter((term) => !!term && term.trim() !== ''),
        tap(() => this.isSearching.set(true)),
        switchMap((term) =>
          this.userService.findUserByEmail(term!).pipe(
            catchError((err) => {
              return of(null);
            }),
          ),
        ),
      )
      .subscribe({
        next: (user) => {
          this.isSearching.set(false);
          if (user) {
            this.filteredUsers.set([user]);
          } else {
            this.filteredUsers.set([]);
          }
        },
        error: () => {
          this.isSearching.set(false);
          this.filteredUsers.set([]);
        },
      });
  }

  onRoleChange(user: UserDetail, newRole: string) {
    if (user.role === newRole) return;

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      disableClose: true,
      data: {
        title: 'Alterar Permissão',
        message: `Tem certeza que deseja alterar o nível de acesso de ${user.name} para ${newRole}? Esta ação tem impacto imediato na segurança do sistema.`,
        confirmText: 'Sim, Alterar',
        cancelText: 'Cancelar',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.executeRoleChange(user, newRole);
      } else {
        // Força a re-renderização do Select caso o Admin cancele
        this.filteredUsers.update((current) => [...current]);
      }
    });
  }

  private executeRoleChange(user: UserDetail, newRole: string) {
    this.processingUserId.set(user.id);

    this.userService
      .changeRole(user.id, { role: newRole as any })
      .subscribe({
        next: () => {
          this.snackBar.open(`Permissão atualizada com sucesso!`, 'Ok', {
            duration: 3000,
          });

          this.filteredUsers.update((currentUsers) =>
            currentUsers.map((u) =>
              u.id === user.id ? { ...u, role: newRole as any } : u,
            ),
          );

          this.processingUserId.set(null);
        },
        error: (err) => {
          this.snackBar.open('Erro ao alterar permissão', 'Fechar', {
            duration: 3000,
          });
          this.processingUserId.set(null);
          this.filteredUsers.update((current) => [...current]);
        },
      });
  }
}
