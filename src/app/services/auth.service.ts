// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import {
  Auth,
  signInWithEmailAndPassword,
  signOut,
  user,
  User,
} from '@angular/fire/auth';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { Observable, from, of } from 'rxjs';
import { switchMap, map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // Déclarez les observables sans les initialiser ici
  currentUser$: Observable<User | null>;
  userWithRole$: Observable<{ user: User | null; role: string | null }>;

  constructor(private auth: Auth, private firestore: Firestore) {
    console.log('AuthService constructor appelé.');
    // Initialisez les observables ici, après que 'auth' et 'firestore' sont disponibles
    this.currentUser$ = user(this.auth);

    // Combine l'utilisateur et son rôle en un seul observable
    this.userWithRole$ = this.currentUser$.pipe(
      switchMap((user) => {
        console.log('Auth state changed. User:', user ? user.uid : 'null');
        if (user) {
          // Si un utilisateur est connecté, récupérez son document Firestore pour obtenir le rôle
          const userDocRef = doc(this.firestore, `users/${user.uid}`);
          return from(getDoc(userDocRef)).pipe(
            map((docSnapshot) => {
              if (docSnapshot.exists()) {
                const userData = docSnapshot.data();
                console.log('Données utilisateur récupérées:', userData);
                return { user, role: userData?.['role'] || null };
              } else {
                console.warn(
                  `Document utilisateur pour UID ${user.uid} non trouvé.`
                );
                return { user, role: null };
              }
            }),
            catchError((error) => {
              console.error(
                "Erreur lors de la récupération du rôle de l'utilisateur dans switchMap:",
                error
              );
              return of({ user, role: null }); // Retourne l'utilisateur sans rôle en cas d'erreur
            })
          );
        } else {
          // Si aucun utilisateur n'est connecté
          return of({ user: null, role: null });
        }
      })
    );
  }

  /**
   * Tente de connecter un utilisateur avec un email et un mot de passe.
   * @param email L'adresse email de l'utilisateur.
   * @param password Le mot de passe de l'utilisateur.
   * @returns Une promesse qui se résout en cas de succès ou rejette en cas d'échec.
   */
  async login(email: string, password: string): Promise<any> {
    console.log('AuthService.login() appelé avec email:', email);
    console.log("Tentative d'appel à signInWithEmailAndPassword..."); // NOUVEAU LOG
    try {
      const userCredential = await signInWithEmailAndPassword(
        this.auth,
        email,
        password
      );
      console.log('Connexion réussie via Firebase Auth:', userCredential.user);
      return userCredential.user;
    } catch (error: any) {
      console.error('Erreur dans AuthService.login():', error);
      throw error; // Propage l'erreur pour que le composant puisse la gérer
    }
  }

  /**
   * Déconnecte l'utilisateur actuellement connecté.
   * @returns Une promesse qui se résout en cas de succès ou rejette en cas d'échec.
   */
  async logout(): Promise<void> {
    console.log('AuthService.logout() appelé.');
    try {
      await signOut(this.auth);
      console.log('Utilisateur déconnecté via Firebase Auth.');
    } catch (error: any) {
      console.error('Erreur dans AuthService.logout():', error);
      throw error;
    }
  }

  /**
   * Récupère le rôle de l'utilisateur à partir de Firestore.
   * @param uid L'UID de l'utilisateur Firebase.
   * @returns Une promesse qui se résout avec le rôle de l'utilisateur (string | null).
   */
  private async getUserRole(uid: string): Promise<string | null> {
    console.log('getUserRole() appelé pour UID:', uid);
    try {
      const userDocRef = doc(this.firestore, `users/${uid}`);
      const docSnapshot = await getDoc(userDocRef);
      if (docSnapshot.exists()) {
        const userData = docSnapshot.data();
        console.log('Données utilisateur récupérées:', userData);
        return userData?.['role'] || null;
      } else {
        console.warn(`Document utilisateur pour UID ${uid} non trouvé.`);
        return null;
      }
    } catch (error) {
      console.error(
        `Erreur lors de la récupération du rôle pour UID ${uid}:`,
        error
      );
      return null;
    }
  }
}
// import { Injectable, inject } from '@angular/core';
// import {
//   Auth,
//   createUserWithEmailAndPassword,
//   signInWithEmailAndPassword,
//   signOut,
//   User,
// } from '@angular/fire/auth';
// import { Firestore, doc, getDoc, setDoc } from '@angular/fire/firestore';
// import { from, Observable, of, switchMap } from 'rxjs';

// @Injectable({
//   providedIn: 'root',
// })
// export class AuthService {
//   private auth: Auth = inject(Auth);
//   private firestore: Firestore = inject(Firestore);
//   public currentUser: User | null = null;
//   public userRole: string | null = null;

//   constructor() {
//     // Écoute les changements d'état de l'authentification
//     this.auth.onAuthStateChanged((user) => {
//       this.currentUser = user;
//       if (user) {
//         // Si un utilisateur est connecté, récupère son rôle
//         this.getUserRole(user.uid).subscribe((role) => {
//           this.userRole = role;
//         });
//       } else {
//         this.userRole = null;
//       }
//     });
//   }

//   // Connexion de l'utilisateur
//   signIn(email: string, password: string): Observable<any> {
//     return from(signInWithEmailAndPassword(this.auth, email, password));
//   }

//   // Inscription d'un nouvel utilisateur
//   signUp(
//     email: string,
//     password: string,
//     role: 'admin' | 'visitor'
//   ): Observable<any> {
//     return from(
//       createUserWithEmailAndPassword(this.auth, email, password)
//     ).pipe(
//       // Une fois l'utilisateur créé, ajoute son rôle dans Firestore
//       switchMap((userCredential) => {
//         const userId = userCredential.user.uid;
//         const userDocRef = doc(this.firestore, `users/${userId}`);
//         return from(setDoc(userDocRef, { email, role }));
//       })
//     );
//   }

//   // Déconnexion de l'utilisateur
//   signOut(): Observable<any> {
//     return from(signOut(this.auth));
//   }

//   // Récupère le rôle de l'utilisateur depuis Firestore
//   getUserRole(uid: string): Observable<string | null> {
//     const userDocRef = doc(this.firestore, `users/${uid}`);
//     return from(getDoc(userDocRef)).pipe(
//       switchMap((snapshot) => {
//         if (snapshot.exists()) {
//           const userData = snapshot.data() as { role: string };
//           return of(userData.role);
//         } else {
//           return of(null);
//         }
//       })
//     );
//   }
// }
