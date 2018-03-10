import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import { User } from './user'
import { HttpHeaders, HttpClient, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import 'rxjs/add/operator/map';
import * as decode from 'jwt-decode';
import { api } from './api';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable()
export class AuthService {
  public token: string;
  constructor(private http: HttpClient) { }


  private loginUrl = api + 'login';
  private registerUrl = api + 'register';

  login(name: string, password: string) {
    return this.http.post(this.loginUrl, JSON.stringify({ name: name, password: password }), httpOptions)
      .map(result => {
        let token = result['token'];
        localStorage.setItem('token', token);
        localStorage.setItem('name', decode(token).name);
        localStorage.setItem('role', decode(token).role);
        localStorage.setItem('id', decode(token).id);
      }
      );
  }

  register(name: string, password: string) {
    return this.http.post(this.registerUrl, JSON.stringify({ name: name, password: password }), {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
      observe: "response"
    });
  }

  logout(): void {
    localStorage.removeItem('token');
  }
}

