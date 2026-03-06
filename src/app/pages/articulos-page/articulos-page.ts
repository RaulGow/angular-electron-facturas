import { Component, OnInit, OnDestroy, ChangeDetectorRef, inject, ViewEncapsulation, signal } from '@angular/core';
import { CommonModule, formatDate } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { DatabaseService } from '../../services/database.service';
import { Articulo, Categoria } from '../../models/charcuteria.models';
import { ActionButtonComponent } from '../../components/action-button/action-button.component';
import { CustomModalComponent } from '../../components/custom-modal/custom-modal.component';
import { InputGenericComponent } from '../../components/input-generic/input-generic.component'
import { SelectGenericComponent } from '../../components/select-generic/select-generic.component';

@Component({
  selector: 'articulos-page',
  standalone: true,
  imports: [
    ActionButtonComponent,
    CommonModule,
    CustomModalComponent,
    InputGenericComponent,
    SelectGenericComponent,
    ReactiveFormsModule
  ],
  templateUrl: './articulos-page.html',
  styleUrls: ['./articulos-page.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ArticulosPage implements OnInit, OnDestroy {

  today = new Date();
  articulos: any[] = []; // Usamos any o un modelo extendido porque ahora viene con 'unidad_abreviatura'
  categorias: Categoria[] = [];
  unidades: any[] = []; // <--- NUEVA PROPIEDAD PARA LAS UNIDADES
  showModal = signal(false);
  articuloForm: FormGroup;

  constructor(
    private db: DatabaseService,
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder 
  ) {
    // Inicializar el formulario con unidadId en lugar de unidad_medida
    this.articuloForm = this.fb.group({
      id: [null],
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      precio_venta: [null, [Validators.required, Validators.min(0)]], // <--- Asegúrate que se llame así
      categoria_id: ['', Validators.required],                      // <--- Y este así
      unidad_id: ['', Validators.required],
      stock: [0, [Validators.required, Validators.min(0)]], 
      iva: [10, [Validators.required, Validators.min(0)]]   
    });
  }

  async ngOnInit() {
    await this.cargarCategorias();
    await this.cargarUnidades(); // <--- CARGAR UNIDADES AL INICIAR
    await this.cargarArticulos();
  }

  ngOnDestroy() { }

  async guardarArticulo() {
    if (this.articuloForm.valid) {
      try {
        const articuloData = this.articuloForm.value;
        
        // Llamada a la base de datos a través del servicio
        await this.db.saveArticulo(articuloData);
        
        console.log('✅ Artículo guardado con éxito');
        this.showModal.set(false);
        this.articuloForm.reset({ stock: 0, iva: 10 });
        await this.cargarArticulos(); // Recargar la lista
      } catch (error) {
        console.error('❌ Error al guardar:', error);
      }
    } else {
      this.articuloForm.markAllAsTouched();
    }
  }

  // Formateo de fecha (Tu lógica original intacta)
  get fechaFormateada(): string {
    let fecha = formatDate(this.today, "EEEE, d 'de' MMMM 'de' y", 'es-ES');
    return fecha.split(' ').map(palabra => {
      if (palabra.toLowerCase() === 'de') return palabra.toLowerCase();
      return palabra.charAt(0).toUpperCase() + palabra.slice(1);
    }).join(' ');
  }

  getNombreCategoria(id: any): string {
    if (!this.categorias || this.categorias.length === 0) return 'Cargando...';
    const buscado = Number(id);
    const categoria = this.categorias.find(c => Number(c.id) === buscado);
    return categoria ? categoria.nombre : 'Varios';
  }

  async cargarArticulos() {
    try {
      // Ahora este método devuelve los artículos con 'unidad_abreviatura' gracias al JOIN
      this.articulos = await this.db.getArticulos();
      this.cdr.detectChanges();
    } catch (error) {
      console.error('❌ Error cargando articulos', error);
    }
  }

  async cargarCategorias() {
    try {
      this.categorias = await this.db.getCategorias();
      this.cdr.detectChanges();
    } catch (error) {
      console.error('❌ Error cargando categorias', error);
    }
  }

  // --- NUEVO MÉTODO PARA CARGAR UNIDADES ---
  async cargarUnidades() {
    try {
      this.unidades = await this.db.getUnidades();
      this.cdr.detectChanges();
    } catch (error) {
      console.error('❌ Error cargando unidades', error);
    }
  }

  getCategoryClass(categoria: string): string {
    if (!categoria) return 'cat-generico';
    return 'cat-' + categoria.toLowerCase().replace(/\s+/g, '-');
  }

  // Helpers para los select
  get categoriasOpciones() {
    return this.categorias.map(cat => ({ id: cat.id, nombre: cat.nombre }));
  }

  get unidadesOpciones() {
    return this.unidades.map(u => ({ id: u.id, nombre: `${u.descripcion} (${u.abreviatura})` }));
  }

  miFuncionParaAbrirModal() {
    this.articuloForm.reset({ stock: 0, iva: 10 });
    this.showModal.set(true);
  }
}