import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AppComponent } from './app.component';
import { UsersComponent } from './users/users.component';
import { PersonalComponent } from './personal/personal.component'
import { UserService } from './user.service';
import { AuthService } from './auth.service';
import { AppRoutingModule } from './app-routing.module';
import { LoginComponent } from './login/login.component';
import { AuthGuard } from './auth.guard';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { ModalModule } from 'ngx-bootstrap/modal';

@NgModule({
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    AppRoutingModule,
    BsDropdownModule.forRoot(),
    TooltipModule.forRoot(),
    ModalModule.forRoot()],
  declarations: [
    AppComponent,
    UsersComponent,
    PersonalComponent,
    LoginComponent],
  providers: [
    UserService,
    AuthService,
    AuthGuard],
  bootstrap: [AppComponent]
})
export class AppModule { }

