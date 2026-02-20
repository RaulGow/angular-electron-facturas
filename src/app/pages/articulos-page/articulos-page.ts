import { Component, OnInit, OnDestroy, ChangeDetectorRef, inject, ViewEncapsulation, signal } from '@angular/core';
import { CommonModule, formatDate } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActionButtonComponent } from '../../components/action-button/action-button.component';
import { DatabaseService } from '../../services/database.service';
import { Articulo } from '../../models/charcuteria.models';
import { CustomModalComponent } from '../../components/custom-modal/custom-modal.component';
import { InputGenericComponent } from '../../components/input-generic/input-generic.component'

@Component({
  selector: 'articulos-page',
  standalone: true,
  imports: [
    ActionButtonComponent,
    CommonModule,
    CustomModalComponent,
    InputGenericComponent,
    ReactiveFormsModule
  ],
  templateUrl: './articulos-page.html',
  styleUrls: ['./articulos-page.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ArticulosPage implements OnInit, OnDestroy {

  today = new Date();
  articulos: Articulo[] = [];
  showModal = signal(false);
  articuloForm: FormGroup;

  constructor(
    private db: DatabaseService,
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder // 4. Inyectar FormBuilder
  ) {
    console.log('¿Electron?', !!(window as any).charcuteriaAPI);

    // 5. Inicializar el formulario con validaciones básicas
    this.articuloForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      precio: [null, [Validators.required, Validators.min(0)]],
      categoria: ['General', Validators.required],
      stock: [0, [Validators.required, Validators.min(0)]], // Asegúrate de que esté aquí
      iva: [21, [Validators.required, Validators.min(0)]]   // <--- AÑADE ESTA LÍNEA
    });
  }

  async ngOnInit() {
    console.log('🧪 Cargando articulos...');
    await this.cargarArticulos();
    console.log('📦 Articulos:', this.articulos);
  }


  ngOnDestroy() {
    //destroy
  }

  guardarArticulo() {
    if (this.articuloForm.valid) {
      const nuevoArticulo = this.articuloForm.value;

      console.log('✅ Datos capturados del formulario:', nuevoArticulo);

      // Aquí iría la llamada a tu db:
      // await this.db.createArticulo(nuevoArticulo);

      this.showModal.set(false);
      this.articuloForm.reset({ categoria: 'General', stock: 0 }); // Limpiar después de guardar
    } else {
      console.error('❌ El formulario no es válido');
      this.articuloForm.markAllAsTouched(); // Para mostrar errores visuales
    }
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

  miFuncionParaAbrirModal() {
    console.log('Botón de agregar artículo clickeado');
  }

  async cargarArticulos() {
    try {
      const articulosDb = await this.db.getArticulos();

      // Asignamos los articulos
      this.articulos = articulosDb

      // Forzamos que Angular actualice la vista
      this.cdr.detectChanges();

      console.log('📦 Articulos actualizados:', this.articulos);
    } catch (error) {
      console.error('❌ Error cargando articulos', error);
      alert('Error cargando articulos (ver consola)');
    }
  }

  // estilos de categorias:
  getCategoryClass(categoria: string): string {
    if (!categoria) return 'cat-generico';

    // Convertimos "Embutidos Frescos" -> "cat-embutidos-frescos"
    return 'cat-' + categoria.toLowerCase().replace(/\s+/g, '-');
  }

}
