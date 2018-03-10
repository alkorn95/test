import { Component, OnInit, Input, AfterViewInit } from '@angular/core';
import { User } from '../user'
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../auth.service';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { UserService } from '../user.service'
import { element } from 'protractor';
import { DomSanitizer } from '@angular/platform-browser';
@Component({
  selector: 'app-personal',
  templateUrl: './personal.component.html',
  styleUrls: ['./personal.component.css']
})

export class PersonalComponent implements OnInit {
  @Input() user: User;
  isEdit: boolean;
  readonly: boolean;
  name: string;
  isAdmin: boolean;
  role: string = "Admin";
  curators: User[];
  file: File;

  constructor(private router: Router,
    private route: ActivatedRoute,
    private userService: UserService,
    private location: Location,
    private authService: AuthService,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit() {
    if (localStorage.getItem('IsEdit') == '1') {
      this.getUser();
      this.isEdit = true;
      this.readonly = false;
      if (localStorage.getItem('id') != localStorage.getItem('SelectedUser') && localStorage.getItem('role') != '0')
        this.readonly = true;
    }
    else {
      this.user = new User();
      this.isEdit = false;
      this.getCurators();
    }
    this.name = localStorage.getItem('name');
    this.isAdmin = false;
    if (localStorage.getItem('role') == '0')
      this.isAdmin = true;
  }

  goBack(): void {
    this.location.back();
  }

  setCuratorID(): void {
    for (var i = 0; i < this.curators.length; i++) {
      if (this.user.curatorName == this.curators[i].name) {
        this.user.curatorID = this.curators[i]._id;
        break;
      }
    }
  }
  setCuratorName(): void {
    for (var i = 0; i < this.curators.length; i++) {
      if (this.user.curatorID == this.curators[i]._id) {
        this.user.curatorName = this.curators[i].name;
        break;
      }
    }
  }

  save(): void {
    switch (this.role) {
      case "Admin": this.user.role = 0; break;
      case "Curator": this.user.role = 1; break;
      case "FT": this.user.role = 2; this.setCuratorID(); break;
    }
    this.userService.updateUser(this.user)
      .subscribe((res) => {
        if (res.status == 201)
          this.goBack();
        else
          alert("User already exists");
      });
  }

  create(): void {
    switch (this.role) {
      case "Admin": this.user.role = 0; break;
      case "Curator": this.user.role = 1; break;
      case "FT": this.user.role = 2; this.setCuratorID(); break;
    }
    this.userService.addUser(this.user)
      .subscribe((res) => {
        if (res.status == 201)
          this.goBack();
        else
          alert("User already exists");
      });
  }

  getUser(): void {
    this.userService.getUser().subscribe(user => {
    this.user = user
      switch (this.user.role) {
        case 0: this.role = "Admin"; break;
        case 1: this.role = "Curator"; break;
        case 2: this.role = "FT"; break;
      }
      this.getCurators();
      this.getImage();

    });
  }

  getCurators(): void {
    this.userService.getCurators().subscribe(users => {
      this.curators = users;
      this.setCuratorName();
    });
  }

  accountInfo(): void {
    localStorage.setItem('SelectedUser', localStorage.getItem('id'));
    this.getUser();
    this.isEdit = true;
    this.readonly = false;

  }

  newUser(): void {
    this.user = new User();
    this.isEdit = false;
    this.role = "Admin";
    this.getCurators();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  onFileChange(f) {
    this.file = f;
    this.getBase64(f).then(
      data => {
        this.user.photo = String(data);
        if (this.isEdit)
          this.userService.addPhoto(this.user).subscribe((res) => { this.getImage(); });
      }
    );
  }
  getBase64(file) {
    return new Promise((res) => {
      var reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => res(reader.result);
    });


  }
  getImage() {
    this.userService.getImg(localStorage.getItem('SelectedUser'), true).subscribe(data => {
      var blobURL = URL.createObjectURL(data);
      this.user.URL = this.sanitizer.bypassSecurityTrustUrl(blobURL);
    }, error => {
      console.log(error);
    });
  }
}
