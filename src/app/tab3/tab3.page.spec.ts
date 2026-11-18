import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import type { SearchbarCustomEvent } from '@ionic/angular';

import { Tab3Page } from './tab3.page';

describe('Tab3Page', () => {
  let component: Tab3Page;
  let fixture: ComponentFixture<Tab3Page>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    fixture = TestBed.createComponent(Tab3Page);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('busca entre los usuarios que todavía no se muestran', () => {
    component.ionViewWillEnter();
    const solicitud = TestBed.inject(HttpTestingController).expectOne({
      method: 'GET',
      url: 'https://jsonplaceholder.typicode.com/users',
    });
    solicitud.flush(
      Array.from({ length: 6 }, (_, indice) => ({
        id: indice + 1,
        name: indice === 5 ? 'Ana Torres' : `Usuario ${indice + 1}`,
        username: `usuario${indice + 1}`,
        email: 'ejemplo@example.com',
        phone: '555-0100',
        website: 'example.com',
      })),
    );

    expect(component.visibles()).toHaveLength(5);
    expect(component.quedanUsuarios()).toBe(true);

    component.buscar({ detail: { value: ' ANA ' } } as SearchbarCustomEvent);

    expect(component.visibles().map((usuario) => usuario.name)).toEqual(['Ana Torres']);
    expect(component.quedanUsuarios()).toBe(false);
  });
});
