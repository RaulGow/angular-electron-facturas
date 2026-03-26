import { Component, input, forwardRef, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-datepicker-generic',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDatepickerModule, MatNativeDateModule, MatIconModule, MatInputModule],
  templateUrl: './datepicker-generic.component.html',
  styleUrl: './datepicker-generic.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DatepickerGenericComponent),
      multi: true,
    },
    { provide: MAT_DATE_LOCALE, useValue: 'es-ES' }
  ],
})
export class DatepickerGenericComponent implements ControlValueAccessor {
  label = input<string>('');
  placeholder = input<string>('Seleccione una fecha');
  error = input<string | null>(null);
  minDate = input<Date | null>(null);

  inputId = 'date-' + Math.random().toString(36).substring(2, 9);
  internalValue = signal<Date | null>(null);
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

  handleDateChange(event: any): void {
    const val = event.value;
    this.internalValue.set(val);
    this.onChange(val);
  }

  handleInputClick(picker: any): void {
    if (!this.isDisabled()) {
      picker.open();
    }
  }
}
