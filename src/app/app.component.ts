import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; // Nécessaire pour les directives comme ngIf, ngFor
import { RouterModule } from '@angular/router'; // Nécessaire pour <router-outlet> et les directives de routage

@Component({
  selector: 'app-root',
  standalone: true, // IMPORTANT : Marque ce composant comme autonome
  imports: [
    CommonModule, // Permet d'utiliser les directives Angular de base
    RouterModule, // Permet d'utiliser <router-outlet> et les fonctionnalités de routage
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = "Gestion des Rapports d'Activités";

  getCurrentYear(): number {
    return new Date().getFullYear();
  }
}
