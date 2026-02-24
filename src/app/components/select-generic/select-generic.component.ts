import { Component, input, forwardRef, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

// Interfaz para las categorías/opciones
export interface SelectOption {
  id: string | number;
  nombre: string;
}

@Component({
  selector: 'app-select-generic',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './select-generic.component.html',
  styleUrl: './select-generic.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectGenericComponent),
      multi: true,
    },
  ],
})
export class SelectGenericComponent implements ControlValueAccessor {
  label = input<string>('');
  placeholder = input<string>('Seleccione una opción');
  options = input<SelectOption[]>([]); // El listado de categorías que extrajimos
  error = input<string | null>(null);

  selectId = 'select-' + Math.random().toString(36).substring(2, 9);
  internalValue = signal<any>('');
  isDisabled = signal(false);

  onChange: any = () => { };
  onTouched: any = () => { };

  writeValue(value: any): void {
    this.internalValue.set(value || '');
  }

  registerOnChange(fn: any): void { this.onChange = fn; }
  registerOnTouched(fn: any): void { this.onTouched = fn; }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled.set(isDisabled);
  }

  handleChange(event: Event): void {
    const val = (event.target as HTMLSelectElement).value;
    this.internalValue.set(val);
    this.onChange(val);
  }
}