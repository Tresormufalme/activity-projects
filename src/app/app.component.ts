import { Component } from '@angular/core';
// Nécessaire pour les directives comme ngIf, ngFor
import { RouterModule } from '@angular/router'; // Nécessaire pour <router-outlet> et les directives de routage

@Component({
  selector: 'app-root',
  standalone: true, // IMPORTANT : Marque ce composant comme autonome
  imports: [RouterModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = "DE PARTOUT Rapports d'Activités";

  getCurrentYear(): number {
    return new Date().getFullYear();
  }
}
