// import { Component, inject } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { Router } from '@angular/router';
// import { FormsModule } from '@angular/forms';
// import { AuthService } from '../../services/auth.service';

// @Component({
//   selector: 'app-login',
//   standalone: true,
//   imports: [CommonModule, FormsModule],
//   templateUrl: './login.component.html',
//   styleUrls: ['./login.component.css'],
// })
// export class LoginComponent {
//   email = '';
//   password = '';
//   errorMessage: string | null = null;
//   private authService = inject(AuthService);
//   private router = inject(Router);

//   async onLogin() {
//     this.errorMessage = null;
//     try {
//       // Tente de connecter l'utilisateur
//       await this.authService.signIn(this.email, this.password).toPromise();

//       // Attend que le rôle de l'utilisateur soit récupéré
//       const user = this.authService.currentUser;
//       if (user) {
//         // Redirige en fonction du rôle
//         const userRole = await this.authService
//           .getUserRole(user.uid)
//           .toPromise();
//         if (userRole === 'admin') {
//           this.router.navigate(['/admin']);
//         } else if (userRole === 'visitor') {
//           this.router.navigate(['/visitor']);
//         }
//       } else {
//         throw new Error('User not found after login.');
//       }
//     } catch (error: any) {
//       // Gère les erreurs de connexion et affiche un message
//       this.errorMessage =
//         'Erreur de connexion. Veuillez vérifier votre email et mot de passe.';
//       console.error(error);
//     }
//   }
// }
