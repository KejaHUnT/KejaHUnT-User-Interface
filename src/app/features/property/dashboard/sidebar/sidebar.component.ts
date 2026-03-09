import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Property } from '../../models/property.model';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {

  @Input() property!: Property;
  @Input() isOpen = false;   

  @Output() tabSelected = new EventEmitter<string>();

  selectedTab: string = 'overview';

  selectTab(tab: string) {
    this.selectedTab = tab;
    this.tabSelected.emit(tab);
  }
}