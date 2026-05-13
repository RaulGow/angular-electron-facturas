import { Component, OnInit, ChangeDetectorRef, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { InvoiceService } from '../../services/invoice.service';
import { ActivatedRoute } from '@angular/router';

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
  facturaId: number | null = null;

  // --- NUEVA NOMENCLATURA: Inyección con inject() ---
  private route = inject(ActivatedRoute);
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

    // Comprobar si hay ID en la URL
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.facturaId = Number(id);
      await this.cargarFacturaParaEdicion(this.facturaId);
    } else {
      this.addItem(); // Si es nueva, una línea vacía
    }
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

  get totalFactura(): number {
    return this.items.controls.reduce((acc, control) => {
      const qty = control.get('quantity')?.value || 0;
      const price = control.get('price')?.value || 0;
      const iva = control.get('iva')?.value || 0;
      const subtotal = qty * price;
      return acc + (subtotal + (subtotal * iva / 100));
    }, 0);
  }

  async cargarFacturaParaEdicion(id: number) {
    const data = await this.db.getFacturaDetalle(id);

    if (!data || !data.cabecera) return;

    // 1. Cabecera
    this.invoiceForm.patchValue({
      customer: data.cabecera.cliente_id,
      date: new Date(data.cabecera.fecha)
    });

    // 2. Líneas
    this.items.clear();
    data.lineas.forEach((linea: any) => {
      const itemForm = this.fb.group({
        id: [linea.articulo_id],
        // Importante: El valor debe ser el ID para que el Select lo marque como seleccionado
        description: [linea.articulo_id, Validators.required],
        // USAMOS LOS NOMBRES EXACTOS DE TU DB-MANAGER: cantidad y precio_unidad
        quantity: [linea.cantidad || linea.quantity || 0, [Validators.required, Validators.min(0.1)]],
        price: [linea.precio_unidad || linea.price || 0, [Validators.required, Validators.min(0)]],
        iva: [linea.iva_aplicado]
      });

      this.escucharCambiosLinea(itemForm);
      this.items.push(itemForm);
    });

    this.cdr.detectChanges();
  }

  // Extrae la lógica de suscripción para que funcione en addItem() y en edición
  escucharCambiosLinea(itemForm: FormGroup) {
    itemForm.get('description')?.valueChanges.subscribe(valorSeleccionado => {
      if (!valorSeleccionado) return;

      // Buscamos comparando con Number para asegurar coincidencia
      const producto = this.articulos().find(p => Number(p.id) === Number(valorSeleccionado));

      if (producto) {
        itemForm.patchValue({
          id: producto.id,
          price: producto.precio_venta || 0,
          iva: producto.iva || 0
        }, { emitEvent: false }); // Evitamos bucles infinitos
        this.cdr.detectChanges();
      }
    });
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

  async onSubmit() {
    if (this.invoiceForm.invalid) return;

    const formValue = this.invoiceForm.value;

    // 1. CONTEXTO CLIENTE
    const c = this.cliente.find(cli => cli.id === formValue.customer);
    const clienteParaFactura = {
      nombre: c ? (c.nombre_fiscal || c.nombre_comercial) : 'Cliente Final',
      cif: c?.cif || '',
      direccion: c?.direccion || '',
      poblacion: c?.poblacion || '',
      telefono: c?.telefono || '',
      email: c?.email || ''
    };

    // 2. CÁLCULOS
    let b4 = 0, c4 = 0, b10 = 0, c10 = 0, acumuladoTotal = 0;

    const itemsProcesados = formValue.items.map((item: any) => {
      const subtotal = item.quantity * item.price;
      const cuota = subtotal * (item.iva / 100);
      const totalLinea = subtotal + cuota;

      if (item.iva === 4) { b4 += subtotal; c4 += cuota; }
      else if (item.iva === 10) { b10 += subtotal; c10 += cuota; }

      acumuladoTotal += totalLinea;

      return {
        id: item.id,
        codigo: item.id || 'S/C',
        nombre: this.articulos().find(p => p.id === item.id)?.nombre || item.description,
        quantity: item.quantity,
        price: item.price,
        iva: item.iva,
        subtotal: subtotal
      };
    });

    const totales = {
      base_4: b4, cuota_4: c4,
      base_10: b10, cuota_10: c10,
      total: acumuladoTotal
    };

    try {
      let idResultado: number;

      // 3. DECISIÓN: ¿ACTUALIZAR O CREAR?
      if (this.facturaId) {
        // Estamos editando
        idResultado = await this.db.updateFactura(
          this.facturaId,
          formValue.customer,
          itemsProcesados,
          totales
        );
      } else {
        // Es una factura nueva
        idResultado = await this.db.crearFactura(
          formValue.customer,
          itemsProcesados,
          totales
        );
      }

      // 4. PASAR AL SERVICIO PARA EL PDF (Igual que antes)
      this.invoiceService.setInvoiceData({
        customer: clienteParaFactura,
        date: formValue.date,
        items: itemsProcesados,
      });

      // Navegamos a la vista del PDF
      this.router.navigate(['/factura']);

    } catch (error) {
      console.error('❌ Error al procesar la factura:', error);
    }
  }

  volverAlDashboard() {
    this.router.navigate(['/dashboard']);
  }
}