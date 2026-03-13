import { Component, OnInit, ChangeDetectorRef, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { InvoiceService } from '../../services/invoice.service';

// Material & Componentes
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { ActionButtonComponent } from '../../components/action-button/action-button.component';
import { InputGenericComponent } from '../../components/input-generic/input-generic.component';
import { SelectGenericComponent } from '../../components/select-generic/select-generic.component';
import { DatabaseService } from '../../services/database.service';

@Component({
  selector: 'app-generation-data-page',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule,
    MatAutocompleteModule, MatDatepickerModule, MatNativeDateModule,
    MatIconModule, ActionButtonComponent, InputGenericComponent, SelectGenericComponent
  ],
  providers: [{ provide: MAT_DATE_LOCALE, useValue: 'es-ES' }],
  templateUrl: './generation-data-page.html',
  styleUrls: ['./generation-data-page.scss'],
})
export class GenerationDataPage implements OnInit {
  // --- NUEVA NOMENCLATURA: Inyección con inject() ---
  private fb = inject(FormBuilder);
  private db = inject(DatabaseService);
  private invoiceService = inject(InvoiceService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  // --- VARIABLES COMO SIGNALS ---
  // Mantenemos los nombres: 'disponibles' para el filtro y 'articulos' para el select
  disponibles = signal<any[]>([]);
  articulos = signal<any[]>([]);
  today = new Date();

  invoiceForm: FormGroup;

  constructor() {
    this.invoiceForm = this.fb.group({
      customer: ['', Validators.required],
      date: [new Date(), Validators.required],
      items: this.fb.array([])
    });
  }

  async ngOnInit() {
    await this.cargarArticulosDeBBDD();
    this.addItem();
  }

  get items() {
    return this.invoiceForm.get('items') as FormArray;
  }

  // --- CARGA DESDE BBDD (Sin JSON) ---
  async cargarArticulosDeBBDD() {
    try {
      const data = await this.db.getArticulos();
      // Actualizamos los signals
      this.disponibles.set(data);
      this.articulos.set(data);
      this.cdr.detectChanges();
    } catch (error) {
      console.error('❌ Error cargando articulos desde BBDD', error);
    }
  }

  addItem() {
    const itemForm = this.fb.group({
      id: [null],
      description: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(0.1)]],
      price: [0, [Validators.required, Validators.min(0)]]
    });
    this.items.push(itemForm);
    this.cdr.detectChanges();
  }

  removeItem(index: number) {
    if (this.items.length > 1) {
      this.items.removeAt(index);
    }
  }

  // Ajustado para Signals
  getFilteredOptions(index: number): any[] {
    const control = this.items.at(index).get('description');
    const filterValue = (control?.value || '').toLowerCase();

    if (!filterValue) return this.disponibles(); // Acceso al signal con ()

    return this.disponibles().filter(option =>
      option.nombre.toLowerCase().includes(filterValue)
    );
  }

  // Sincroniza el precio cuando seleccionas un producto
  onProductSelect(index: number) {
    const row = this.items.at(index);
    
    setTimeout(() => {
      const valorSeleccionado = row.get('description')?.value;
      
      // Buscamos el producto
      const producto = this.articulos().find(p => 
        p.id === Number(valorSeleccionado) || p.nombre === valorSeleccionado
      );

      if (producto) {
        // 1. Actualizamos los valores
        row.patchValue({ 
          id: producto.id,
          description: producto.nombre, 
          price: producto.precio_venta 
        }, { emitEvent: false });

        // 2. ¡CLAVE! Forzamos a Angular a reconocer el cambio de 0 a X inmediatamente
        this.cdr.detectChanges(); 
        
        console.log(`✅ Producto detectado y vista actualizada: ${producto.nombre}`);
      }
    });
  }

  onSubmit() {
    if (this.invoiceForm.valid) {
      const formValue = this.invoiceForm.value;

      const itemsConDetalle = formValue.items.map((item: any) => {
        // Buscamos el producto usando el ID que guardamos en el patchValue
        const productoBBDD = this.articulos().find(p => p.id === item.id);

        return {
          codigo: item.id || (productoBBDD ? productoBBDD.id : 'S/C'),
          // PRIORIDAD: 1. Nombre de BBDD, 2. Lo que haya escrito el usuario
          nombre: productoBBDD ? productoBBDD.nombre : item.description, 
          quantity: item.quantity,
          price: item.price
        };
      });

      this.invoiceService.setInvoiceData({
        ...formValue,
        items: itemsConDetalle
      });

      this.router.navigate(['/factura']);
    }
  }

  volverAlDashboard() {
    this.router.navigate(['/dashboard']);
  }
}