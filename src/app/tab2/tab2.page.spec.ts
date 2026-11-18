import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { ActividadesService } from '../services/actividades.service';
import { Tab2Page } from './tab2.page';

describe('Tab2Page', () => {
  let component: Tab2Page;
  let fixture: ComponentFixture<Tab2Page>;
  const eliminarActividad = vi.fn(async (_id: string) => {});
  const actualizarActividad = vi.fn(async (_id: string, _cambios: object) => {});

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: ActividadesService,
          useValue: { obtenerActividades: async () => [], eliminarActividad, actualizarActividad },
        },
      ],
    });
    fixture = TestBed.createComponent(Tab2Page);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('elimina por ID después de confirmar', async () => {
    const actividad = { ...component.crearFormularioVacio(), id: 'actividad-1' };
    component.actividades = [actividad];

    component.confirmarEliminar(actividad);
    expect(component.actividadParaEliminarId).toBe('actividad-1');
    expect(eliminarActividad).not.toHaveBeenCalled();

    await component.eliminarActividadConfirmada();

    expect(eliminarActividad).toHaveBeenCalledWith('actividad-1');
    expect(component.actividades).toEqual([]);
  });

  it('refleja el nuevo estado en la lista después de guardar', async () => {
    const actividad = { ...component.crearFormularioVacio(), id: 'actividad-1' };
    component.actividades = [actividad];

    await component.cambiarEstado(actividad);

    expect(actualizarActividad).toHaveBeenCalledWith('actividad-1', { completada: true });
    expect(component.actividades).toEqual([{ ...actividad, completada: true }]);
  });

  it('guarda la edición sobre el documento existente', async () => {
    const actividad = {
      id: 'actividad-1',
      titulo: 'Título anterior',
      descripcion: 'Descripción de la actividad',
      tipo: 'Tarea',
      fechaEntrega: '2026-11-20',
      prioridad: 'Alta',
      completada: false,
    };
    component.actividades = [actividad];
    component.nuevaActividad = { ...actividad, titulo: 'Título actualizado' };

    await component.guardarActividad();

    expect(component.actividades).toEqual([{ ...actividad, titulo: 'Título actualizado' }]);
    expect(component.nuevaActividad.id).toBeUndefined();
  });
});
