import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormGroup,
  FormBuilder,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router } from '@angular/router';
import { DataService } from '../../services/data.service';
import { ActivatedRoute } from '@angular/router';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './form.component.html',
  //   styleUrls: ['./form.component.css'],
})
export class FormComponent implements OnInit {
  formulaireMotard!: FormGroup;
  isEditMode = false;
  motardId: string | null = null;

  private fb = inject(FormBuilder);
  private dataService = inject(DataService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  ngOnInit(): void {
    this.initForm();
    this.route.paramMap.subscribe((params) => {
      this.motardId = params.get('id');
      if (this.motardId) {
        this.isEditMode = true;
        this.loadMotardData(this.motardId);
      }
    });
  }

  // Crée la structure du formulaire
  initForm(): void {
    this.formulaireMotard = this.fb.group({
      // Section 1: Infos personnelles
      personnel: this.fb.group({
        nom: ['', Validators.required],
        prenom: ['', Validators.required],
        dateNaissance: ['', Validators.required],
        lieuNaissance: ['', Validators.required],
        numeroIdentite: ['', Validators.required],
        adresse: ['', Validators.required],
        telephone: ['', Validators.required],
      }),
      // Section 2: Infos administratives
      administratif: this.fb.group({
        numeroPermis: ['', Validators.required],
        categoriePermis: ['', Validators.required],
        datesPermis: ['', Validators.required],
        aptitudeMedicale: ['', Validators.required],
        association: ['', Validators.required],
      }),
      // Section 3: Infos Moto/Bajaji
      moto: this.fb.group({
        type: ['', Validators.required],
        marque: ['', Validators.required],
        modele: ['', Validators.required],
        couleur: ['', Validators.required],
        vin: ['', Validators.required],
        moteur: ['', Validators.required],
        plaque: ['', Validators.required],
        autocollants: [''],
      }),
      // Section 4: Infos de sécurité
      securite: this.fb.group({
        contactUrgenceNom: ['', Validators.required],
        contactUrgenceTel: ['', Validators.required],
        contactUrgenceAdresse: ['', Validators.required],
      }),
      // Section 5: Infos propriétaire
      proprietaire: this.fb.group({
        nomProprietaire: ['', Validators.required],
        adresseProprietaire: ['', Validators.required],
        telProprietaire: ['', Validators.required],
        carteProprietaire: ['', Validators.required],
      }),
    });
  }

  // Charge les données du motard en mode édition
  async loadMotardData(id: string): Promise<void> {
    const motardData = await firstValueFrom(this.dataService.getMotard(id));
    if (motardData) {
      this.formulaireMotard.patchValue(motardData);
    }
  }

  // Gère la soumission du formulaire
  async onSubmit(): Promise<void> {
    if (this.formulaireMotard.invalid) {
      // Affiche les erreurs si le formulaire n'est pas valide
      this.formulaireMotard.markAllAsTouched();
      return;
    }

    try {
      const motardData = this.formulaireMotard.value;
      if (this.isEditMode && this.motardId) {
        await this.dataService.updateMotard(this.motardId, motardData);
        console.log('Motard mis à jour avec succès');
      } else {
        await this.dataService.addMotard(motardData);
        console.log('Motard ajouté avec succès');
      }
      this.router.navigate(['/admin/list']); // Redirige vers la liste après l'opération
    } catch (error) {
      console.error("Erreur lors de l'opération :", error);
    }
  }
}
