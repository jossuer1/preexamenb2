import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import type { PluginListenerHandle } from '@capacitor/core';
import { Motion } from '@capacitor/motion';
import type { Acceleration, AccelListenerEvent } from '@capacitor/motion';
import { Preferences } from '@capacitor/preferences';
import {
  IonBadge, IonButton, IonCard, IonCardContent, IonCardHeader, IonCardTitle,
  IonContent, IonHeader, IonTitle, IonToolbar,
} from '@ionic/angular';

interface Lectura extends Acceleration {
  conGravedad: boolean;
  fecha: number;
}

const CLAVE_LECTURA = 'smartcampus.dispositivo.lectura';

function tieneEjes(valores: Acceleration | null | undefined): valores is Acceleration {
  return !!valores && Number.isFinite(valores.x) && Number.isFinite(valores.y) && Number.isFinite(valores.z);
}

@Component({
  selector: 'app-tab4',
  templateUrl: './tab4.page.html',
  styleUrls: ['./tab4.page.scss'],
  imports: [
    DatePipe, DecimalPipe, IonBadge, IonButton, IonCard, IonCardContent,
    IonCardHeader, IonCardTitle, IonContent, IonHeader, IonTitle, IonToolbar,
  ],
})
export class Tab4Page implements OnInit, OnDestroy {
  readonly estado = signal<'detenido' | 'iniciando' | 'esperando' | 'activo' | 'deteniendo'>('detenido');
  readonly lectura = signal<Lectura | null>(null);
  readonly guardada = signal<Lectura | null>(null);
  readonly mensajeSensor = signal('');
  readonly mensajeLocal = signal('');
  readonly operacionLocal = signal(true);

  private listener?: PluginListenerHandle;
  private espera?: ReturnType<typeof setTimeout>;
  private sesion = 0;
  private inicioPendiente = false;

  ngOnInit(): void {
    void this.cargarLectura();
  }

  ionViewWillLeave(): void {
    void this.detenerLectura();
  }

  ngOnDestroy(): void {
    void this.detenerLectura();
  }

  async iniciarLectura(): Promise<void> {
    if (this.estado() !== 'detenido' || this.inicioPendiente || this.listener) return;

    this.mensajeSensor.set('');
    this.lectura.set(null);

    if (typeof DeviceMotionEvent === 'undefined') {
      this.mensajeSensor.set('El sensor de movimiento no está disponible en este dispositivo o navegador.');
      return;
    }

    const sesion = ++this.sesion;
    this.inicioPendiente = true;
    this.estado.set('iniciando');

    try {
      const evento = DeviceMotionEvent as typeof DeviceMotionEvent & {
        requestPermission?: () => Promise<'granted' | 'denied'>;
      };

      if (evento.requestPermission) {
        const permiso = await evento.requestPermission();
        if (sesion !== this.sesion) return;
        if (permiso !== 'granted') {
          this.mensajeSensor.set('Se denegó el permiso de acceso al sensor de movimiento.');
          return;
        }
      }

      this.estado.set('esperando');
      this.listener = await Motion.addListener('accel', (datos) => {
        if (sesion === this.sesion) this.recibirLectura(datos);
      });

      if (sesion !== this.sesion) {
        await this.liberarListener();
        return;
      }

      if (!this.lectura()) {
        this.espera = setTimeout(() => {
          this.mensajeSensor.set('El sensor no envió datos. Comprueba que esté disponible y que el acceso esté permitido.');
          void this.detenerLectura();
        }, 4000);
      }
    } catch {
      if (this.listener) this.estado.set('esperando');
      this.mensajeSensor.set(sesion === this.sesion
        ? 'No se pudo iniciar la lectura del acelerómetro.'
        : 'No se pudo liberar la lectura del acelerómetro. Pulsa Detener para reintentar.');
    } finally {
      this.inicioPendiente = false;
      if (!this.listener) this.estado.set('detenido');
    }
  }

  async detenerLectura(): Promise<void> {
    if (this.estado() === 'detenido' || this.estado() === 'deteniendo') return;

    ++this.sesion;
    clearTimeout(this.espera);
    this.estado.set('deteniendo');
    if (this.inicioPendiente) return;

    try {
      await this.liberarListener();
      this.estado.set('detenido');
    } catch {
      this.estado.set('esperando');
      this.mensajeSensor.set('No se pudo detener la lectura. Pulsa Detener para reintentar.');
    }
  }

  private async liberarListener(): Promise<void> {
    if (this.listener) {
      await this.listener.remove();
      this.listener = undefined;
    }
  }

  private recibirLectura(datos: AccelListenerEvent): void {
    const conGravedad = tieneEjes(datos.accelerationIncludingGravity);
    const ejes = conGravedad ? datos.accelerationIncludingGravity : datos.acceleration;
    if (!tieneEjes(ejes)) return;

    clearTimeout(this.espera);
    this.lectura.set({ x: ejes.x, y: ejes.y, z: ejes.z, conGravedad, fecha: Date.now() });
    this.estado.set('activo');
  }

  private async cargarLectura(): Promise<void> {
    try {
      const { value } = await Preferences.get({ key: CLAVE_LECTURA });
      if (value === null) return;

      const lectura: Lectura | null = JSON.parse(value);
      if (!lectura || !tieneEjes(lectura) || !Number.isFinite(lectura.fecha)
          || typeof lectura.conGravedad !== 'boolean') {
        this.mensajeLocal.set('La lectura guardada no tiene un formato válido.');
        return;
      }
      this.guardada.set(lectura);
    } catch {
      this.mensajeLocal.set('No se pudo recuperar la lectura guardada.');
    } finally {
      this.operacionLocal.set(false);
    }
  }

  async guardarLectura(): Promise<void> {
    const lectura = this.lectura();
    if (!lectura || this.operacionLocal()) return;

    this.operacionLocal.set(true);
    try {
      await Preferences.set({ key: CLAVE_LECTURA, value: JSON.stringify(lectura) });
      this.guardada.set(lectura);
      this.mensajeLocal.set('Lectura guardada en este dispositivo.');
    } catch {
      this.mensajeLocal.set('No se pudo guardar la lectura.');
    } finally {
      this.operacionLocal.set(false);
    }
  }

  async borrarLectura(): Promise<void> {
    if (!this.guardada() || this.operacionLocal()) return;

    this.operacionLocal.set(true);
    try {
      await Preferences.remove({ key: CLAVE_LECTURA });
      this.guardada.set(null);
      this.mensajeLocal.set('Lectura guardada eliminada.');
    } catch {
      this.mensajeLocal.set('No se pudo eliminar la lectura guardada.');
    } finally {
      this.operacionLocal.set(false);
    }
  }
}
