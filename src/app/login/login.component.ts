import { Component } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../services/auth.service';
import { CustomModalComponent } from '../custom-modal/custom-modal.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CustomModalComponent],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  isLoading: boolean = false;

  showCustomModal: boolean = false;
  modalTitle: string = '';
  modalMessage: string = '';
  modalType: 'info' | 'success' | 'warning' | 'error' | 'confirm' = 'info';
  modalShowCancelButton: boolean = false;
  modalConfirmAction: () => void = () => {};

  constructor(private authService: AuthService, private router: Router) {}

  async onLogin(): Promise<void> {
    console.log('onLogin() appelé. Tentative de connexion avec:', {
      email: this.email,
      password: this.password,
    });
    this.isLoading = true;
    try {
      console.log('Appel de authService.loginWithEmailPassword...');
      await this.authService.login(this.email, this.password);
      console.log('authService.loginWithEmailPassword terminé avec succès.');
      this.openCustomModal(
        'Succès',
        'Connexion réussie ! Redirection vers le tableau de bord.',
        'success'
      );
      setTimeout(() => {
        this.router.navigate(['dashboard']);
      }, 1500);
    } catch (error: any) {
      console.error('Erreur capturée dans LoginComponent.onLogin():', error);
      let errorMessage =
        'Une erreur est survenue lors de la connexion. Veuillez réessayer.';
      if (error.code) {
        switch (error.code) {
          case 'auth/user-not-found':
            errorMessage = 'Aucun utilisateur trouvé avec cet email.';
            break;
          case 'auth/wrong-password':
            errorMessage = 'Mot de passe incorrect.';
            break;
          case 'auth/invalid-email':
            errorMessage = "Format d'email invalide.";
            break;
          case 'auth/invalid-credential':
            errorMessage =
              'Identifiants invalides. Veuillez vérifier votre email et mot de passe.';
            break;
          default:
            errorMessage = `Erreur de connexion: ${error.message}`;
            break;
        }
      }
      this.openCustomModal('Erreur de Connexion', errorMessage, 'error');
    } finally {
      console.log('onLogin() terminé. isLoading mis à false.');
      this.isLoading = false;
    }
  }

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
    this.modalConfirmAction = confirmAction;
    this.showCustomModal = true;
    console.log('Modale ouverte:', { title, message, type });
  }

  closeCustomModal(): void {
    this.showCustomModal = false;
    this.modalConfirmAction = () => {};
    console.log('Modale fermée.');
  }
}
