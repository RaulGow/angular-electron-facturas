import { Component, input, output, EventEmitter, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'success' | 'danger';

@Component({
  selector: 'app-action-button',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './action-button.component.html',
  styleUrl: './action-button.component.scss',
})
export class ActionButtonComponent {

  label = input.required<string>();
  icon = input<string>('');
  link = input<string | null>(null);
  variant = input<ButtonVariant>('primary');
  type = input<'button' | 'submit' | 'reset'>('button'); // Por defecto 'button'
  disabled = input<boolean>(false); // Para manejar el estado del formulario
  //opcionales
  isWhiteIcon = input<boolean>(false);
  marginLeft = input<boolean>(false);
  marginRight = input<boolean>(false);


  buttonClasses = computed(() => {
    return {
      // Usamos la variante para generar la clase dinámica (ej: actions-button-success)
      [`actions-button-${this.variant()}`]: true,
      'margin-left': this.marginLeft(),
      'margin-right': this.marginRight(),
      'is-disabled': this.disabled()
    };
  });

  onClick = output<void>();

  handleAction() {
    // Si está deshabilitado, no hacemos nada
    if (this.disabled()) return;
    if (!this.link()) this.onClick.emit();
  }
}
