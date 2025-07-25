import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private currentConfig: any = null;

  constructor(private http: HttpClient) {}

  startConfigMonitoring() {
    // Store initial config
    this.currentConfig = { ...window._env };
    
    // Check every 30 seconds
    setInterval(() => {
      this.checkForConfigChanges();
    }, 30000);
  }

  private checkForConfigChanges() {
    // Multiple cache-busting strategies
    const timestamp = new Date().getTime();
    const random = Math.random().toString(36).substring(7);
    const envUrl = `/assets/env-v2.js?t=${timestamp}&r=${random}&cb=${Date.now()}`;
    
    this.http.get(envUrl, { 
      responseType: 'text',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0',
        'If-Modified-Since': 'Mon, 26 Jul 1997 05:00:00 GMT'
      }
    }).subscribe({
      next: (envFileContent) => {
        const newConfig = this.parseEnvFile(envFileContent);
        
        if (this.hasConfigChanged(newConfig)) {
          console.log('Config changed! Updating...');
          // Update the config without reloading the page
          window._env = { ...newConfig };
          this.currentConfig = { ...newConfig };
        }
      },
      error: (err) => {
        console.error('Failed to check config:', err);
      }
    });
  }

  private parseEnvFile(content: string): any {
    // Extract env values from the JavaScript file content
    const config: any = {};
    const regex = /window\._env\.(\w+)\s*=\s*'([^']*)'/g;
    let match;
    
    while ((match = regex.exec(content)) !== null) {
      config[match[1]] = match[2];
    }
    
    return config;
  }

  private hasConfigChanged(newConfig: any): boolean {
    return JSON.stringify(newConfig) !== JSON.stringify(this.currentConfig);
  }
}