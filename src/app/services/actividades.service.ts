
import { Injectable } from '@angular/core';

import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc
} from 'firebase/firestore';

import { db } from '../config/firebase.config';

export interface Actividad {
  id?: string;
  titulo: string;
  descripcion: string;
  tipo: string;
  fechaEntrega: string;
  prioridad: string;
  completada: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ActividadesService {

  private actividadesRef = collection(db, 'actividades');

  // LEER
  async obtenerActividades(): Promise<Actividad[]> {
    const snapshot = await getDocs(this.actividadesRef);

    return snapshot.docs.map(documento => ({
      ...documento.data(),
      id: documento.id
    } as Actividad));
  }

  // CREAR
  async agregarActividad(actividad: Actividad) {
    const { id, ...datos } = actividad;

    return await addDoc(this.actividadesRef, datos);
  }

  // ACTUALIZAR
  async actualizarActividad(
    id: string,
    cambios: Partial<Omit<Actividad, 'id'>>
  ) {
    const actividadRef = doc(db, 'actividades', id);

    return await updateDoc(actividadRef, cambios);
  }

  // ELIMINAR
  async eliminarActividad(id: string) {
    const actividadRef = doc(db, 'actividades', id);

    return await deleteDoc(actividadRef);
  }

}
