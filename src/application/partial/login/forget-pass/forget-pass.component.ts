import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { LoginVarService } from '../login-var.service';
import { PublicVarService } from 'src/application/shared/services/public-var.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-forget-pass',
  templateUrl: './forget-pass.component.html',
  styleUrls: ['./forget-pass.component.scss']
})
export class ForgetPassComponent implements OnInit {
  // @ViewChild('forgetPassword', { static: false }) forgetPassword: NgForm;
  forgetPassword: FormGroup;
  errorMessage;
  constructor(
   public loginVar: LoginVarService,
   public publicVar: PublicVarService,
   private httpClient: HttpClient,
  ) {}
  ngOnInit() {
   this.forgetPassword = new FormGroup({
    emailPhoneInput: new FormControl('', [
     Validators.required,
     Validators.pattern(
      '^(0{1}9{1}[0-9]{9})|([A-Za-z0-9._%+-]+@[a-z0-9.-]+[.]+[a-z]{2,3})$'
     ),
    ]),
    noRobat: new FormControl(false, Validators.requiredTrue),
   });
  }
  onSubmitPass() {
   const URL =
    this.publicVar.baseUrl +
    ':' +
    this.publicVar.portApi +
    '/api/user/ResetPassword?UserName=' +
    this.forgetPassword.value.emailPhoneInput;
   this.httpClient.get(URL).toPromise().then((response) => {
    console.log(response);
    if (response === 'Your new password sent to you email address') {
     console.log('goood');
     this.forgetPassword.reset();
     this.errorMessage = null;
     this.loginVar.SuccessReportChangePass = true;

     this.publicVar.isOpenPopupSuccess = true;
    } else {
     console.log('bad');
     this.errorMessage = 'ایمیل وارد شده معتبر نمی باشد.';
     this.forgetPassword.reset();
    }
   });
   // this.forgetPassword.reset();
  }
  showLogIn() {
   this.forgetPassword.reset();
   this.loginVar.isOpenLoginPage = true;
   this.loginVar.isOpenForgetPass = false;
  }
  showSignIn() {
   this.showLogIn();
   this.loginVar.isOpenSignin = true;
  }
 }
