import { Component, OnInit, OnDestroy } from '@angular/core';
import { formatDate } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'articulos-page',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './articulos-page.html',
  styleUrls: ['./articulos-page.scss'],
})
export class ArticulosPage implements OnInit, OnDestroy {

  today = new Date();
  horaActual: string = '';
  private timer: any;

  ngOnInit() {
    this.actualizarHora();
    // Refrescamos cada minuto (60000ms) es suficiente ahora que no hay segundos
    this.timer = setInterval(() => {
      this.actualizarHora();
    }, 60000);
  }

  ngOnDestroy() {
    // Limpiamos el timer cuando salgamos de la página para evitar fugas de memoria
    if (this.timer) clearInterval(this.timer);
  }

  actualizarHora() {
    const ahora = new Date();
    // Formato: 17:45
    this.horaActual = ahora.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false // Cambia a true si prefieres formato AM/PM
    });
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
