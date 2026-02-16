import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule, formatDate } from '@angular/common';
import { ActionButtonComponent } from '../../components/action-button/action-button.component';
import { DatabaseService } from '../../services/database.service';
import { Articulo } from '../../models/charcuteria.models';

@Component({
  selector: 'articulos-page',
  standalone: true,
  imports: [ActionButtonComponent, CommonModule],
  templateUrl: './articulos-page.html',
  styleUrls: ['./articulos-page.scss'],
})
export class ArticulosPage implements OnInit, OnDestroy {

  today = new Date();
  articulos: Articulo[] = [];

  constructor(
    private db: DatabaseService,
    private cdr: ChangeDetectorRef
  ) {
    console.log('¿Electron?', !!(window as any).charcuteriaAPI);
  }

  async ngOnInit() {
    console.log('🧪 Cargando articulos...');
    await this.cargarArticulos();
    console.log('📦 Articulos:', this.articulos);
  }


  ngOnDestroy() {
    //destroy
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
