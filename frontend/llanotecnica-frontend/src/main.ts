import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient, withFetch } from '@angular/common/http';

// Firebase imports
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideStorage, getStorage } from '@angular/fire/storage';

// Firebase Config
import { firebaseConfig } from './app/firebase.config';

bootstrapApplication(AppComponent, {
  ...appConfig,
  providers: [
    provideAnimations(),
    provideHttpClient(withFetch()), // ✅ Enable Fetch API for HttpClient
    provideFirebaseApp(() => initializeApp(firebaseConfig)), // Firebase Init
    provideFirestore(() => getFirestore()), // Firestore Database
    provideAuth(() => getAuth()), // Firebase Authentication
    provideStorage(() => getStorage()), // Firebase Storage
    ...(appConfig.providers || []),
  ],
}).catch((err) => console.error(err));
