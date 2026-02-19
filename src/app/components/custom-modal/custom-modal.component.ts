import { Component, input, output, viewChild, ElementRef, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActionButtonComponent, ButtonVariant } from '../action-button/action-button.component';
import { effect } from '@angular/core';

@Component({
  selector: 'app-custom-modal',
  standalone: true,
  imports: [CommonModule, ActionButtonComponent],
  templateUrl: './custom-modal.component.html',
  styleUrl: './custom-modal.component.scss'
})
export class CustomModalComponent {
  // --- Signals de Configuración ---
  title = input<string>('Confirmación');
  isOpen = input<boolean>(false);
  
  // --- Signals para los 3 botones ---
  // Botón Principal (Guardar/Aceptar)
  btnPrimaryLabel = input<string>('');
  btnPrimaryVariant = input<ButtonVariant>('secondary');
  
  // Botón Secundario (Cancelar)
  btnSecondaryLabel = input<string>('');
  btnSecondaryVariant = input<ButtonVariant>('primary');

  // Botón Extra (Opcional)
  btnExtraLabel = input<string>('');
  btnExtraVariant = input<ButtonVariant>('tertiary');

  // --- Outputs ---
  onPrimary = output<void>();
  onSecondary = output<void>();
  onExtra = output<void>();
  onClose = output<void>();

  // Referencia al elemento nativo <dialog>
  private dialogElement = viewChild.required<ElementRef<HTMLDialogElement>>('modalElement');

  // Efecto manual para abrir/cerrar el dialog nativo
  constructor() {
    // Usamos un effect para reaccionar al signal isOpen
    effect(() => {
      const el = this.dialogElement().nativeElement;
      if (this.isOpen()) {
        el.showModal(); // Esto activa el backdrop nativo
      } else {
        el.close();
      }
    });
  }

  closeModal() {
    this.onClose.emit();
  }
}