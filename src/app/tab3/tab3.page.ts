import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  IonBadge,
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonIcon,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonSearchbar,
  IonSpinner,
  IonTitle,
  IonToolbar,
} from '@ionic/angular';
import type { InfiniteScrollCustomEvent, SearchbarCustomEvent } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { callOutline, mailOutline } from 'ionicons/icons';
import { finalize } from 'rxjs';

import { UsuariosService } from '../services/usuarios.service';
import type { Usuario } from '../services/usuarios.service';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  imports: [
    IonBadge,
    IonButton,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonContent,
    IonHeader,
    IonIcon,
    IonInfiniteScroll,
    IonInfiniteScrollContent,
    IonSearchbar,
    IonSpinner,
    IonTitle,
    IonToolbar,
  ],
})
export class Tab3Page {
  private readonly servicio = inject(UsuariosService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly usuarios = signal<Usuario[]>([]);
  private readonly consulta = signal('');
  private readonly tamanoPagina = 5;
  private readonly limite = signal(this.tamanoPagina);

  readonly cargando = signal(true);
  readonly error = signal(false);
  private solicitudActiva = false;

  private readonly filtrados = computed(() =>
    this.usuarios().filter((usuario) => usuario.name.toLowerCase().includes(this.consulta())),
  );
  readonly visibles = computed(() => this.filtrados().slice(0, this.limite()));
  readonly quedanUsuarios = computed(() => this.filtrados().length > this.limite());

  constructor() {
    addIcons({ callOutline, mailOutline });
  }

  ionViewWillEnter() {
    this.cargarUsuarios();
  }

  cargarUsuarios() {
    if (this.solicitudActiva) return;

    this.solicitudActiva = true;
    this.cargando.set(true);
    this.error.set(false);
    this.servicio.obtenerUsuarios()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.solicitudActiva = false;
          this.cargando.set(false);
        }),
      )
      .subscribe({
        next: (usuarios) => {
          this.usuarios.set(usuarios);
          this.limite.set(this.tamanoPagina);
        },
        error: () => this.error.set(true),
      });
  }

  buscar(evento: SearchbarCustomEvent) {
    this.consulta.set((evento.detail.value ?? '').trim().toLowerCase());
    this.limite.set(this.tamanoPagina);
  }

  async mostrarMas(evento: InfiniteScrollCustomEvent) {
    this.limite.update((limite) => limite + this.tamanoPagina);
    await evento.target.complete();
  }

  iniciales(nombre: string): string {
    return nombre.trim().split(/\s+/).slice(0, 2).map((parte) => parte.charAt(0)).join('').toUpperCase();
  }
}
