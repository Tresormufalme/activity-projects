import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
// Importe le DashboardComponent pour pouvoir le référencer dans les routes
import { DashboardComponent } from './dashboard/dashboard.component';

export const routes: Routes = [
  // Route pour la page de connexion
  { path: 'login', component: LoginComponent },
  // Route pour le tableau de bord
  // Utilisation de loadComponent pour le lazy loading, ce qui est une bonne pratique pour les composants standalone
  { path: 'dashboard', component: DashboardComponent },
  // Redirige la racine vers le tableau de bord par défaut
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  // Les futures routes pour l'ajout/édition de rapports iront ici
  {
    path: 'reports/new',
    loadComponent: () =>
      import('./report-form/report-form.component').then(
        (m) => m.ReportFormComponent
      ),
  },
  // Exemple : { path: 'reports/edit/:id', loadComponent: () => import('./reports/report-form/report-form.component').then(m => m.ReportFormComponent) },
  // Route pour les pages introuvables (à créer plus tard si nécessaire)
  // Exemple : { path: '**', loadComponent: () => import('./not-found/not-found.component').then(m => m.NotFoundComponent) },
];
