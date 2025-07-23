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
    // Fetch the env.js file with cache-busting timestamp
    const timestamp = new Date().getTime();
    const envUrl = `/assets/env.js?t=${timestamp}`;
    
    this.http.get(envUrl, { responseType: 'text' }).subscribe({
      next: (envFileContent) => {
        const newConfig = this.parseEnvFile(envFileContent);
        
        if (this.hasConfigChanged(newConfig)) {
          console.log('Config changed! Reloading...');
          window.location.reload();
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