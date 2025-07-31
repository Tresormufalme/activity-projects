import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common'; // Important pour les directives Angular comme ngIf, ngClass

@Component({
  selector: 'app-custom-modal',
  standalone: true, // Marque ce composant comme autonome
  imports: [CommonModule], // Importe CommonModule car il est souvent nécessaire pour les templates (ngIf, ngClass, etc.)
  templateUrl: './custom-modal.component.html',
  // styleUrls: ['./custom-modal.component.css'],
})
export class CustomModalComponent {
  @Input() title: string = 'Confirmation';
  @Input() message: string = 'Êtes-vous sûr de vouloir continuer ?';
  @Input() type: 'info' | 'success' | 'warning' | 'error' | 'confirm' =
    'confirm'; // Type de modale
  @Input() confirmButtonText: string = 'Confirmer';
  @Input() cancelButtonText: string = 'Annuler';
  @Input() showCancelButton: boolean = true; // Pour les types 'info', 'success', 'error', on peut masquer le bouton Annuler

  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>(); // Événement pour fermer la modale (par exemple, en cliquant en dehors ou sur un bouton "OK")

  constructor() {}

  onConfirm(): void {
    this.confirm.emit();
    this.close.emit(); // Ferme la modale après confirmation
  }

  onCancel(): void {
    this.cancel.emit();
    this.close.emit(); // Ferme la modale après annulation
  }

  onClose(): void {
    this.close.emit();
  }

  // Permet de déterminer les classes CSS en fonction du type de modale
  get headerClass(): string {
    switch (this.type) {
      case 'success':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'info':
        return 'bg-blue-500';
      case 'confirm':
        return 'bg-blue-500'; // Par défaut pour confirmation
      default:
        return 'bg-gray-500';
    }
  }
}
