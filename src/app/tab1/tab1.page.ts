
import { Component } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonIcon,
  IonButton,
  IonBadge
} from '@ionic/angular';

import { RouterLink } from '@angular/router';
import { addIcons } from 'ionicons';
import {
  schoolOutline,
  calendarOutline,
  clipboardOutline,
  peopleOutline,
  phonePortraitOutline,
  arrowForwardOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonIcon,
    IonButton,
    IonBadge,
    RouterLink
  ],
})
export class Tab1Page {

  nombreApp = 'SmartCampus';

  integrantes = 'Nombre del estudiante';

  descripcion =
    'Aplicación móvil para gestionar actividades académicas, consultar usuarios y utilizar funciones del dispositivo.';

  fechaActual = new Date().toLocaleDateString('es-EC', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  constructor() {
    addIcons({
      schoolOutline,
      calendarOutline,
      clipboardOutline,
      peopleOutline,
      phonePortraitOutline,
      arrowForwardOutline
    });
  }

}
