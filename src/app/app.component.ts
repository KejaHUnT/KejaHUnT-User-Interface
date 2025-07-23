import { Component, OnInit } from '@angular/core';
import { ConfigService } from './services/config.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'KejaHUnT';

  constructor(private configService: ConfigService) {}

  ngOnInit() {
    // Start monitoring config changes when app loads
    this.configService.startConfigMonitoring();
  }
}