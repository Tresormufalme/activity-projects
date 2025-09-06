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
// import { Routes } from '@angular/router';
// import { LoginComponent } from './auth/login/login.component';
// import { authGuard } from './guards/auth.guard';
// import { AdminDashboardComponent } from './admin/admin-dashboard/admin-dashboard.component';
// import { VisitorDashboardComponent } from './visitor/visitor-dashboard/visitor-dashboard.component';

// export const routes: Routes = [
//   { path: '', redirectTo: 'login', pathMatch: 'full' },
//   { path: 'login', component: LoginComponent },

//   // Routes de l'interface Admin
//   {
//     path: 'admin',
//     // Le route guard est appliqué ici
//     canActivate: [authGuard],
//     // Nous passons le rôle requis via l'objet `data`
//     data: { role: 'admin' },
//     children: [
//       {
//         path: '',
//         loadComponent: () =>
//           import('./admin/admin-dashboard/admin-dashboard.component').then(
//             (m) => m.AdminDashboardComponent
//           ),
//       },
//       // ... Les autres routes Admin (liste, formulaire, détails)
//     ],
//   },

//   {
//     path: 'admin',
//     canActivate: [authGuard],
//     data: { role: 'admin' },
//     children: [
//       { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
//       { path: 'dashboard', component: AdminDashboardComponent },
//       { path: 'list', component: AdminListComponent },
//       { path: 'add', component: FormComponent },
//       { path: 'edit/:id', component: FormComponent },
//       // Nous utiliserons la route 'details' pour la vue lecture seule
//       { path: 'details/:id', component: AdminDetailsComponent },
//     ],
//   },
//   {
//     path: 'visitor',
//     canActivate: [authGuard],
//     data: { role: 'visitor' },
//     children: [
//       { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
//       { path: 'dashboard', component: VisitorDashboardComponent },
//       { path: 'list', component: VisitorListComponent },
//       { path: 'details/:id', component: VisitorDetailsComponent },
//     ],
//   },

//   // Routes de l'interface Visiteur
//   {
//     path: 'visitor',
//     // Le route guard est appliqué ici
//     canActivate: [authGuard],
//     // Le rôle requis est 'visitor'
//     data: { role: 'visitor' },
//     children: [
//       {
//         path: '',
//         loadComponent: () =>
//           import(
//             './visitor/visitor-dashboard/visitor-dashboard.component'
//           ).then((m) => m.VisitorDashboardComponent),
//       },
//       // ... Les autres routes Visiteur (liste, détails)
//     ],
//   },

//   { path: '**', redirectTo: 'login' },
// ];
