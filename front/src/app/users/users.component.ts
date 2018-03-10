import { Component, OnInit } from '@angular/core';
import { User } from '../user';
import { UserService } from '../user.service';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {
  users: User[];
  isAdmin: boolean;
  name: string;
  constructor(
    private router: Router,
    private userService: UserService,
    private authService: AuthService,
    private sanitizer: DomSanitizer) { }

  ngOnInit() {
    this.getUsers();
    localStorage.removeItem('SelectedUser');
    this.isAdmin = false;
    if (localStorage.getItem('role') == '0')
      this.isAdmin = true;
    this.name = localStorage.getItem('name');
  }

  getUsers(): void {
    this.userService.getUsers().subscribe(users => {
    this.users = users;
      for (var i = 0; i < users.length; i++)
        this.getImage(i);
    });
  }
  getImage(i) {
    this.userService.getImg(this.users[i]._id, false).subscribe(data => {
      var blobURL = URL.createObjectURL(data);
      this.users[i].URL = this.sanitizer.bypassSecurityTrustUrl(blobURL);
    }, error => { });
  }
  deleteUser(_id: string): void {
    if (window.confirm("Delete?"))
      this.userService.deleteUser(_id).subscribe(() => {
        this.getUsers();
      });
  }

  newUser(): void {
    localStorage.setItem('IsEdit', '0');
    this.router.navigate(['/personal']);
  }

  Select(_id: string): void {
    localStorage.setItem('IsEdit', '1');
    localStorage.setItem('SelectedUser', _id);
  }

  accountInfo(): void {
    localStorage.setItem('IsEdit', '1');
    localStorage.setItem('SelectedUser', localStorage.getItem('id'));
    this.router.navigate(['/personal']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}