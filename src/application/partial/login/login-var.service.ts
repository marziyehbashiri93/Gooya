import { Injectable } from '@angular/core';
import { SignInInfo } from 'src/application/shared/interface/sign-in-info';
import { LoginInfo } from 'src/application/shared/interface/login-info';

@Injectable({
  providedIn: 'root'
})
export class LoginVarService {

  constructor() { }
  isOpenLoginPage = true;
  isOpenSignin = false;
  isOpenForgetPass = false;
  isOpenVerificationCode = false;
  isOpenChangePassword = false;
  SuccessReportChangePass = false;
  userImage: string;
  signInValue: SignInInfo;
  loginValue: LoginInfo;
  loginNameandlastName: string;
}
