import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Motion } from '@capacitor/motion';
import { Preferences } from '@capacitor/preferences';
import { vi } from 'vitest';
import { Tab4Page } from './tab4.page';

vi.mock('@capacitor/motion', () => ({ Motion: { addListener: vi.fn() } }));

describe('Tab4Page', () => {
  let component: Tab4Page;
  let fixture: ComponentFixture<Tab4Page>;

  beforeEach(() => {
    fixture = TestBed.createComponent(Tab4Page);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('libera una suscripción pendiente al salir de la pestaña', async () => {
    vi.stubGlobal('DeviceMotionEvent', class {});
    const remove = vi.fn(async () => {});
    const addListener = vi.mocked(Motion.addListener).mockResolvedValue({ remove });

    try {
      const inicio = component.iniciarLectura();
      const segundoInicio = component.iniciarLectura();
      component.ionViewWillLeave();
      await Promise.all([inicio, segundoInicio]);

      expect(addListener).toHaveBeenCalledTimes(1);
      expect(remove).toHaveBeenCalledOnce();
      expect(component.estado()).toBe('detenido');
    } finally {
      addListener.mockReset();
      vi.unstubAllGlobals();
    }
  });

  it('recupera la lectura guardada desde Preferences', async () => {
    const lectura = { x: 1, y: 2, z: 9.81, conGravedad: true, fecha: 1000 };
    const key = 'smartcampus.dispositivo.lectura';
    await Preferences.set({ key, value: JSON.stringify(lectura) });

    try {
      const pagina = TestBed.createComponent(Tab4Page);
      pagina.detectChanges();
      await vi.waitFor(() => expect(pagina.componentInstance.guardada()).toEqual(lectura));
    } finally {
      await Preferences.remove({ key });
    }
  });
});
