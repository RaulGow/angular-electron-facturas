import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { formatDate, CommonModule } from '@angular/common'; // Importante CommonModule
import { CardSummaryComponent } from '../../components/card-summary/card-summary.component';
import { ActionButtonComponent } from '../../components/action-button/action-button.component';
import { DatabaseService } from '../../services/database.service'; // Asegura la ruta correcta

@Component({
  selector: 'app-main-page',
  standalone: true,
  imports: [RouterLink, CommonModule, CardSummaryComponent, ActionButtonComponent],
  templateUrl: './main-page.html',
  styleUrls: ['./main-page.scss'],
})
export class MainPage implements OnInit {
  private db = inject(DatabaseService);
  private router = inject(Router);

  today = new Date();
  listaFacturas = signal<any[]>([]);

  async ngOnInit() {
    await this.cargarFacturas();
  }

  async cargarFacturas() {
    const data = await this.db.getAllFacturas();
    // Si solo quieres mostrar las últimas 5 en el dashboard, podrías hacer: .slice(0, 5)
    this.listaFacturas.set(data);
  }

  get fechaFormateada(): string {
    let fecha = formatDate(this.today, "EEEE, d 'de' MMMM 'de' y", 'es-ES');
    return fecha.split(' ').map(palabra => {
      if (palabra.toLowerCase() === 'de') return palabra.toLowerCase();
      return palabra.charAt(0).toUpperCase() + palabra.slice(1);
    }).join(' ');
  }

  // Funciones para los botones de la tabla
  verFactura(id: number) {
    this.router.navigate(['/ver-factura', id]);
  }

  imprimirFactura(id: number) {
    // Navegamos a la página de edición/generación pasando el ID
    // Esto asume que tu ruta es algo como path: 'editar-factura/:id'
    this.router.navigate(['/editar-factura', id]);
  }
}