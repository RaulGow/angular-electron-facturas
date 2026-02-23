import { Component, input, forwardRef, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-input-generic',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './input-generic.component.html',
  styleUrl: './input-generic.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputGenericComponent),
      multi: true,
    },
  ],
})
export class InputGenericComponent implements ControlValueAccessor {
  label = input<string>('');
  type = input<'text' | 'number' | 'email' | 'password'>('text');
  placeholder = input<string>('');
  error = input<string | null>(null);
  suffix = input<string | null>(null);

  // Generamos un ID único para el label y el input
  inputId = 'input-' + Math.random().toString(36).substring(2, 9);

  internalValue = signal<any>('');
  isDisabled = signal(false);

  onChange: any = () => { };
  onTouched: any = () => { };

  writeValue(value: any): void {
    this.internalValue.set(value);
  }

  registerOnChange(fn: any): void { this.onChange = fn; }
  registerOnTouched(fn: any): void { this.onTouched = fn; }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled.set(isDisabled);
  }

  handleInput(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    const finalVal = this.type() === 'number' ? (val === '' ? null : Number(val)) : val;

    this.internalValue.set(finalVal);
    this.onChange(finalVal);
  }
}