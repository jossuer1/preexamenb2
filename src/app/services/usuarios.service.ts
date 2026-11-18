import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import type { Observable } from 'rxjs';

export interface Usuario {
  id: number;
  name: string;
  username: string;
  email: string;
  phone: string;
  website: string;
}

@Injectable({ providedIn: 'root' })
export class UsuariosService {
  private readonly http = inject(HttpClient);

  obtenerUsuarios(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>('https://jsonplaceholder.typicode.com/users');
  }
}
