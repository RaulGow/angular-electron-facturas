import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { InvoiceService } from '../../services/invoice.service';

// Material Design Modules
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, MAT_DATE_LOCALE } from '@angular/material/core';
// Importa también MatIconModule si quieres el icono del calendario
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-generation-data-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule
  ],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'es-ES' }
  ],
  templateUrl: './generation-data-page.html',
  styleUrls: ['./generation-data-page.scss'],
})
export class GenerationDataPage implements OnInit {
  invoiceForm: FormGroup;
  disponibles: any[] = [];

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private invoiceService: InvoiceService,
    private router: Router,
    private cdr: ChangeDetectorRef // Inyectado para corregir error de detección
  ) {
    this.invoiceForm = this.fb.group({
      customer: ['', Validators.required],
      date: [new Date(), Validators.required],
      items: this.fb.array([])
    });
  }

  ngOnInit() {
    this.http.get<any[]>('assets/data/articulos.json').subscribe({
      next: (data) => {
        this.disponibles = data;
        this.cdr.detectChanges(); // Corrige el error NG0100
      },
      error: (err) => console.error('Error cargando artículos', err)
    });
    this.addItem();
  }

  get items() {
    return this.invoiceForm.get('items') as FormArray;
  }

  addItem() {
    const itemForm = this.fb.group({
      description: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
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

  // Función para filtrar los productos según lo que se escribe en cada fila
  getFilteredOptions(index: number): any[] {
    const control = this.items.at(index).get('description');
    const filterValue = (control?.value || '').toLowerCase();

    // Si no hay nada escrito, devolvemos los primeros 5 o toda la lista (opcional)
    if (!filterValue) return this.disponibles;

    // Filtramos la lista original 'disponibles'
    return this.disponibles.filter(option =>
      option.nombre.toLowerCase().includes(filterValue)
    );
  }

  onProductSelect(index: number) {
    const row = this.items.at(index);

    // Usamos un pequeño timeout para asegurar que el valor del autocomplete ya está en el control
    setTimeout(() => {
      const valorInput = row.get('description')?.value;
      const producto = this.disponibles.find(p =>
        p.nombre.toLowerCase() === valorInput.toLowerCase()
      );

      if (producto) {
        row.patchValue({ price: producto.precio });
      }
    });
  }

  onSubmit() {
    if (this.invoiceForm.valid) {
      const formValue = this.invoiceForm.value;

      // 1. Calculamos el total
      const totalAmount = formValue.items.reduce((acc: number, item: any) =>
        acc + (item.quantity * item.price), 0
      );

      // --- NUEVO: Mapeamos para incluir los CÓDIGOS antes de imprimir y enviar ---
      const itemsConDetalle = formValue.items.map((item: any) => {
        const productoEncontrado = this.disponibles.find(p => p.nombre === item.description);
        return {
          ...item,
          codigo: productoEncontrado ? productoEncontrado.codigo : 'S/C'
        };
      });

      // --- CONSOLE LOG DE RESUMEN ---
      console.log("%c--- RESUMEN DE FACTURA ---", "color: blue; font-weight: bold; font-size: 14px;");
      console.log(`Cliente: ${formValue.customer}`);
      console.log(`Fecha: ${formValue.date}`);
      console.log(`Número de artículos: ${formValue.items.length}`);

      // Imprime la tabla (ahora con Código incluido en la consola también)
      console.table(itemsConDetalle.map((item: any) => ({
        Código: item.codigo, // <--- Ahora se verá en el log
        Descripción: item.description,
        Cantidad: item.quantity,
        Precio: `${item.price} €`,
        Subtotal: `${(item.quantity * item.price).toFixed(2)} €`
      })));

      console.log(`%cTOTAL A PAGAR: ${totalAmount.toFixed(2)} €`, "color: green; font-weight: bold;");
      // ------------------------------

      // Enviar datos al servicio (usamos itemsConDetalle en lugar de formValue.items)
      this.invoiceService.setInvoiceData({
        ...formValue,
        items: itemsConDetalle,
        totalAmount
      });

      // Navegamos por código a la página de la factura
      this.router.navigate(['/factura']);
    } else {
      console.warn("El formulario no es válido. Revisa los campos obligatorios.");
    }
  }
}
