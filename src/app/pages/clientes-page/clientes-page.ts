import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, formatDate } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DatabaseService } from '../../services/database.service';
import { Cliente } from '../../models/charcuteria.models';

@Component({
  selector: 'clientes-page',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './clientes-page.html',
  styleUrls: ['./clientes-page.scss'],
})
export class ClientesPage implements OnInit {

  today = new Date();

  clientes: Cliente[] = [];

  // Control formulario
  mostrandoFormulario = false;

  nuevoCliente: Cliente = {
    nombre: '',
    nombre_fiscal: '',  // ahora coincide con la DB
    cif: '',
    telefono: '',
    calle: '',
    codigo_postal: '',  // ahora coincide con la DB
    poblacion: ''
  };

  constructor(
    private db: DatabaseService,
    private cdr: ChangeDetectorRef
  ) {
    console.log('¿Electron?', !!(window as any).charcuteriaAPI);
  }

  async ngOnInit() {
    console.log('🧪 Cargando clientes...');
    await this.cargarClientes();
    console.log('📦 Clientes:', this.clientes);
  }

  async cargarClientes() {
    try {
      const clientes = await this.db.getClientes();

      // Asignamos los clientes
      this.clientes = clientes;

      // Forzamos que Angular actualice la vista
      this.cdr.detectChanges();

      console.log('📦 Clientes actualizados:', this.clientes);
    } catch (error) {
      console.error('❌ Error cargando clientes', error);
      alert('Error cargando clientes (ver consola)');
    }
  }

  mostrarAltaCliente() {
    this.mostrandoFormulario = true;
  }

  cancelarAlta() {
    this.mostrandoFormulario = false;
    this.resetFormulario();
  }

  async guardarCliente() {
    if (!this.nuevoCliente.nombre || !this.nuevoCliente.nombre_fiscal || !this.nuevoCliente.cif) {
      alert('Nombre, Nombre fiscal y CIF son obligatorios');
      return;
    }

    await this.db.saveCliente(this.nuevoCliente);
    await this.cargarClientes();

    this.cancelarAlta();
  }

  resetFormulario() {
    this.nuevoCliente = {
      nombre: '',
      nombre_fiscal: '',
      cif: '',
      telefono: '',
      calle: '',
      codigo_postal: '',
      poblacion: ''
    };
  }

  get fechaFormateada(): string {
    // 1. Obtenemos la fecha en formato: "martes, 20 de enero de 2026"
    let fecha = formatDate(this.today, "EEEE, d 'de' MMMM 'de' y", 'es-ES');

    // 2. Dividimos por espacios y procesamos cada palabra
    return fecha.split(' ').map(palabra => {
      // Si la palabra es "de", la dejamos en minúscula
      if (palabra.toLowerCase() === 'de') return palabra.toLowerCase();

      // Para las demás, ponemos la primera letra en mayúscula
      return palabra.charAt(0).toUpperCase() + palabra.slice(1);
    }).join(' ');
  }

}
