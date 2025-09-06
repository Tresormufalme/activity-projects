import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { DataService } from '../../services/data.service';
import { FormsModule } from '@angular/forms'; // Pour le filtrage

@Component({
  selector: 'app-admin-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './list.component.html',
  //   styleUrls: ['./list.component.css'],
})
export class AdminListComponent implements OnInit {
  motards: any[] = [];
  filteredMotards: any[] = [];
  searchTerm: string = '';
  sortBy: string = 'nom';
  sortDirection: 'asc' | 'desc' = 'asc';

  private dataService = inject(DataService);
  private router = inject(Router);

  ngOnInit(): void {
    // Récupère les données au démarrage du composant
    this.dataService.getMotards().subscribe((data) => {
      this.motards = data;
      this.applyFiltersAndSort();
    });
  }

  // Applique les filtres et le tri
  applyFiltersAndSort(): void {
    let tempMotards = [...this.motards];

    // 1. Filtrage
    if (this.searchTerm) {
      const lowerCaseTerm = this.searchTerm.toLowerCase();
      tempMotards = tempMotards.filter(
        (motard) =>
          motard.personnel.nom.toLowerCase().includes(lowerCaseTerm) ||
          motard.personnel.prenom.toLowerCase().includes(lowerCaseTerm) ||
          motard.moto.plaque.toLowerCase().includes(lowerCaseTerm)
      );
    }

    // 2. Tri
    tempMotards.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      // On gère les champs imbriqués pour le tri
      if (this.sortBy.includes('.')) {
        const [group, field] = this.sortBy.split('.');
        aValue = a[group][field];
        bValue = b[group][field];
      } else {
        aValue = a[this.sortBy];
        bValue = b[this.sortBy];
      }

      if (aValue < bValue) return this.sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    this.filteredMotards = tempMotards;
  }

  // Gère le changement de tri
  onSort(column: string): void {
    if (this.sortBy === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = column;
      this.sortDirection = 'asc';
    }
    this.applyFiltersAndSort();
  }

  // Gère la suppression d'un motard
  async onDelete(id: string): Promise<void> {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet enregistrement ?')) {
      await this.dataService.deleteMotard(id);
      console.log('Motard supprimé avec succès');
    }
  }

  // Navigue vers la page de modification
  onEdit(id: string): void {
    this.router.navigate(['/admin/edit', id]);
  }
}
