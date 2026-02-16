import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-card-summary',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './card-summary.component.html',
  styleUrls: ['./card-summary.component.scss']
})
export class CardSummaryComponent {
  @Input({ required: true }) link!: string;
  @Input({ required: true }) iconSrc!: string;
  @Input({ required: true }) title!: string;

}
