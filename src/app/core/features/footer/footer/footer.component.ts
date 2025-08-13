import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent {

  email: string = '';
  currentYear: number = new Date().getFullYear();

  subscribeNewsletter() {
    if (this.email) {
      console.log(`Subscribed: ${this.email}`);
      alert('Thanks for subscribing!');
      this.email = '';
    }
  }
}
