import { Component, OnInit, ChangeDetectorRef, signal } from '@angular/core';
import { CommonModule, formatDate } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { DatabaseService } from '../../services/database.service';
import { Cliente } from '../../models/charcuteria.models';
import { CustomModalComponent } from '../../components/custom-modal/custom-modal.component';
import { ActionButtonComponent } from '../../components/action-button/action-button.component';
import { InputGenericComponent } from '../../components/input-generic/input-generic.component';

@Component({
  selector: 'clientes-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CustomModalComponent,
    ActionButtonComponent,
    InputGenericComponent
  ],
  templateUrl: './clientes-page.html',
  styleUrls: ['./clientes-page.scss'],
})
export class ClientesPage implements OnInit {
  today = new Date();
  clientes: Cliente[] = [];
  showModal = signal(false);
  clienteForm: FormGroup;

  constructor(
    private db: DatabaseService,
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder
  ) {
    this.clienteForm = this.fb.group({
      id: [null],
      nombre_comercial: ['', [Validators.required, Validators.minLength(3)]],
      nombre_fiscal: ['', [Validators.required]],
      cif: ['', [Validators.required]],
      telefono: [''],
      email: [''],
      direccion: ['', [Validators.required]],
      codigo_postal: [''],
      poblacion: [''],
      provincia: ['Madrid'],
      notas: ['']
    });
  }

  async ngOnInit() {
    // Al cargar el componente, traeremos al Cliente General + el resto
    await this.cargarClientes();
  }

  async cargarClientes() {
    try {
      // Esta llamada obtiene los datos reales del archivo charcuteria.db
      this.clientes = await this.db.getClientes();
      this.cdr.detectChanges();
    } catch (error) {
      console.error('❌ Error cargando clientes desde la DB', error);
    }
  }

  showModalClientes() {
    // 1. Limpiamos el ID explícitamente a null para que no crea que estamos editando
    this.clienteForm.patchValue({ id: null });

    // 2. Reset total del formulario para limpiar errores de validación (el color rojo/bloqueado)
    this.clienteForm.reset({
      id: null,
      provincia: 'Madrid',
      poblacion: 'Móstoles'
    });

    // 3. Marcamos todos los controles como "pristine" y "untouched"
    this.clienteForm.markAsPristine();
    this.clienteForm.markAsUntouched();

    // 4. Abrimos el modal
    this.showModal.set(true);

    // 5. Forzamos a Angular a que renderice el cambio de estado inmediatamente
    this.cdr.detectChanges();
  }

  async editarCliente(cliente: Cliente) {
    // Cargamos los datos del cliente seleccionado en el formulario
    this.clienteForm.patchValue(cliente);
    this.showModal.set(true);
  }

  async guardarCliente() {
    if (this.clienteForm.invalid) {
      this.clienteForm.markAllAsTouched();
      return;
    }

    try {
      const datosCliente = this.clienteForm.value;
      // saveCliente en el main.js detectará si tiene ID (UPDATE) o no (INSERT)
      await this.db.saveCliente(datosCliente);

      this.showModal.set(false);
      await this.cargarClientes(); // Refrescamos la lista
    } catch (error) {
      console.error('Error al guardar cliente:', error);
      alert('Error: El CIF debe ser único o los campos están incompletos.');
    }
  }

  async borrarCliente(id: number) {
    if (id === 1) {
      alert('El Cliente General no puede ser eliminado del sistema.');
      return;
    }

    if (confirm('¿Estás seguro de que quieres eliminar este cliente?')) {
      try {
        // 1. Ejecutamos el borrado
        await this.db.deleteCliente(id);

        // 2. IMPORTANTE: Esperamos a que la carga de clientes termine
        // antes de permitir cualquier otra acción.
        await this.cargarClientes();

        // Forzamos una detección extra tras el borrado
        this.cdr.markForCheck();
      } catch (error) {
        console.error('Error al borrar:', error);
        alert('No se puede eliminar: Este cliente ya tiene facturas registradas.');
      }
    }
  }

  get fechaFormateada(): string {
    let fecha = formatDate(this.today, "EEEE, d 'de' MMMM 'de' y", 'es-ES');
    return fecha.split(' ').map(palabra =>
      palabra.toLowerCase() === 'de' ? palabra : palabra.charAt(0).toUpperCase() + palabra.slice(1)
    ).join(' ');
  }
}