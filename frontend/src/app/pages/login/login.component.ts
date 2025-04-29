import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpErrorResponse, HttpClientModule } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  username = '';
  password = '';
  errorMessage = '';
  successMessage = '';

  constructor(private router: Router, private http: HttpClient) {}

  login() {
    this.clearMessages();
    const trimmedUsername = this.username.trim();
    const trimmedPassword = this.password.trim();

    if (!trimmedUsername || !trimmedPassword) {
      this.errorMessage = 'Username and password are required.';
      return;
    }

    this.http.post('http://localhost:8000/login', {
      username: trimmedUsername,
      password: trimmedPassword
    }).pipe(
      catchError((error: HttpErrorResponse) => {
        this.errorMessage = error.error.detail || 'Login failed';
        return of(null);
      })
    ).subscribe((response: any) => {
      if (response) {
        localStorage.setItem('username', trimmedUsername);
        this.router.navigate(['/chat']);
      }
    });
  }

  register() {
    this.clearMessages();
    const trimmedUsername = this.username.trim();
    const trimmedPassword = this.password.trim();

    if (!trimmedUsername || !trimmedPassword) {
      this.errorMessage = 'Username and password are required.';
      return;
    }

    this.http.post('http://localhost:8000/register', {
      username: trimmedUsername,
      password: trimmedPassword
    }).pipe(
      catchError((error: HttpErrorResponse) => {
        this.errorMessage = error.error.detail || 'Registration failed';
        return of(null);
      })
    ).subscribe((response: any) => {
      if (response) {
        this.successMessage = 'Registration successful! You can now log in.';
      }
    });
  }

  private clearMessages() {
    this.errorMessage = '';
    this.successMessage = '';
  }
}
