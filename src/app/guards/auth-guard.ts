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
