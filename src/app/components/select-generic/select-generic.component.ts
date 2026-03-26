import { Component, input, forwardRef, signal, computed, HostListener, ElementRef, inject, effect } from '@angular/core';
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
  
  searchTerm = signal('');
  isOpen = signal(false);

  filteredOptions = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const currentOpt = this.options().find(o => o.id === this.internalValue());
    const isTermExactlyCurrentOption = currentOpt ? currentOpt.nombre.toLowerCase() === term : false;
    
    if (!term || isTermExactlyCurrentOption) {
      return this.options();
    }
    
    return this.options().filter(opt => opt.nombre.toLowerCase().includes(term));
  });

  private elementRef = inject(ElementRef);

  constructor() {
    effect(() => {
      // Sincronizar el texto de búsqueda con la opción seleccionada cuando cambian los datos y no está desplegado
      const opts = this.options();
      const val = this.internalValue();
      if (!this.isOpen()) {
        const found = opts.find(o => o.id === val);
        if (found) {
          this.searchTerm.set(found.nombre);
        } else if (!val) {
          this.searchTerm.set('');
        }
      }
    });
  }

  onChange: any = () => { };
  onTouched: any = () => { };

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      if (this.isOpen()) {
        this.isOpen.set(false);
        this.resetSearchTermToSelected();
        this.onTouched();
      }
    }
  }

  writeValue(value: any): void {
    this.internalValue.set(value || '');
    this.resetSearchTermToSelected();
  }

  registerOnChange(fn: any): void { this.onChange = fn; }
  registerOnTouched(fn: any): void { this.onTouched = fn; }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled.set(isDisabled);
  }

  onInput(event: Event): void {
    if (this.isDisabled()) return;
    this.isOpen.set(true);
    const text = (event.target as HTMLInputElement).value;
    this.searchTerm.set(text);
    
    // Si el texto está vacío, limpiamos el valor seleccionado
    if (!text) {
      this.internalValue.set('');
      this.onChange('');
    }
  }

  onFocus(event: Event): void {
    if (this.isDisabled()) return;
    this.isOpen.set(true);
    // (event.target as HTMLInputElement).select(); // Opcional: seleccionar texto al hacer focus
  }

  toggleDropdown(event: Event): void {
    if (this.isDisabled()) return;
    event.stopPropagation();
    event.preventDefault();
    
    // Si la lista no tiene foco, se lo damos al input
    const inputEl = this.elementRef.nativeElement.querySelector('input');
    
    this.isOpen.set(!this.isOpen());
    if (this.isOpen()) {
      inputEl?.focus();
    } else {
      this.resetSearchTermToSelected();
      this.onTouched();
    }
  }

  // Usamos mousedown en lugar de click para que ocurra antes del blur() del input si lo hubiera
  selectOption(option: SelectOption, event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.internalValue.set(option.id);
    this.searchTerm.set(option.nombre);
    this.isOpen.set(false);
    this.onChange(option.id);
    this.onTouched();
  }

  private resetSearchTermToSelected(): void {
    const opt = this.options().find(o => o.id === this.internalValue());
    this.searchTerm.set(opt ? opt.nombre : '');
  }
}