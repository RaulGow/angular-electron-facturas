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
    labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo'],
    datasets: [
      {
        data: [65, 59, 80, 81, 56],
        label: 'Ventas 2026',
        borderColor: '#42A5F5',
        backgroundColor: 'rgba(66, 165, 245, 0.2)',
        fill: 'origin',
      }
    ]
  };

  public lineChartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false
  };

  // Forzamos el tipo exacto
  public lineChartType: ChartType = 'line';

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
