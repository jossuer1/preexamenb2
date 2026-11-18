# SmartCampus

Aplicación móvil académica para gestionar actividades, consultar un directorio de usuarios y explorar las funciones del dispositivo. Desarrollada con Ionic, Angular Standalone, TypeScript y Capacitor.

## Módulos

| Pestaña | Funciones |
| --- | --- |
| **Inicio** | Bienvenida, información del proyecto y accesos a los módulos. |
| **Actividades** | Crear, listar, editar, completar y eliminar actividades en Firebase Firestore. El formulario y la confirmación de borrado se abren en ventanas flotantes. |
| **Usuarios** | Directorio de JSONPlaceholder con avatares de iniciales, búsqueda por nombre y desplazamiento infinito. |
| **Dispositivo** | Lectura de los ejes X, Y y Z del acelerómetro en m/s². Permite guardar, recuperar y borrar una lectura con Capacitor Preferences. |

## Capturas

La [guía de evidencias](docs/README.md) reúne los nombres sugeridos y lo que debe mostrar cada captura JPEG.

## Ejecutar en el navegador

Se requiere Node.js 24.15 o una versión posterior de la rama 24 y npm.

1. Instala las dependencias.

   ```bash
   npm ci
   ```

2. Copia [firebase.config.example.ts](src/app/config/firebase.config.example.ts) en la misma carpeta con el nombre `firebase.config.ts`. Completa los campos con la configuración de tu aplicación web de Firebase y habilita Firestore para usar la colección `actividades`. El archivo con la configuración real es local y está excluido de Git.
3. Inicia la aplicación y abre `http://localhost:4200`.

   ```bash
   npm start
   ```

## Generar el APK en Windows

Se requiere JDK 21, el SDK de Android con API 36 y `ANDROID_HOME` apuntando al SDK. Desde la raíz del proyecto, con Firebase configurado:

```powershell
npm run build
npx cap sync android
cd android
.\gradlew.bat :app:assembleDebug
```

El APK de prueba se genera en `android/app/build/outputs/apk/debug/app-debug.apk` y requiere Android 7.0 o posterior. Para obtener lecturas reales del acelerómetro, usa un teléfono compatible y concede el permiso de movimiento si el dispositivo lo solicita.

## Pruebas unitarias

```bash
npm run test:unit
```
