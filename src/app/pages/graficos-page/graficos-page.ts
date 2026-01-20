import { Component, OnInit, OnDestroy } from '@angular/core';
import { formatDate } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'graficos-page',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './graficos-page.html',
  styleUrls: ['./graficos-page.scss'],
})
export class GraficosPage implements OnInit, OnDestroy {

  today = new Date();

  ngOnInit() {
    // ngOninit
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

}
