// src/app/models/report.model.ts

import { Timestamp } from '@angular/fire/firestore'; // Corriger l'import pour Firebase v9+

export interface Report {
  id?: string; // Identifiant Firestore (ajouté manuellement après lecture du doc)
  date: Date | Timestamp;
  // Activité
  typeActivite: string; // Nom correct dans ton modèle
  category?: string; // Utilisé dans certains exports PDF
  activityType?: string; // Doublon de typeActivite dans certains cas → permet compatibilité

  // Localisation
  lieu: string;
  location?: string; // Alias utilisé ailleurs
  region: string;

  // Détails
  description: string;

  // Participants
  participants: {
    hommes: number;
    femmes: number;
    enfants: number;
    jeunes?: number;
  };

  // Métadonnées
  auteurId: string;
  auteurEmail: string;

  createdBy?: string; // Optionnel, utilisé dans export ou historique
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
}
