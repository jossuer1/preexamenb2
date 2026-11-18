
import { ChangeDetectorRef, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardContent,
  IonInput,
  IonTextarea,
  IonSelect,
  IonSelectOption,
  IonRadioGroup,
  IonRadio,
  IonCheckbox,
  IonButton,
  IonItem,
  IonLabel,
  IonToast,
  IonBadge,
  IonIcon,
  IonModal,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { addOutline } from 'ionicons/icons';

import {
  ActividadesService,
  Actividad
} from '../services/actividades.service';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonCard,
    IonCardContent,
    IonInput,
    IonTextarea,
    IonSelect,
    IonSelectOption,
    IonRadioGroup,
    IonRadio,
    IonCheckbox,
    IonButton,
    IonItem,
    IonLabel,
    IonToast,
    IonBadge,
    IonIcon,
    IonModal,
  ]
})
export class Tab2Page {

  // LISTA DE ACTIVIDADES
  actividades: Actividad[] = [];

  // FORMULARIO
  nuevaActividad: Actividad = this.crearFormularioVacio();
  mostrarFormulario = false;
  puedeCerrarFormulario = () => !this.guardando;

  // MENSAJES
  mensaje = '';
  colorToast = 'success';
  mostrarToast = false;

  // ESTADO
  guardando = false;
  cargando = false;
  errorCarga = '';


  // CONTROL DE ACTUALIZACION
  actualizandoId: string | null = null;

  // CONTROL DE ELIMINACION
  actividadParaEliminarId: string | null = null;
  eliminandoId: string | null = null;
  puedeCerrarConfirmacion = () => this.eliminandoId === null;

  constructor(
    private actividadesService: ActividadesService, private changeDetector: ChangeDetectorRef
  ) {
    addIcons({ addOutline });
  }

  // SE EJECUTA AL ENTRAR A LA PESTAÑA
  ionViewWillEnter() {
    this.cargarActividades();
  }

  // FORMULARIO CON VALORES INICIALES
  crearFormularioVacio(): Actividad {
    return {
      titulo: '',
      descripcion: '',
      tipo: '',
      fechaEntrega: '',
      prioridad: '',
      completada: false
    };
  }

  // LEER ACTIVIDADES DE FIRESTORE
  async cargarActividades() {
    if (this.ocupado) return;

    this.cargando = true;
    this.changeDetector.markForCheck();
    try {
      this.errorCarga = '';

      this.actividades =
        await this.actividadesService.obtenerActividades();

    } catch (error) {
      console.error(error);
      this.errorCarga = 'No se pudieron cargar las actividades.';
    } finally {
      this.cargando = false;
      this.changeDetector.markForCheck();
    }
  }

  // MOSTRAR MENSAJES
  mostrarMensaje(
    texto: string,
    color: string = 'success'
  ) {
    this.mensaje = texto;
    this.colorToast = color;
    this.mostrarToast = true;
  }

  // VALIDAR FORMULARIO
  validarFormulario(): boolean {

    const actividad = this.nuevaActividad;

    if (!actividad.titulo.trim()) {
      this.mostrarMensaje(
        'El título es obligatorio',
        'danger'
      );
      return false;
    }

    if (actividad.descripcion.trim().length < 10) {
      this.mostrarMensaje(
        'La descripción debe tener mínimo 10 caracteres',
        'danger'
      );
      return false;
    }

    const tiposValidos = [
      'Tarea', 'Proyecto', 'Examen',
      'Investigación', 'Taller'
    ];

    if (!tiposValidos.includes(actividad.tipo)) {
      this.mostrarMensaje(
        'Selecciona un tipo de actividad',
        'danger'
      );
      return false;
    }

    if (!actividad.fechaEntrega) {
      this.mostrarMensaje(
        'Selecciona una fecha de entrega',
        'danger'
      );
      return false;
    }

    const prioridadesValidas = [
      'Alta', 'Media', 'Baja'
    ];

    if (!prioridadesValidas.includes(actividad.prioridad)) {
      this.mostrarMensaje(
        'Selecciona una prioridad',
        'danger'
      );
      return false;
    }

    return true;
  }

  get ocupado(): boolean {
    return this.cargando || this.guardando || this.actualizandoId !== null || this.eliminandoId !== null;
  }

  editarActividad(actividad: Actividad) {
    if (!actividad.id || this.ocupado) return;

    this.nuevaActividad = {
      ...actividad,
      fechaEntrega: actividad.fechaEntrega?.slice(0, 10) ?? '',
    };
    this.abrirFormulario();
  }

  identificarActividad(_indice: number, actividad: Actividad) {
    return actividad.id ?? actividad;
  }

  abrirFormulario() {
    this.mostrarFormulario = true;
  }

  cancelarEdicion() {
    this.nuevaActividad = this.crearFormularioVacio();
    this.mostrarFormulario = false;
  }

  async guardarActividad() {
    if (this.ocupado || !this.validarFormulario()) return;

    const { id, ...datos } = this.nuevaActividad;
    datos.titulo = datos.titulo.trim();
    datos.descripcion = datos.descripcion.trim();
    this.guardando = true;

    try {
      if (id) {
        await this.actividadesService.actualizarActividad(id, datos);
        this.actividades = this.actividades.map((actividad) =>
          actividad.id === id ? { ...datos, id } : actividad,
        );
      } else {
        const referencia = await this.actividadesService.agregarActividad(datos);
        this.actividades = [...this.actividades, { ...datos, id: referencia.id }];
      }

      this.cancelarEdicion();
      this.mostrarMensaje(id ? 'Cambios guardados' : 'Actividad guardada correctamente');
    } catch (error) {
      console.error('Error al guardar:', error);
      this.mostrarMensaje('No se pudo guardar la actividad', 'danger');
    } finally {
      this.guardando = false;
      this.changeDetector.markForCheck();
    }
  }

  async cambiarEstado(actividad: Actividad) {
    const id = actividad.id;
    if (!id || this.ocupado) return;

    this.actualizandoId = id;
    const completada = !actividad.completada;

    try {
      await this.actividadesService.actualizarActividad(id, { completada });
      this.actividades = this.actividades.map((item) =>
        item.id === id ? { ...item, completada } : item,
      );
      if (this.nuevaActividad.id === id) {
        this.nuevaActividad.completada = completada;
      }
      this.mostrarMensaje(completada ? 'Actividad completada' : 'Actividad marcada como pendiente');
    } catch (error) {
      console.error('Error al actualizar:', error);
      this.mostrarMensaje('No se pudo actualizar la actividad', 'danger');
    } finally {
      this.actualizandoId = null;
      this.changeDetector.markForCheck();
    }
  }

  confirmarEliminar(actividad: Actividad) {
    if (!actividad.id || this.ocupado) {
      return;
    }

    this.actividadParaEliminarId = actividad.id;
  }

  cerrarConfirmacionEliminar() {
    this.actividadParaEliminarId = null;
  }

  async eliminarActividadConfirmada() {
    const id = this.actividadParaEliminarId;
    if (!id || this.ocupado) {
      return;
    }

    this.eliminandoId = id;
    try {
      await this.actividadesService.eliminarActividad(id);
      this.actividades = this.actividades.filter((actividad) => actividad.id !== id);
      this.cerrarConfirmacionEliminar();
      if (this.nuevaActividad.id === id) this.cancelarEdicion();
      this.mostrarMensaje('Actividad eliminada correctamente');
    } catch (error) {
      console.error('Error al eliminar:', error);
      this.mostrarMensaje('No se pudo eliminar la actividad', 'danger');
    } finally {
      this.eliminandoId = null;
      this.changeDetector.markForCheck();
    }
  }
}
