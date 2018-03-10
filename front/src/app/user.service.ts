import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { User } from './user'
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { api } from './api';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable()
export class UserService {

  constructor(private http: HttpClient) { }

  private photoUrl = api + 'image';
  private usersUrl = api + 'users';
  private curatorsUrl = api + 'curators';

  getUsers(): Observable<User[]> {
    const authHeader = {
      headers: new HttpHeaders({ 'Authorization': 'jwt ' + localStorage.getItem('token') })
    }
    return this.http.get<User[]>(this.usersUrl, authHeader);
  }

  getCurators(): Observable<User[]> {
    const authHeader = {
      headers: new HttpHeaders({ 'Authorization': 'jwt ' + localStorage.getItem('token') })
    }
    return this.http.get<User[]>(this.curatorsUrl, authHeader);
  }

  updateUser(user: User) {
    return this.http.put(this.usersUrl, user, {
      headers: new HttpHeaders({ 'Authorization': 'jwt ' + localStorage.getItem('token') }),
      observe: "response"
    });
  }

  addUser(user: User) {
    return this.http.post(this.usersUrl, user, {
      headers: new HttpHeaders({ 'Authorization': 'jwt ' + localStorage.getItem('token') }),
      observe: "response"
    });
  }

  getImg(id, isBig): Observable<Blob> {
    var s;
    if (isBig == true)
      s = '1';
    else
      s = '0';
    return this.http.get(this.photoUrl + "/" + id + '&' + s, {
      headers: new HttpHeaders({ 'Authorization': 'jwt ' + localStorage.getItem('token') }),
      responseType: "blob"
    });
  }

  addPhoto(user: User) {
    const authHeader = {
      headers: new HttpHeaders({ 'Authorization': 'jwt ' + localStorage.getItem('token') })
    }
    return this.http.post(this.photoUrl, user, authHeader)
      .map((res, err) => {
        if (err) return err;
        return res
      });
  }

  getUser(): Observable<User> {
    const authHeader = {
      headers: new HttpHeaders({ 'Authorization': 'jwt ' + localStorage.getItem('token') })
    }
    return this.http.get<User>(this.usersUrl + "/" + localStorage.getItem('SelectedUser'), authHeader);
  }

  deleteUser(_id: string): Observable<User> {
    const authHeader = {
      headers: new HttpHeaders({ 'Authorization': 'jwt ' + localStorage.getItem('token') })
    }
    return this.http.delete<User>(this.usersUrl + "/" + _id, authHeader);
  }

}
