import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes'; // Importe vos routes depuis app.routes.ts

// Importations Firebase (pour l'initialisation dans l'environnement standalone)
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { environment } from './environments/environment'; // Votre configuration Firebase
import { appConfig } from './app/app.config';

bootstrapApplication(
  AppComponent,
  appConfig
  //  {
  // providers: [
  //   // IMPORTANT : Fournit le routage à l'application en utilisant les routes définies dans app.routes.ts
  //   provideRouter(routes),

  //   // Fournit les services Firebase

  //   // provideAuth(() => getAuth()),
  //   // provideFirestore(() => getFirestore()), provideFirebaseApp(() => initializeApp({ projectId: "activity-report-app", appId: "1:951406343626:web:66a631d570b53e68394b33", storageBucket: "activity-report-app.firebasestorage.app", apiKey: "AIzaSyC5ueucRiNPKC3KvSkbCD8xhfhGt7lFOIU", authDomain: "activity-report-app.firebaseapp.com", messagingSenderId: "951406343626" })), provideAuth(() => getAuth()), provideFirestore(() => getFirestore()),
  // ],
  // }
).catch((err) => console.error(err));
