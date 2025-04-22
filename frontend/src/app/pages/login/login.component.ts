import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  username = '';

  constructor(private router: Router) {}

  login() {
    if (this.username.trim()) {
      localStorage.setItem('username', this.username.trim());
      this.router.navigate(['/chat']);
    }
  }
}
