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
import { DatepickerGenericComponent } from '../../components/datepicker-generic/datepicker-generic.component';
import { DatabaseService } from '../../services/database.service';
import { Cliente } from '../../models/charcuteria.models';

@Component({
  selector: 'app-generation-data-page',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule,
    MatAutocompleteModule, MatDatepickerModule, MatNativeDateModule,
    MatIconModule, ActionButtonComponent, InputGenericComponent, SelectGenericComponent,
    DatepickerGenericComponent
  ],
  providers: [{ provide: MAT_DATE_LOCALE, useValue: 'es-ES' }],
  templateUrl: './generation-data-page.html',
  styleUrls: ['./generation-data-page.scss'],
})
export class GenerationDataPage implements OnInit {

  cliente: Cliente[] = [];

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
    await this.cargarClientes();
    this.addItem();
  }

  get items() {
    return this.invoiceForm.get('items') as FormArray;
  }

  get allClientes() {
    return this.cliente.map(c => ({
      id: c.id!,
      nombre: c.nombre_comercial || c.nombre_fiscal || 'Sin nombre'
    }));
  }

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

  async cargarClientes() {
    try {
      this.cliente = await this.db.getClientes();
      this.cdr.detectChanges();
    } catch (error) {
      console.error('❌ Error cargando clientes', error);
    }
  }

  addItem() {
    const itemForm = this.fb.group({
      id: [null],
      description: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(0.1)]],
      price: [0, [Validators.required, Validators.min(0)]],
      iva: [0]
    });

    // Sincroniza el precio automáticamente cada vez que cambia el valor del Select
    itemForm.get('description')?.valueChanges.subscribe(valorSeleccionado => {
      if (!valorSeleccionado) return;

      const producto = this.articulos().find(p =>
        p.id === Number(valorSeleccionado) || p.id === String(valorSeleccionado)
      );

      if (producto) {
        itemForm.patchValue({
          id: producto.id,
          price: producto.precio_venta || 0,
          iva: producto.iva || 0
        }, { emitEvent: false }); // No parches description: producto.nombre, ya que el select espera el ID internamente
        this.cdr.detectChanges();
        console.log(`✅ Producto actualizado: ${producto.nombre} - Precio: ${producto.precio_venta}`);
      }
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

  onSubmit() {
    if (this.invoiceForm.valid) {
      const formValue = this.invoiceForm.value;

      // 1. Buscamos el objeto cliente completo en el array original
      const c = this.cliente.find(cli => cli.id === formValue.customer);

      // 2. Creamos el objeto de datos del cliente para la factura
      const clienteParaFactura = {
        nombre: c ? (c.nombre_fiscal || c.nombre_comercial) : 'Cliente Final',
        cif: c?.cif || '',
        direccion: c?.direccion || '',
        poblacion: c?.poblacion || '',
        telefono: c?.telefono || '',
        email: c?.email || ''
      };

      // 3. Mapeo de artículos (el que ya tenías)
      const itemsConDetalle = formValue.items.map((item: any) => {
        const productoBBDD = this.articulos().find(p => p.id === item.id);
        return {
          codigo: item.id || (productoBBDD ? productoBBDD.id : 'S/C'),
          nombre: productoBBDD ? productoBBDD.nombre : item.description,
          quantity: item.quantity,
          price: item.price,
          iva: item.iva
        };
      });

      // 4. Enviamos el objeto enriquecido al servicio
      this.invoiceService.setInvoiceData({
        customer: clienteParaFactura, // <--- Enviamos el objeto, no solo el string
        date: formValue.date,
        items: itemsConDetalle
      });

      this.router.navigate(['/factura']);
    }
  }

  volverAlDashboard() {
    this.router.navigate(['/dashboard']);
  }
}