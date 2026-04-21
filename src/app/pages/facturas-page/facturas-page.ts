import { Component, OnInit, inject, signal } from '@angular/core'; // Añadimos inject y signal
import { formatDate, CommonModule } from '@angular/common'; // Añadimos CommonModule
import { Router, RouterLink } from '@angular/router';
import { DatabaseService } from '../../services/database.service';
import { ActionButtonComponent } from '../../components/action-button/action-button.component';

@Component({
  selector: 'facturas-page',
  standalone: true,
  imports: [RouterLink, CommonModule, ActionButtonComponent], // Importante añadir CommonModule para los pipes y *ngFor/@for
  templateUrl: './facturas-page.html',
  styleUrls: ['./facturas-page.scss'],
})
export class FacturasPage implements OnInit {
  private db = inject(DatabaseService);
  private router = inject(Router);

  // Usamos un signal para que la tabla se actualice sola cuando lleguen los datos
  listaFacturas = signal<any[]>([]);
  today = new Date();

  async ngOnInit() {
    await this.cargarFacturas();
  }

  async cargarFacturas() {
    const data = await this.db.getAllFacturas();
    this.listaFacturas.set(data);
  }

  get fechaFormateada(): string {
    // ... tu lógica de formateo se mantiene igual
    let fecha = formatDate(this.today, "EEEE, d 'de' MMMM 'de' y", 'es-ES');
    return fecha.split(' ').map(palabra => {
      if (palabra.toLowerCase() === 'de') return palabra.toLowerCase();
      return palabra.charAt(0).toUpperCase() + palabra.slice(1);
    }).join(' ');
  }

  editarFactura(id: number) {
    this.router.navigate(['/editar-factura', id]); // Asegúrate de que tu ruta acepte el parámetro
  }
}