// // src/app/dashboard/dashboard.component.ts
// import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
// import { Router, RouterModule } from '@angular/router';
// import { User } from '@angular/fire/auth';
// import { Subscription } from 'rxjs';
// import { CommonModule } from '@angular/common'; // Pour les directives Angular (ngIf, ngFor)
// import { FormsModule } from '@angular/forms'; // Pour les formulaires (si édition inline)
// import { Timestamp } from 'firebase/firestore'; // Importation spécifique du type Timestamp de Firestore

// // Importations spécifiques à l'application
// import { AuthService } from '../services/auth.service'; // Assurez-vous que le chemin est correct
// import { ReportService } from '../services/report.service'; // Assurez-vous que le chemin est correct
// import { Report } from '../models/report.model';
// import { CustomModalComponent } from '../custom-modal/custom-modal.component'; // Importation de la modale personnalisée

// // Importations pour Chart.js et ng2-charts
// import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
// import { BaseChartDirective, NgChartsModule } from 'ng2-charts'; // Ajout de NgChartsModule

// @Component({
//   selector: 'app-dashboard',
//   standalone: true, // Marque ce composant comme autonome
//   imports: [
//     CommonModule,
//     FormsModule,
//     RouterModule, // Nécessaire pour les fonctionnalités de routage
//     CustomModalComponent, // Importe le composant de modale
//     NgChartsModule, // Importe le module pour les graphiques
//   ],
//   templateUrl: './dashboard.component.html',
//   styleUrls: ['./dashboard.component.css'],
// })
// export class DashboardComponent implements OnInit, OnDestroy {
//   currentUser: User | null = null;
//   userRole: string | null = null;
//   reports: Report[] = [];
//   private authSubscription: Subscription | undefined;
//   private reportsSubscription: Subscription | undefined;

//   // Propriétés pour la modale personnalisée
//   showCustomModal: boolean = false; // Contrôle l'affichage de la modale
//   modalTitle: string = '';
//   modalMessage: string = '';
//   modalType: 'info' | 'success' | 'warning' | 'error' | 'confirm' = 'info';
//   modalShowCancelButton: boolean = false; // Par défaut, pas de bouton annuler pour les messages d'info/succès/erreur
//   modalConfirmAction: () => void = () => {}; // Action à exécuter si l'utilisateur confirme (pour type 'confirm')

//   reportToDeleteId: string | null = null; // ID du rapport à supprimer
//   isLoadingPdf: boolean = false; // Indicateur de chargement pour le PDF

//   // Propriétés pour le graphique à barres (Participants par Région et Catégorie)
//   public barChartOptions: ChartConfiguration['options'] = {
//     responsive: true,
//     maintainAspectRatio: false, // Permet de contrôler la hauteur
//     scales: {
//       x: {},
//       y: {
//         min: 0,
//         beginAtZero: true,
//       },
//     },
//     plugins: {
//       legend: {
//         display: true,
//         position: 'top',
//       },
//       tooltip: {
//         callbacks: {
//           label: function (context) {
//             let label = context.dataset.label || '';
//             if (label) {
//               label += ': ';
//             }
//             if (context.parsed.y !== null) {
//               label += context.parsed.y;
//             }
//             return label;
//           },
//         },
//       },
//     },
//   };
//   public barChartType: ChartType = 'bar';
//   public barChartData: ChartData<'bar'> = {
//     labels: [],
//     datasets: [],
//   };
//   @ViewChild(BaseChartDirective) chart: BaseChartDirective | undefined;

//   // Propriétés pour le graphique en camembert (Rapports par Type d'Activités)
//   public pieChartOptions: ChartConfiguration['options'] = {
//     responsive: true,
//     maintainAspectRatio: false,
//     plugins: {
//       legend: {
//         display: true,
//         position: 'top',
//       },
//       tooltip: {
//         callbacks: {
//           label: function (context) {
//             const label = context.label || '';
//             const value = context.parsed;
//             return `${label}: ${value} rapports`;
//           },
//         },
//       },
//     },
//   };
//   public pieChartData: ChartData<'pie'> = {
//     labels: [],
//     datasets: [{ data: [] }],
//   };
//   public pieChartType: ChartType = 'pie';

//   constructor(
//     private authService: AuthService,
//     private reportService: ReportService,
//     private router: Router // Le routeur est injecté ici
//   ) {}

//   ngOnInit(): void {
//     // S'abonne aux changements d'état d'authentification de l'utilisateur
//     this.authSubscription = this.authService.userWithRole$.subscribe(
//       ({ user, role }) => {
//         this.currentUser = user;
//         this.userRole = role;
//         console.log('Utilisateur actuel:', user, 'Rôle:', role);
//         if (user) {
//           //   this.loadReports(); // Charge les rapports si l'utilisateur est connecté
//         } else {
//           this.reports = []; // Vide les rapports si déconnecté
//           this.updateCharts(); // Met à jour les graphiques pour refléter l'absence de données
//         }
//       }
//     );
//   }

//   ngOnDestroy(): void {
//     // Désabonne toutes les subscriptions pour éviter les fuites de mémoire
//     if (this.authSubscription) {
//       this.authSubscription.unsubscribe();
//     }
//     if (this.reportsSubscription) {
//       this.reportsSubscription.unsubscribe();
//     }
//   }

//   /**
//    * Charge les rapports depuis le service et les trie par date.
//    * Met à jour les graphiques après le chargement.
//    */
//   loadReports(): void {
//     // DÉCOMMENTÉ : La méthode loadReports elle-même
//     console.log('Tentative de chargement des rapports...');
//     this.reportsSubscription = this.reportService.getReports().subscribe({
//       next: (data) => {
//         console.log('Rapports reçus du service:', data);
//         this.reports = data
//           .map((report) => {
//             // Convertit les Timestamps en objets Date lors du chargement
//             // Assurez-vous que 'report.date', 'report.createdAt', 'report.updatedAt'
//             // sont bien des instances de Timestamp ou Date.
//             return {
//               ...report,
//               // date: report.date instanceof Timestamp ? report.date.toDate() : report.date,
//               createdAt:
//                 report.createdAt instanceof Timestamp
//                   ? report.createdAt.toDate()
//                   : report.createdAt,
//               updatedAt:
//                 report.updatedAt instanceof Timestamp
//                   ? report.updatedAt.toDate()
//                   : report.updatedAt,
//             };
//           })
//           .sort((a, b) => {
//             // CORRECTION APPORTÉE ICI: Utilise 'createdAt' pour le tri
//             return b.createdAt.getTime() - a.createdAt.getTime(); // Trie du plus récent au plus ancien
//           });
//         console.log('Rapports traités pour affichage:', this.reports);
//         this.updateCharts(); // Met à jour les graphiques après le chargement des rapports
//       },
//       error: (err) => {
//         console.error('Erreur lors du chargement des rapports:', err);
//         this.openCustomModal(
//           'Erreur',
//           'Impossible de charger les rapports. Veuillez réessayer plus tard.',
//           'error'
//         );
//       },
//     });
//   }

//   /**
//    * Met à jour les données des graphiques en fonction des rapports chargés.
//    * Agrège les participants par région et les rapports par type d'activité.
//    */
//   updateCharts(): void {
//     const participantsByRegion: {
//       [key: string]: {
//         total: number;
//         hommes: number;
//         femmes: number;
//         enfants: number;
//         jeunes: number;
//       };
//     } = {};
//     const reportsByTypeActivite: { [key: string]: number } = {};

//     this.reports.forEach((report) => {
//       // Agrégation pour les participants par région
//       const region = report.region || 'Non spécifié'; // Utilise 'Non spécifié' si la région n'est pas définie
//       if (!participantsByRegion[region]) {
//         participantsByRegion[region] = {
//           total: 0,
//           hommes: 0,
//           femmes: 0,
//           enfants: 0,
//           jeunes: 0,
//         };
//       }
//       // Assurez-vous que report.participants existe et est un objet
//       if (report.participants) {
//         participantsByRegion[region].hommes += report.participants.hommes || 0;
//         participantsByRegion[region].femmes += report.participants.femmes || 0;
//         participantsByRegion[region].enfants +=
//           report.participants.enfants || 0;
//         participantsByRegion[region].jeunes += report.participants.jeunes || 0; // Ajout des jeunes
//         participantsByRegion[region].total +=
//           (report.participants.hommes || 0) +
//           (report.participants.femmes || 0) +
//           (report.participants.enfants || 0) +
//           (report.participants.jeunes || 0);
//       }

//       // Agrégation pour les rapports par type d'activité (pour le camembert)
//       const typeActivite = report.typeActivite || 'Autre';
//       reportsByTypeActivite[typeActivite] =
//         (reportsByTypeActivite[typeActivite] || 0) + 1;
//     });

//     // Préparation des données pour le graphique à barres
//     const regions = Object.keys(participantsByRegion);
//     this.barChartData.labels = regions;
//     this.barChartData.datasets = [
//       {
//         data: regions.map((region) => participantsByRegion[region].total),
//         label: 'Total Participants',
//         backgroundColor: '#42A5F5', // Bleu clair
//       },
//       {
//         data: regions.map((region) => participantsByRegion[region].hommes),
//         label: 'Hommes',
//         backgroundColor: '#26C6DA', // Cyan
//       },
//       {
//         data: regions.map((region) => participantsByRegion[region].femmes),
//         label: 'Femmes',
//         backgroundColor: '#FF8A65', // Orange clair
//       },
//       {
//         data: regions.map((region) => participantsByRegion[region].enfants),
//         label: 'Enfants',
//         backgroundColor: '#9CCC65', // Vert clair
//       },
//       {
//         data: regions.map((region) => participantsByRegion[region].jeunes),
//         label: 'Jeunes',
//         backgroundColor: '#FFCA28', // Jaune
//       },
//     ];

//     // Préparation des données pour le graphique en camembert
//     this.pieChartData.labels = Object.keys(reportsByTypeActivite);
//     this.pieChartData.datasets[0].data = Object.values(reportsByTypeActivite);
//     this.pieChartData.datasets[0].backgroundColor = this.generateRandomColors(
//       this.pieChartData.labels.length
//     ); // Couleurs aléatoires

//     // Mettre à jour les graphiques (nécessaire pour ng2-charts)
//     this.chart?.update(); // Force la mise à jour du graphique à barres
//     // Si vous avez plusieurs ViewChild pour différents graphiques, mettez-les à jour ici aussi.
//   }

//   /**
//    * Génère un tableau de couleurs aléatoires au format RGBA.
//    * @param numColors Le nombre de couleurs à générer.
//    * @returns Un tableau de chaînes de caractères représentant des couleurs RGBA.
//    */
//   generateRandomColors(numColors: number): string[] {
//     const colors = [];
//     for (let i = 0; i < numColors; i++) {
//       const r = Math.floor(Math.random() * 255);
//       const g = Math.floor(Math.random() * 255);
//       const b = Math.floor(Math.random() * 255);
//       colors.push(`rgba(${r}, ${g}, ${b}, 0.7)`);
//     }
//     return colors;
//   }

//   /**
//    * Gère la déconnexion de l'utilisateur.
//    */
//   async logout(): Promise<void> {
//     try {
//       await this.authService.logout();
//       this.router.navigate(['/login']); // Redirige vers la page de connexion après déconnexion
//     } catch (error) {
//       console.error('Erreur lors de la déconnexion:', error);
//       this.openCustomModal(
//         'Erreur de Déconnexion',
//         'Une erreur est survenue lors de la déconnexion. Veuillez réessayer.',
//         'error'
//       );
//     }
//   }

//   /**
//    * Redirige vers le formulaire d'ajout de nouveau rapport.
//    */
//   addNewReport(): void {
//     this.router.navigate(['reports/new']);
//   }

//   /**
//    * Redirige vers le formulaire d'édition d'un rapport existant.
//    * @param id L'ID du rapport à modifier.
//    */
//   editReport(id: string | undefined): void {
//     if (id) {
//       this.router.navigate(['/reports/edit', id]);
//     } else {
//       console.warn('Impossible de modifier le rapport: ID non défini.');
//       this.openCustomModal(
//         'Information',
//         'Impossible de modifier le rapport: ID non défini.',
//         'info'
//       );
//     }
//   }

//   /**
//    * Ouvre la modale de confirmation pour la suppression d'un rapport.
//    * @param id L'ID du rapport à supprimer.
//    */
//   confirmDelete(id: string | undefined): void {
//     if (id) {
//       this.reportToDeleteId = id;
//       this.openCustomModal(
//         'Confirmation de Suppression',
//         'Êtes-vous sûr de vouloir supprimer ce rapport ? Cette action est irréversible.',
//         'confirm',
//         true,
//         () => this.deleteReportConfirmed()
//       );
//     }
//   }

//   /**
//    * Exécute la suppression du rapport après confirmation par l'utilisateur.
//    */
//   async deleteReportConfirmed(): Promise<void> {
//     if (this.reportToDeleteId) {
//       try {
//         await this.reportService.deleteReport(this.reportToDeleteId);
//         console.log('Rapport supprimé avec succès !');
//         this.openCustomModal(
//           'Succès',
//           'Le rapport a été supprimé avec succès.',
//           'success'
//         );
//       } catch (error) {
//         console.error('Erreur lors de la suppression du rapport:', error);
//         this.openCustomModal(
//           'Erreur de Suppression',
//           'Une erreur est survenue lors de la suppression du rapport. Veuillez réessayer.',
//           'error'
//         );
//       } finally {
//         this.closeCustomModal(); // Ferme la modale dans tous les cas
//       }
//     }
//   }

//   /**
//    * Ferme la modale personnalisée.
//    */
//   closeCustomModal(): void {
//     this.showCustomModal = false;
//     this.reportToDeleteId = null; // Réinitialise l'ID du rapport à supprimer
//     this.modalConfirmAction = () => {}; // Réinitialise l'action de confirmation
//   }

//   /**
//    * Ouvre la modale personnalisée avec les paramètres spécifiés.
//    */
//   openCustomModal(
//     title: string,
//     message: string,
//     type: 'info' | 'success' | 'warning' | 'error' | 'confirm',
//     showCancelButton: boolean = false,
//     confirmAction: () => void = () => {}
//   ): void {
//     this.modalTitle = title;
//     this.modalMessage = message;
//     this.modalType = type;
//     this.modalShowCancelButton = showCancelButton;
//     this.modalConfirmAction = confirmAction; // Stocke l'action à exécuter
//     this.showCustomModal = true;
//   }

//   /**
//    * Méthode publique pour naviguer vers la page de connexion.
//    * Cette méthode est accessible depuis le template HTML.
//    */
//   navigateToLogin(): void {
//     this.router.navigate(['/login']);
//   }

//   /**
//    * Vérifie si l'utilisateur connecté a les permissions de gérer les rapports.
//    * @returns Vrai si l'utilisateur est 'superadmin' ou 'admin', faux sinon.
//    */
//   canManageReports(): boolean {
//     return this.userRole === 'superadmin' || this.userRole === 'admin';
//   }

//   /**
//    * Génère et télécharge un PDF pour un seul rapport.
//    * @param report Le rapport à exporter.
//    */
//   //   async exportSingleReportPdf(report: Report): Promise<void> {
//   //     this.isLoadingPdf = true;
//   //     try {
//   //       // Crée un nom de fichier propre
//   //       // Assurez-vous que dateToUse est toujours un objet Date avant d'appeler toLocaleDateString
//   //       const dateToUse: Date =
//   //         report.date instanceof Timestamp
//   //           ? report.date.toDate()
//   //           : (report.date as Date);
//   //       const filename = `rapport_${report.typeActivite.replace(
//   //         /\s/g,
//   //         '_'
//   //       )}_${dateToUse.toLocaleDateString('fr-CA').replace(/\//g, '-')}.pdf`; // Utilise dateToUse directement
//   //       await this.reportService.generateReportPdf(report, filename);
//   //       console.log('PDF du rapport généré avec succès !');
//   //       this.openCustomModal(
//   //         'Succès',
//   //         'Le PDF du rapport a été généré avec succès.',
//   //         'success'
//   //       );
//   //     } catch (error) {
//   //       console.error('Erreur lors de la génération du PDF du rapport:', error);
//   //       this.openCustomModal(
//   //         'Erreur de Génération PDF',
//   //         'Une erreur est survenue lors de la génération du PDF. Veuillez réessayer.',
//   //         'error'
//   //       );
//   //     } finally {
//   //       this.isLoadingPdf = false;
//   //     }
//   //   }

//   /**
//    * Génère et télécharge un PDF pour tous les rapports affichés.
//    */
//   async exportAllReportsPdf(): Promise<void> {
//     if (this.reports.length === 0) {
//       // Utilisation de la modale personnalisée pour l'information
//       this.openCustomModal(
//         'Aucun Rapport à Exporter',
//         "Il n'y a aucun rapport disponible à exporter en PDF.",
//         'info',
//         false // Pas de bouton annuler pour un message d'information
//       );
//       return;
//     }
//     this.isLoadingPdf = true;
//     try {
//       const filename = `liste_rapports_${new Date()
//         .toLocaleDateString('fr-CA')
//         .replace(/\//g, '-')}.pdf`;
//       await this.reportService.generateMultipleReportsPdf(
//         this.reports,
//         filename
//       );
//       console.log('PDF de tous les rapports généré avec succès !');
//       this.openCustomModal(
//         'Succès',
//         'Le PDF de tous les rapports a été généré avec succès.',
//         'success'
//       );
//     } catch (error) {
//       console.error(
//         'Erreur lors de la génération du PDF de tous les rapports:',
//         error
//       );
//       this.openCustomModal(
//         'Erreur de Génération PDF',
//         'Une erreur est survenue lors de la génération du PDF de tous les rapports. Veuillez réessayer.',
//         'error'
//       );
//     } finally {
//       this.isLoadingPdf = false;
//     }
//   }
// }
// src/app/dashboard/dashboard.component.ts
import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { User } from '@angular/fire/auth';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common'; // Pour les directives Angular (ngIf, ngFor)
import { FormsModule } from '@angular/forms'; // Pour les formulaires (si édition inline)
import { Timestamp } from 'firebase/firestore'; // Importation spécifique du type Timestamp de Firestore

// Importations spécifiques à l'application
import { AuthService } from '../services/auth.service'; // Assurez-vous que le chemin est correct
import { ReportService } from '../services/report.service'; // Assurez-vous que le chemin est correct
import { Report } from '../models/report.model';
import { CustomModalComponent } from '../custom-modal/custom-modal.component'; // Importation de la modale personnalisée

// Importations pour Chart.js et ng2-charts
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { BaseChartDirective, NgChartsModule } from 'ng2-charts'; // Ajout de NgChartsModule

@Component({
  selector: 'app-dashboard',
  standalone: true, // Marque ce composant comme autonome
  imports: [
    CommonModule,
    FormsModule,
    RouterModule, // Nécessaire pour les fonctionnalités de routage
    CustomModalComponent, // Importe le composant de modale
    NgChartsModule, // Importe le module pour les graphiques
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  userRole: string | null = null;
  reports: Report[] = [];
  private authSubscription: Subscription | undefined;
  private reportsSubscription: Subscription | undefined;

  // Propriétés pour la modale personnalisée
  showCustomModal: boolean = false; // Contrôle l'affichage de la modale
  modalTitle: string = '';
  modalMessage: string = '';
  modalType: 'info' | 'success' | 'warning' | 'error' | 'confirm' = 'info';
  modalShowCancelButton: boolean = false; // Par défaut, pas de bouton annuler pour les messages d'info/succès/erreur
  modalConfirmAction: () => void = () => {}; // Action à exécuter si l'utilisateur confirme (pour type 'confirm')

  reportToDeleteId: string | null = null; // ID du rapport à supprimer
  isLoadingPdf: boolean = false; // Indicateur de chargement pour le PDF

  // Propriétés pour le graphique à barres (Participants par Région et Catégorie)
  public barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false, // Permet de contrôler la hauteur
    scales: {
      x: {},
      y: {
        min: 0,
        beginAtZero: true,
      },
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += context.parsed.y;
            }
            return label;
          },
        },
      },
    },
  };
  public barChartType: ChartType = 'bar';
  public barChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [],
  };
  @ViewChild(BaseChartDirective) chart: BaseChartDirective | undefined;

  // Propriétés pour le graphique en camembert (Rapports par Type d'Activités)
  public pieChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const label = context.label || '';
            const value = context.parsed;
            return `${label}: ${value} rapports`;
          },
        },
      },
    },
  };
  public pieChartData: ChartData<'pie'> = {
    labels: [],
    datasets: [{ data: [] }],
  };
  public pieChartType: ChartType = 'pie';

  constructor(
    private authService: AuthService,
    private reportService: ReportService,
    private router: Router // Le routeur est injecté ici
  ) {}

  ngOnInit(): void {
    // S'abonne aux changements d'état d'authentification de l'utilisateur
    this.authSubscription = this.authService.userWithRole$.subscribe(
      ({ user, role }) => {
        this.currentUser = user;
        this.userRole = role;
        console.log('Utilisateur actuel:', user, 'Rôle:', role);
        if (user) {
          this.loadReports(); // DÉCOMMENTÉ : Charge les rapports si l'utilisateur est connecté
        } else {
          this.reports = []; // Vide les rapports si déconnecté
          this.updateCharts(); // Met à jour les graphiques pour refléter l'absence de données
        }
      }
    );
  }

  ngOnDestroy(): void {
    // Désabonne toutes les subscriptions pour éviter les fuites de mémoire
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
    if (this.reportsSubscription) {
      this.reportsSubscription.unsubscribe();
    }
  }

  /**
   * Charge les rapports depuis le service et les trie par date.
   * Met à jour les graphiques après le chargement.
   */
  loadReports(): void {
    // DÉCOMMENTÉ : La méthode loadReports elle-même
    console.log('Tentative de chargement des rapports...');
    this.reportsSubscription = this.reportService.getReports().subscribe({
      next: (data) => {
        console.log('Rapports reçus du service:', data);
        this.reports = data
          .map((report) => {
            // Convertit les Timestamps en objets Date lors du chargement
            // Assurez-vous que 'report.date', 'report.createdAt', 'report.updatedAt'
            // sont bien des instances de Timestamp ou Date.
            return {
              ...report,
              date:
                report.date instanceof Timestamp
                  ? report.date.toDate()
                  : report.date,
              createdAt:
                report.createdAt instanceof Timestamp
                  ? report.createdAt.toDate()
                  : report.createdAt,
              updatedAt:
                report.updatedAt instanceof Timestamp
                  ? report.updatedAt.toDate()
                  : report.updatedAt,
            };
          })
          .sort((a, b) => {
            // CORRECTION: Trie par 'createdAt' au lieu de 'date'
            return b.createdAt.getTime() - a.createdAt.getTime(); // Trie du plus récent au plus ancien
          });
        console.log('Rapports traités pour affichage:', this.reports);
        this.updateCharts(); // Met à jour les graphiques après le chargement des rapports
      },
      error: (err) => {
        console.error('Erreur lors du chargement des rapports:', err);
        this.openCustomModal(
          'Erreur',
          'Impossible de charger les rapports. Veuillez réessayer plus tard.',
          'error'
        );
      },
    });
  }

  /**
   * Met à jour les données des graphiques en fonction des rapports chargés.
   * Agrège les participants par région et les rapports par type d'activité.
   */
  updateCharts(): void {
    const participantsByRegion: {
      [key: string]: {
        total: number;
        hommes: number;
        femmes: number;
        enfants: number;
        jeunes: number;
      };
    } = {};
    const reportsByTypeActivite: { [key: string]: number } = {};

    this.reports.forEach((report) => {
      // Agrégation pour les participants par région
      const region = report.region || 'Non spécifié'; // Utilise 'Non spécifié' si la région n'est pas définie
      if (!participantsByRegion[region]) {
        participantsByRegion[region] = {
          total: 0,
          hommes: 0,
          femmes: 0,
          enfants: 0,
          jeunes: 0,
        };
      }
      // Assurez-vous que report.participants existe et est un objet
      if (report.participants) {
        participantsByRegion[region].hommes += report.participants.hommes || 0;
        participantsByRegion[region].femmes += report.participants.femmes || 0;
        participantsByRegion[region].enfants +=
          report.participants.enfants || 0;
        participantsByRegion[region].jeunes += report.participants.jeunes || 0; // Ajout des jeunes
        participantsByRegion[region].total +=
          (report.participants.hommes || 0) +
          (report.participants.femmes || 0) +
          (report.participants.enfants || 0) +
          (report.participants.jeunes || 0);
      }

      // Agrégation pour les rapports par type d'activité (pour le camembert)
      const typeActivite = report.typeActivite || 'Autre';
      reportsByTypeActivite[typeActivite] =
        (reportsByTypeActivite[typeActivite] || 0) + 1;
    });

    // Préparation des données pour le graphique à barres
    const regions = Object.keys(participantsByRegion);
    this.barChartData.labels = regions;
    this.barChartData.datasets = [
      {
        data: regions.map((region) => participantsByRegion[region].total),
        label: 'Total Participants',
        backgroundColor: '#42A5F5', // Bleu clair
      },
      {
        data: regions.map((region) => participantsByRegion[region].hommes),
        label: 'Hommes',
        backgroundColor: '#26C6DA', // Cyan
      },
      {
        data: regions.map((region) => participantsByRegion[region].femmes),
        label: 'Femmes',
        backgroundColor: '#FF8A65', // Orange clair
      },
      {
        data: regions.map((region) => participantsByRegion[region].enfants),
        label: 'Enfants',
        backgroundColor: '#9CCC65', // Vert clair
      },
      {
        data: regions.map((region) => participantsByRegion[region].jeunes),
        label: 'Jeunes',
        backgroundColor: '#FFCA28', // Jaune
      },
    ];

    // Préparation des données pour le graphique en camembert
    this.pieChartData.labels = Object.keys(reportsByTypeActivite);
    this.pieChartData.datasets[0].data = Object.values(reportsByTypeActivite);
    this.pieChartData.datasets[0].backgroundColor = this.generateRandomColors(
      this.pieChartData.labels.length
    ); // Couleurs aléatoires

    // Mettre à jour les graphiques (nécessaire pour ng2-charts)
    this.chart?.update(); // Force la mise à jour du graphique à barres
    // Si vous avez plusieurs ViewChild pour différents graphiques, mettez-les à jour ici aussi.
  }

  /**
   * Génère un tableau de couleurs aléatoires au format RGBA.
   * @param numColors Le nombre de couleurs à générer.
   * @returns Un tableau de chaînes de caractères représentant des couleurs RGBA.
   */
  generateRandomColors(numColors: number): string[] {
    const colors = [];
    for (let i = 0; i < numColors; i++) {
      const r = Math.floor(Math.random() * 255);
      const g = Math.floor(Math.random() * 255);
      const b = Math.floor(Math.random() * 255);
      colors.push(`rgba(${r}, ${g}, ${b}, 0.7)`);
    }
    return colors;
  }

  /**
   * Gère la déconnexion de l'utilisateur.
   */
  async logout(): Promise<void> {
    try {
      await this.authService.logout();
      this.router.navigate(['/login']); // Redirige vers la page de connexion après déconnexion
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      this.openCustomModal(
        'Erreur de Déconnexion',
        'Une erreur est survenue lors de la déconnexion. Veuillez réessayer.',
        'error'
      );
    }
  }

  /**
   * Redirige vers le formulaire d'ajout de nouveau rapport.
   */
  addNewReport(): void {
    this.router.navigate(['reports/new']);
  }

  /**
   * Redirige vers le formulaire d'édition d'un rapport existant.
   * @param id L'ID du rapport à modifier.
   */
  editReport(id: string | undefined): void {
    if (id) {
      this.router.navigate(['/reports/edit', id]);
    } else {
      console.warn('Impossible de modifier le rapport: ID non défini.');
      this.openCustomModal(
        'Information',
        'Impossible de modifier le rapport: ID non défini.',
        'info'
      );
    }
  }

  /**
   * Ouvre la modale de confirmation pour la suppression d'un rapport.
   * @param id L'ID du rapport à supprimer.
   */
  confirmDelete(id: string | undefined): void {
    if (id) {
      this.reportToDeleteId = id;
      this.openCustomModal(
        'Confirmation de Suppression',
        'Êtes-vous sûr de vouloir supprimer ce rapport ? Cette action est irréversible.',
        'confirm',
        true,
        () => this.deleteReportConfirmed()
      );
    }
  }

  /**
   * Exécute la suppression du rapport après confirmation par l'utilisateur.
   */
  async deleteReportConfirmed(): Promise<void> {
    if (this.reportToDeleteId) {
      try {
        await this.reportService.deleteReport(this.reportToDeleteId);
        console.log('Rapport supprimé avec succès !');
        this.openCustomModal(
          'Succès',
          'Le rapport a été supprimé avec succès.',
          'success'
        );
      } catch (error) {
        console.error('Erreur lors de la suppression du rapport:', error);
        this.openCustomModal(
          'Erreur de Suppression',
          'Une erreur est survenue lors de la suppression du rapport. Veuillez réessayer.',
          'error'
        );
      } finally {
        this.closeCustomModal(); // Ferme la modale dans tous les cas
      }
    }
  }

  /**
   * Ferme la modale personnalisée.
   */
  closeCustomModal(): void {
    this.showCustomModal = false;
    this.reportToDeleteId = null; // Réinitialise l'ID du rapport à supprimer
    this.modalConfirmAction = () => {}; // Réinitialise l'action de confirmation
  }

  /**
   * Ouvre la modale personnalisée avec les paramètres spécifiés.
   */
  openCustomModal(
    title: string,
    message: string,
    type: 'info' | 'success' | 'warning' | 'error' | 'confirm',
    showCancelButton: boolean = false,
    confirmAction: () => void = () => {}
  ): void {
    this.modalTitle = title;
    this.modalMessage = message;
    this.modalType = type;
    this.modalShowCancelButton = showCancelButton;
    this.modalConfirmAction = confirmAction; // Stocke l'action à exécuter
    this.showCustomModal = true;
  }

  /**
   * Méthode publique pour naviguer vers la page de connexion.
   * Cette méthode est accessible depuis le template HTML.
   */
  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }

  /**
   * Vérifie si l'utilisateur connecté a les permissions de gérer les rapports.
   * @returns Vrai si l'utilisateur est 'superadmin' ou 'admin', faux sinon.
   */
  canManageReports(): boolean {
    return this.userRole === 'superadmin' || this.userRole === 'admin';
  }

  /**
   * Génère et télécharge un PDF pour un seul rapport.
   * @param report Le rapport à exporter.
   */
  // DÉCOMMENTÉ : La méthode exportSingleReportPdf elle-même
  async exportSingleReportPdf(report: Report): Promise<void> {
    this.isLoadingPdf = true;
    try {
      // Crée un nom de fichier propre
      // Utilisation de 'createdAt' pour le nom de fichier
      const dateToUse: Date =
        report.createdAt instanceof Timestamp
          ? report.createdAt.toDate()
          : (report.createdAt as Date);
      const filename = `rapport_${report.typeActivite.replace(
        /\s/g,
        '_'
      )}_${dateToUse.toLocaleDateString('fr-CA').replace(/\//g, '-')}.pdf`; // Utilise dateToUse directement
      await this.reportService.generateReportPdf(report, filename);
      console.log('PDF du rapport généré avec succès !');
      this.openCustomModal(
        'Succès',
        'Le PDF du rapport a été généré avec succès.',
        'success'
      );
    } catch (error) {
      console.error('Erreur lors de la génération du PDF du rapport:', error);
      this.openCustomModal(
        'Erreur de Génération PDF',
        'Une erreur est survenue lors de la génération du PDF. Veuillez réessayer.',
        'error'
      );
    } finally {
      this.isLoadingPdf = false;
    }
  }

  /**
   * Génère et télécharge un PDF pour tous les rapports affichés.
   */
  async exportAllReportsPdf(): Promise<void> {
    if (this.reports.length === 0) {
      // Utilisation de la modale personnalisée pour l'information
      this.openCustomModal(
        'Aucun Rapport à Exporter',
        "Il n'y a aucun rapport disponible à exporter en PDF.",
        'info',
        false // Pas de bouton annuler pour un message d'information
      );
      return;
    }
    this.isLoadingPdf = true;
    try {
      const filename = `liste_rapports_${new Date()
        .toLocaleDateString('fr-CA')
        .replace(/\//g, '-')}.pdf`;
      await this.reportService.generateMultipleReportsPdf(
        this.reports,
        filename
      );
      console.log('PDF de tous les rapports généré avec succès !');
      this.openCustomModal(
        'Succès',
        'Le PDF de tous les rapports a été généré avec succès.',
        'success'
      );
    } catch (error) {
      console.error(
        'Erreur lors de la génération du PDF de tous les rapports:',
        error
      );
      this.openCustomModal(
        'Erreur de Génération PDF',
        'Une erreur est survenue lors de la génération du PDF de tous les rapports. Veuillez réessayer.',
        'error'
      );
    } finally {
      this.isLoadingPdf = false;
    }
  }
}
