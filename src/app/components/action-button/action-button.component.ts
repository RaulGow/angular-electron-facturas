import { Component, input, output, EventEmitter } from '@angular/core';
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
  isWhiteIcon = input<boolean>(false);

  // Por defecto es primary
  variant = input<ButtonVariant>('primary');

  onClick = output<void>();

  handleAction() {
    if (!this.link()) this.onClick.emit();
  }
}
