import { Component, OnInit, OnDestroy } from '@angular/core';
import { formatDate } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BaseChartDirective, provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { ChartConfiguration, ChartOptions, ChartType } from 'chart.js';

@Component({
  selector: 'graficos-page',
  standalone: true,
  imports: [RouterLink, BaseChartDirective],
  providers: [provideCharts(withDefaultRegisterables())],
  templateUrl: './graficos-page.html',
  styleUrls: ['./graficos-page.scss'],
})
export class GraficosPage implements OnInit, OnDestroy {

  today = new Date();

  // 3. Configuración de los DATOS
  public lineChartData: ChartConfiguration['data'] = {
    labels: [
    'Enero',
    'Febrero',
    'Mazo',
    'Abril',
    'Mayo',
  ],
  datasets: [{
    label: 'Ventas 2026',
    data: [750, 350, 300, 350, 400],
    backgroundColor: [
      'rgb(255, 99, 132)',
      'rgb(54, 162, 235)',
      'rgb(255, 205, 86)',
      'rgb(111, 255, 86)',
      'rgb(199, 86, 255)',
    ],
    hoverOffset: 4
  }]
  };

  public lineChartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false
  };

  // Forzamos el tipo exacto
  public lineChartType: ChartType = 'doughnut';

  ngOnInit() { }
  ngOnDestroy() { }

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
