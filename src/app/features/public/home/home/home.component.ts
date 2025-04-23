import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Property } from 'src/app/features/property/models/property.model';
import { PropertyService } from 'src/app/features/property/services/property.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  Property$?: Observable<Property[]>;

  constructor(private propertyService: PropertyService) {

  }
  ngOnInit(): void {
    this.Property$ = this.propertyService.getAllProperties();
  }

}
