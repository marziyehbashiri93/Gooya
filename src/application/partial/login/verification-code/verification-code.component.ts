import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { LoginVarService } from '../login-var.service';
import { PublicVarService } from 'src/application/shared/services/public-var.service';
import { HttpClient } from '@angular/common/http';
import { LoginComponent } from '../login.component';
import { LoginPageComponent } from '../login-page/login-page.component';

@Component({
 selector: 'app-verification-code',
 templateUrl: './verification-code.component.html',
 styleUrls: [ './verification-code.component.scss' ],
})
export class VerificationCodeComponent implements OnInit {
 verificationCode: FormGroup;
 errorMessage: string = '';
 constructor(
  public loginVar: LoginVarService,
  public publicVar: PublicVarService,
  private httpClient: HttpClient,
  public LoginComp: LoginComponent,
  public LoginPageComp: LoginPageComponent,
 ) {}

 ngOnInit() {
  this.verificationCode = new FormGroup({
   verify: new FormControl('', [
    Validators.pattern('[0-9]{4}'),
    Validators.minLength(4),
    Validators.maxLength(4),
    Validators.required,
   ]),
  });
 }
 onSubmitPass() {
  this.loginVar.signInValue.SMSCode = parseInt(this.verificationCode.value.verify);
  // http://ServerIP:Port/api/user/SaveUserNoImage
  const URL = this.publicVar.baseUrl + ':' + this.publicVar.portApi + '/api/user/SaveUserNoImage';
  const body = this.loginVar.signInValue;
  console.log(URL);
  console.log(body);
  this.httpClient.post(URL, body).toPromise().then((saveUserResponse) => {
   console.log(saveUserResponse);
   console.log(typeof saveUserResponse);
   if (saveUserResponse === 1) {
    console.log('goood');
    this.LoginComp.closeLogin();
    // this.publicVar.isauthenticate = true;

    //
    this.LoginPageComp.onSubmitLogin(this.loginVar.signInValue.emailadd, this.loginVar.signInValue.userpassword);
   } else if (saveUserResponse === -1) {
    if (this.publicVar.isPersian) {
     this.errorMessage = 'ایمیل یا شماره وارد شده وجود دارد.';
    } else {
     this.errorMessage = "Email or phone number dosn't exist.";
    }
   } else if (saveUserResponse === -2) {
    if (this.publicVar.isPersian) {
     this.errorMessage = 'کد ارسالی نامعتبر است.';
    } else {
     this.errorMessage = 'Invalid code';
    }
   } else {
    if (this.publicVar.isPersian) {
     this.errorMessage = 'دوباره تلاش کنید.';
    } else {
     this.errorMessage = 'Try again';
    }
   }
  });
 }
}
