// src/app/guards/auth.guard.ts
import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
  Router,
} from '@angular/router';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    return this.authService.currentUser$.pipe(
      take(1), // Prend la première valeur et complète l'observable
      map((user) => {
        if (user) {
          // L'utilisateur est connecté, autorise l'accès à la route
          return true;
        } else {
          // L'utilisateur n'est pas connecté, redirige vers la page de connexion
          console.log(
            'Accès refusé: utilisateur non connecté. Redirection vers la page de connexion.'
          );
          return this.router.createUrlTree(['/login']);
        }
      })
    );
  }
}
// import { inject } from '@angular/core';
// import { CanActivateFn, Router } from '@angular/router';
// import { AuthService } from '../services/auth.service';
// import { firstValueFrom } from 'rxjs';

// export const authGuard: CanActivateFn = async (route, state) => {
//   const authService = inject(AuthService);
//   const router = inject(Router);

//   // Assurez-vous que l'état d'authentification est à jour
//   const user = await firstValueFrom(authService.authState);

//   if (!user) {
//     // Si l'utilisateur n'est pas connecté, redirigez-le vers la page de connexion
//     return router.parseUrl('/login');
//   }

//   // Récupérez le rôle de l'utilisateur
//   const userRole = await firstValueFrom(authService.getUserRole(user.uid));

//   // Vérifiez si la route nécessite un rôle spécifique
//   const requiredRole = route.data['role'];

//   if (requiredRole && userRole !== requiredRole) {
//     // Si l'utilisateur n'a pas le bon rôle, redirigez-le vers le tableau de bord approprié
//     if (userRole === 'admin') {
//       return router.parseUrl('/admin');
//     } else if (userRole === 'visitor') {
//       return router.parseUrl('/visitor');
//     }
//     // Redirection par défaut si le rôle n'est pas reconnu (optionnel)
//     return router.parseUrl('/login');
//   }

//   return true; // L'accès est autorisé
// };
