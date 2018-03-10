import { Component, OnInit, Input } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  @Input() name: string;
  @Input() password: string;
  constructor(private router: Router,
    private authService: AuthService) { }

  ngOnInit() {

  }
  login(): void {
    this.authService.login(this.name, this.password)
      .subscribe(result => {
        this.router.navigate(['/users']);
      },
        err => {
          alert("Incorrect login or password");
        });
  }

  register(): void {
    this.authService.register(this.name, this.password)
      .subscribe(result => {
        if (result.status == 201)
          this.authService.login(this.name, this.password)
            .subscribe(result => {
              this.router.navigate(['/users']);
            },
              err => { });
        else {
          alert("User already exists");
        }
      },
        err => { });
  }
}
