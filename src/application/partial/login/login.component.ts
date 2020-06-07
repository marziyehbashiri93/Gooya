import { animate, style, transition, trigger } from '@angular/animations';
import { Component, OnInit, ViewChild, Inject, PLATFORM_ID } from '@angular/core';
import { MeasureComponent } from 'src/application/map-view/controller/measure/measure.component';
import { LoginInfo } from 'src/application/shared/interface/login-info';
import { PublicVarService } from 'src/application/shared/services/public-var.service';
import { LoginPageComponent } from './login-page/login-page.component';
import { LoginVarService } from './login-var.service';
import { fadeAnimation } from 'src/application/shared/animation/fadeAnimation';
import { isPlatformBrowser } from '@angular/common';
@Component({
 selector: 'app-login',
 templateUrl: './login.component.html',
 styleUrls: [ './login.component.scss' ],
 animations: [
  fadeAnimation,
  trigger('openCloseInfo', [
   transition(':enter', [
    style({ width: '0px' }),
    animate(
     '400ms',
     style({
      width: '*',
     })
    ),
   ]),
   transition(':leave', [ style({ width: '*' }), animate('400ms', style({ width: '0px' })) ]),
  ]),
 ],
})
export class LoginComponent implements OnInit {
 @ViewChild(LoginPageComponent, { static: false })
 LoginPage: LoginPageComponent;
 userName = '';
 isOpenUserInfo = false;
 constructor(
  public publicVar: PublicVarService,
  public loginVar: LoginVarService,
  public measure: MeasureComponent
 ) {
  this.haveLoginData();
 }

 ngOnInit() {}
 haveLoginData() {
  if (localStorage.getItem('login') !== null) {
   let loginDeta: LoginInfo;
   loginDeta = JSON.parse(localStorage.getItem('login').toString());

   console.log('has loginDeta');
   console.log(loginDeta);
   this.publicVar.isauthenticate = true;
   this.loginVar.loginValue = loginDeta;
  }
 }
 openLogin() {
  this.publicVar.isOpenPopupAttribute = false;
  this.publicVar.isOpenLogin = true;
  // close other element
  this.publicVar.isOpenDirection = false;
  this.publicVar.isOpenPlaces = false;
  this.publicVar.isOpenCoordinate = false;
  this.publicVar.isOpenStreet = false;
  this.publicVar.isOpenPoi = false;
  this.publicVar.isOpenIntersect = false;
  this.publicVar.isOpenMoreSearch = false;
  this.loginVar.isOpenChangePassword = false;
  this.loginVar.SuccessReportChangePass = false;
  if (this.publicVar.isOpenMeasure) {
   this.measure.openMeasure();
  }
 }
 closeLogin() {
  this.publicVar.isOpenLogin = false;
  this.loginVar.SuccessReportChangePass = false;
  setTimeout(() => {
   this.loginVar.isOpenLoginPage = true;
   this.loginVar.isOpenForgetPass = false;
   this.loginVar.isOpenVerificationCode = false;
   this.loginVar.isOpenSignin = false;
  }, 500);
 }
 openUserInfo() {
  this.publicVar.isOpenPopupAttribute = false;
  if (!this.isOpenUserInfo) {
   this.isOpenUserInfo = true;
   if (this.loginVar.loginValue) {
    this.loginVar.loginNameandlastName = this.loginVar.loginValue.FirstName + ' ' + this.loginVar.loginValue.LastName;
   } else {
    // baraye zamani k sabtenam mikonad va vared mishavad
    this.loginVar.loginNameandlastName = this.loginVar.signInValue.firstName + ' ' + this.loginVar.signInValue.lastname;
   }
  } else {
   this.isOpenUserInfo = false;
   this.loginVar.loginNameandlastName = '';
  }
 }
 exit() {
  this.publicVar.isOpenPopupAttribute = false;
  this.publicVar.isauthenticate = false;
  this.loginVar.loginValue = null;
  this.isOpenUserInfo = false;
  localStorage.removeItem('login');
 }

 openChangePassword() {
  this.publicVar.isOpenPopupAttribute = false;
  this.publicVar.isOpenLogin = true;
  this.loginVar.isOpenLoginPage = false;
  this.loginVar.isOpenChangePassword = true;
 }
}
