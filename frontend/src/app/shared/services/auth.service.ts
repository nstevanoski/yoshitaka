import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { HttpService } from './http.service';
import { HttpClient } from '@angular/common/http';
import { environment } from 'environments/environment';

@Injectable()
export class AuthService {
  token?: any;

  constructor(
    private _router: Router,
    private http: HttpClient
  ) { }

  signinUser(form: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}/api/auth/login`, form).pipe(
      tap((res: any) => {
        if (res.accessToken) {
          localStorage.setItem('token', res.accessToken);
          localStorage.setItem('user', JSON.stringify(res))
          return res.data;
        }
      })
    );
  }
  
  logoutUser(): Promise<any> {
    return this.http.post<any>(`${environment.apiUrl}/logout`, {}).toPromise();
  }

  isLoggedIn(): boolean {
    const isLoggedIn = localStorage.getItem('token');
    return isLoggedIn ? true : false;
  }

  logout(): void {
    if (this.isLoggedIn()) {
      localStorage.removeItem('token');
      this._router.navigate(['/auth/login']);
    }
    localStorage.removeItem('token');
    this.token = null;
  }

  decode_utf8 = (s: any) => { return decodeURIComponent(escape(s)) }

  getToken(): any {
    return localStorage.getItem('token');
  }

  getUser(): any {
    if (localStorage.getItem('user')) {
      return JSON.parse(localStorage.getItem('user'));
    }
  }

  isAuthenticated() {
    if (localStorage.getItem('token')) {
      return true;
    }
    this._router.navigate(['/auth/login']);
    return false;
  }

  _errorHandler(error: Response) {
    console.log(error);
  }
}
