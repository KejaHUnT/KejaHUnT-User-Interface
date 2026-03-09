import { Component, Input } from '@angular/core';
import { Property } from '../../models/property.model';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.css']
})
export class OverviewComponent {

  @Input() property!: Property;

}