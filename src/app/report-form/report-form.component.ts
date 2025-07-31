// src/app/components/report-form/report-form.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ReportService } from '../services/report.service'; // Chemin corrigé
import { AuthService } from '../services/auth.service'; // Importation de AuthService
import { Report } from '../models/report.model';
import { take } from 'rxjs/operators';
import { Timestamp } from 'firebase/firestore'; // Importation pour le type Timestamp
// import { CustomModalComponent } from '../custom-modal/custom-modal.component'; // Importation de la modale personnalisée
import { CommonModule } from '@angular/common'; // Pour les directives Angular (ngIf, ngFor)
import { ReactiveFormsModule } from '@angular/forms'; // Pour les formulaires réactifs

@Component({
  selector: 'app-report-form',
  standalone: true, // Marque ce composant comme autonome
  imports: [
    CommonModule,
    ReactiveFormsModule, // Nécessaire pour les formulaires réactifs
    // CustomModalComponent, // Importe le composant de modale
  ],
  templateUrl: './report-form.component.html',
  styleUrls: ['./report-form.component.css'], // Décommenté si vous avez des styles spécifiques
})
export class ReportFormComponent implements OnInit {
  reportForm: FormGroup;
  isEditMode: boolean = false;
  reportId: string | null = null;

  // Propriétés pour les messages et la modale personnalisée
  errorMessage: string | null = null;
  successMessage: string | null = null;
  isLoading: boolean = false; // Indicateur de chargement pour le bouton

  showCustomModal: boolean = false; // Contrôle l'affichage de la modale
  modalTitle: string = '';
  modalMessage: string = '';
  modalType: 'info' | 'success' | 'warning' | 'error' | 'confirm' = 'info';
  modalShowCancelButton: boolean = false; // Par défaut, pas de bouton annuler pour les messages d'info/succès/erreur
  modalConfirmAction: () => void = () => {}; // Action à exécuter si l'utilisateur confirme (pour type 'confirm')

  // Listes déroulantes pour les types d'activités, régions et catégories
  activityTypes: string[] = [
    'Formation',
    'Réunion',
    'Visite de terrain',
    'Atelier',
    'Sensibilisation',
    'Autre',
  ];
  regions: string[] = ['Nord-Kivu', 'Sud-Kivu', 'Ituri', 'Kinshasa', 'Autre'];
  categories: string[] = [
    'Éducation',
    'Santé',
    'Eau et Assainissement',
    'Protection',
    'Agriculture',
    'Autre',
  ];

  constructor(
    private fb: FormBuilder,
    private reportService: ReportService,
    private authService: AuthService, // Injecte AuthService
    private router: Router,
    private route: ActivatedRoute // Pour récupérer les paramètres de l'URL (ID du rapport en mode édition)
  ) {
    // Initialisation du formulaire avec des validateurs
    this.reportForm = this.fb.group({
      activityType: ['', Validators.required],
      date: ['', Validators.required],
      location: ['', Validators.required],
      description: ['', Validators.required],
      maleParticipants: [0, [Validators.required, Validators.min(0)]],
      femaleParticipants: [0, [Validators.required, Validators.min(0)]],
      childrenParticipants: [0, [Validators.required, Validators.min(0)]],
      youthParticipants: [0, [Validators.required, Validators.min(0)]],
      participantsCount: [
        { value: 0, disabled: true },
        [Validators.required, Validators.min(0)],
      ], // Désactivé car calculé
      region: ['', Validators.required],
      category: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    // Vérifie si nous sommes en mode édition (si un ID de rapport est présent dans l'URL)
    this.route.paramMap.subscribe((params) => {
      this.reportId = params.get('id');
      if (this.reportId) {
        this.isEditMode = true;
        this.loadReportForEdit(this.reportId);
      }
    });

    // Écoute les changements sur les champs de participants pour mettre à jour le total
    this.reportForm.valueChanges.subscribe(() => {
      this.updateTotalParticipants();
    });
  }

  /**
   * Charge les données d'un rapport existant pour le mode édition.
   * @param id L'ID du rapport à charger.
   */
  loadReportForEdit(id: string): void {
    this.reportService
      .getReportById(id)
      .pipe(take(1))
      .subscribe({
        next: (report) => {
          if (report) {
            // Assurez-vous que la date est un objet Date avant de la formater
            // const dateValue = report.date instanceof Timestamp ? report.date.toDate() : report.date;
            // const formattedDate = dateValue.toISOString().substring(0, 10); // Formatte en YYYY-MM-DD

            this.reportForm.patchValue({
              activityType: report.typeActivite,
              // date: formattedDate,
              location: report.lieu,
              description: report.description,
              maleParticipants: report.participants.hommes || 0,
              femaleParticipants: report.participants.femmes || 0,
              childrenParticipants: report.participants.enfants || 0,
              youthParticipants: report.participants.jeunes || 0,
              region: report.region,
              category: report.category, // Assurez-vous que 'category' existe dans votre Report model
            });
            this.updateTotalParticipants(); // Met à jour le total après chargement
          } else {
            this.openCustomModal('Erreur', 'Rapport non trouvé.', 'error');
            this.router.navigate(['/dashboard']); // Redirige si le rapport n'existe pas
          }
        },
        error: (err) => {
          this.openCustomModal(
            'Erreur',
            'Erreur lors du chargement du rapport.',
            'error'
          );
          console.error('Erreur de chargement du rapport:', err);
        },
      });
  }

  /**
   * Met à jour le champ 'participantsCount' en fonction des autres champs de participants.
   */
  updateTotalParticipants(): void {
    const male = this.reportForm.get('maleParticipants')?.value || 0;
    const female = this.reportForm.get('femaleParticipants')?.value || 0;
    const children = this.reportForm.get('childrenParticipants')?.value || 0;
    const youth = this.reportForm.get('youthParticipants')?.value || 0;
    const total = male + female + children + youth;
    this.reportForm
      .get('participantsCount')
      ?.setValue(total, { emitEvent: false }); // emitEvent: false pour éviter une boucle infinie
  }

  /**
   * Gère la soumission du formulaire (ajout ou modification).
   */
  async onSubmit(): Promise<void> {
    this.errorMessage = null;
    this.successMessage = null;
    this.isLoading = true; // Active l'indicateur de chargement

    if (this.reportForm.valid) {
      const formValues = this.reportForm.value;
      let reportToSave: Report;

      // Récupère l'utilisateur actuel pour auteurId et auteurEmail
      const currentUser = await this.authService.currentUser$
        .pipe(take(1))
        .toPromise();

      if (!currentUser || !currentUser.email || !currentUser.uid) {
        this.openCustomModal(
          'Erreur',
          'Utilisateur non authentifié. Veuillez vous reconnecter.',
          'error'
        );
        this.isLoading = false;
        return;
      }

      // Construit l'objet Report à partir des valeurs du formulaire
      reportToSave = {
        typeActivite: formValues.activityType,
        date: new Date(formValues.date), // Convertit la chaîne de date en objet Date
        lieu: formValues.location,
        region: formValues.region,
        category: formValues.category, // Assurez-vous que cette propriété est dans votre Report model
        description: formValues.description,
        participants: {
          hommes: formValues.maleParticipants,
          femmes: formValues.femaleParticipants,
          enfants: formValues.childrenParticipants,
          jeunes: formValues.youthParticipants,
        },
        auteurId: currentUser.uid,
        auteurEmail: currentUser.email,
        createdAt: new Date(), // Sera mis à jour par Firestore si c'est une nouvelle création
        updatedAt: new Date(), // Sera mis à jour par Firestore
      };

      try {
        if (this.isEditMode && this.reportId) {
          // Mode édition
          reportToSave.id = this.reportId; // Assigne l'ID pour la mise à jour
          await this.reportService.updateReport(reportToSave);
          this.openCustomModal(
            'Succès',
            'Rapport mis à jour avec succès !',
            'success'
          );
        } else {
          // Mode ajout
          await this.reportService.addReport(reportToSave);
          this.openCustomModal(
            'Succès',
            'Rapport ajouté avec succès !',
            'success'
          );
          this.reportForm.reset({
            // Réinitialise le formulaire après ajout
            activityType: '',
            // date: '',
            location: '',
            description: '',
            maleParticipants: 0,
            femaleParticipants: 0,
            childrenParticipants: 0,
            youthParticipants: 0,
            participantsCount: 0,
            region: '',
            category: '',
          });
          // Marque les contrôles comme non touchés après le reset pour effacer les validations
          this.reportForm.markAsUntouched();
          this.reportForm.markAsPristine();
        }
        // Redirige après un court délai pour que l'utilisateur voie le message de succès
        setTimeout(() => {
          this.router.navigate(['dashboard']);
        }, 1500);
      } catch (error: any) {
        const errorMessage = `Erreur lors de l'opération : ${
          error.message || 'Une erreur inconnue est survenue.'
        }`;
        this.openCustomModal('Erreur', errorMessage, 'error');
        console.error("Erreur lors de l'ajout/modification du rapport:", error);
      } finally {
        this.isLoading = false; // Désactive l'indicateur de chargement
      }
    } else {
      this.openCustomModal(
        'Erreur',
        'Veuillez remplir tous les champs obligatoires et corriger les erreurs.',
        'error'
      );
      this.markAllAsTouched(this.reportForm); // Marque tous les champs comme "touchés" pour afficher les erreurs
      this.isLoading = false; // Désactive l'indicateur de chargement
    }
  }

  /**
   * Marque tous les contrôles d'un FormGroup comme "touchés" pour déclencher l'affichage des messages de validation.
   * @param formGroup Le FormGroup à marquer.
   */
  private markAllAsTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach((control) => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markAllAsTouched(control);
      }
    });
  }

  /**
   * Annule l'opération et redirige vers le tableau de bord.
   */
  onCancel(): void {
    this.router.navigate(['/dashboard']);
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
   * Ferme la modale personnalisée.
   */
  closeCustomModal(): void {
    this.showCustomModal = false;
    this.modalConfirmAction = () => {}; // Réinitialise l'action de confirmation
  }
}
