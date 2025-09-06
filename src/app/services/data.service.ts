import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private firestore: Firestore = inject(Firestore);
  private motardsCollection = collection(this.firestore, 'motards');

  // Récupère la liste de tous les motards
  getMotards(): Observable<any[]> {
    return collectionData(this.motardsCollection, {
      idField: 'id',
    }) as Observable<any[]>;
  }

  // Récupère un motard par son ID
  getMotard(id: string): Observable<any> {
    const docRef = doc(this.firestore, `motards/${id}`);
    return new Observable((observer) => {
      getDoc(docRef).then((docSnap) => {
        if (docSnap.exists()) {
          observer.next({ id: docSnap.id, ...docSnap.data() });
        } else {
          observer.next(null);
        }
        observer.complete();
      });
    });
  }

  // Ajoute un nouveau motard
  addMotard(motard: any): Promise<any> {
    return addDoc(this.motardsCollection, motard);
  }

  // Met à jour un motard
  updateMotard(id: string, motard: any): Promise<void> {
    const docRef = doc(this.firestore, `motards/${id}`);
    return updateDoc(docRef, motard);
  }

  // Supprime un motard
  deleteMotard(id: string): Promise<void> {
    const docRef = doc(this.firestore, `motards/${id}`);
    return deleteDoc(docRef);
  }
}
