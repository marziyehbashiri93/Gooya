import { Component, OnInit, DoCheck, ElementRef, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { LoginVarService } from '../login-var.service';
import { PublicVarService } from 'src/application/shared/services/public-var.service';
import { HttpClient } from '@angular/common/http';

@Component({
 selector: 'app-signin',
 templateUrl: './signin.component.html',
 styleUrls: [ './signin.component.scss' ],
})
export class SigninComponent implements OnInit, DoCheck {
 signinForm: FormGroup;
 passwordShown: boolean = false;
 errorMessage: string = '';
 imageLabelText: string;
 isEmailPhoneUnique: boolean;
 valuelastName = '';
 valueFirstName = '';
 @ViewChild('imageLabel', { static: false })
 imageLabel: ElementRef;
 constructor(public loginVar: LoginVarService, public publicVar: PublicVarService, private httpClient: HttpClient) {}

 ngOnInit() {
  this.formValidator();
  if (this.publicVar.isPersian) {
   this.imageLabelText = 'عکس';
  } else {
   this.imageLabelText = 'Image';
  }
 }
 ngDoCheck() {
  if (this.signinForm.touched && this.signinForm.valueChanges) {
   this.formErrorMessage();
  }
 }

 showLogIn() {
  this.loginVar.isOpenSignin = false;
  this.resetForm();
 }
 showForgetPass() {
  this.loginVar.isOpenSignin = false;
  this.loginVar.isOpenLoginPage = false;
  this.loginVar.isOpenForgetPass = true;
  this.resetForm();
 }
 showVerificationCode() {
  this.loginVar.isOpenSignin = false;
  this.loginVar.isOpenLoginPage = false;
  this.loginVar.isOpenVerificationCode = true;
  this.resetForm();
 }

 // ---- for confrim email and repeat pass ----
 MatchValidatorPass(confirmInput: string) {
  let confirmControls: FormControl;
  let Controls: FormControl;

  return (control: FormControl) => {
   if (!control.parent) {
    return null;
   }

   if (!confirmControls) {
    confirmControls = control;
    Controls = control.parent.get(confirmInput) as FormControl;
    Controls.valueChanges.subscribe(() => {
     confirmControls.updateValueAndValidity();
    });
   }

   if (Controls.value !== confirmControls.value) {
    return {
     notMatch: true,
    };
   }
   return null;
  };
 }
 MatchValidatorEmail(confirmInput: string) {
  let confirmControls: FormControl;
  let Controls: FormControl;

  return (control: FormControl) => {
   if (!control.parent) {
    return null;
   }

   if (!confirmControls) {
    confirmControls = control;
    Controls = control.parent.get(confirmInput) as FormControl;
    Controls.valueChanges.subscribe(() => {
     confirmControls.updateValueAndValidity();
    });
   }
   if (Controls.value && confirmControls.value) {
    if (Controls.value.toLowerCase() !== confirmControls.value.toLowerCase()) {
     return {
      notMatch: true,
     };
    }
   }
   return null;
  };
 }
 // ---- get image size ----
 getImageFileDetails(fileEvent: any) {
  this.imageLabelText = fileEvent.target.value;
  console.log(fileEvent);
  const file = fileEvent.target.files[0];
  const size = file.size;
  if (size > 10000) {
   this.signinForm.controls['image'].setErrors({ image: true });
   this.errorMessage = 'حجم فایل ارسالی بیشتر از 10kb است.';
   this.imageLabel.nativeElement.className = 'ng-invalid';
  } else {
   this.imageLabel.nativeElement.removeAttribute('class');
   this.errorMessage = '';
  }
 }
 imageToBinary(inputElement) {
  const file = inputElement.files[0];
  let binary = null;
  const reader = new FileReader();
  reader.onloadend = () => {
   binary = reader.result;
  };
  reader.readAsDataURL(file);
  this.loginVar.userImage = binary;
 }

 formValidator() {
  this.signinForm = new FormGroup({
   firstName: new FormControl('', [
    Validators.pattern('[a-zA-Z]*[ا-ی]*'),
    Validators.minLength(3),
    Validators.required,
   ]),
   lastName: new FormControl('', [
    Validators.pattern('[a-zA-Z]*[ا-ی]*'),
    Validators.minLength(3),
    Validators.required,
   ]),
   email: new FormControl('', [ Validators.required, Validators.email ]),
   confirmEmail: new FormControl('', [ Validators.required, Validators.email, this.MatchValidatorEmail('email') ]),
   phone: new FormControl('', [
    Validators.pattern('0{1}9{1}[0-9]{9}'),
    Validators.required,
    Validators.maxLength(11),
    Validators.minLength(11),
   ]),
   // { value: '' , disabled: true}
   image: new FormControl({ value: '' , disabled: true}),
   password: new FormControl('', [ Validators.required, Validators.minLength(6) ]),
   confirmPassword: new FormControl('', [ this.MatchValidatorPass('password'), Validators.required ]),
   noRobat: new FormControl(false, Validators.requiredTrue),
  });
 }
 // ---- valid form Massage Error----
 formErrorMessage() {
  const form = this.signinForm;
  if (this.publicVar.isPersian) {
   if (form.controls.firstName.invalid && form.controls.firstName.touched) {
    if (form.controls['firstName'].getError('minlength')) {
     this.errorMessage = 'نام باید حداقل 3 کاراکتر باشد.';
    } else if (form.controls['firstName'].getError('pattern')) {
     this.errorMessage = 'نام باید حروف باشد.';
    }
   } else if (form.controls.lastName.invalid && form.controls.lastName.touched) {
    if (form.controls.lastName.getError('minlength')) {
     this.errorMessage = 'نام خانوادگی باید حداقل 3 کاراکتر باشد.';
    } else if (form.controls.lastName.getError('pattern')) {
     this.errorMessage = 'نام خانوادگی باید حروف باشد.';
    }
   } else if (form.controls.email.invalid && form.controls.email.touched) {
    if (form.controls.email.getError('required')) {
     this.errorMessage = 'واردکردن ایمیل الزامی است .';
    } else {
     this.errorMessage = 'ایمیل نامعتبر است .';
    }
   } else if (form.controls.confirmEmail.invalid && form.controls.confirmEmail.touched) {
    if (form.controls.confirmEmail.getError('required')) {
     this.errorMessage = 'واردکردن تکرار ایمیل الزامی است .';
    } else if (form.controls.confirmEmail.getError('notMatch')) {
     this.errorMessage = 'ایمیل و تکرار آن یکسان نمی باشد.';
    } else {
     this.errorMessage = 'تکرار ایمیل نامعتبر است .';
    }
   } else if (form.controls.phone.invalid && form.controls.phone.touched) {
    if (form.controls.phone.getError('required')) {
     this.errorMessage = 'واردکردن شماره همراه الزامی است .';
    } else {
     this.errorMessage = 'شماره همراه نامعتبر است .';
    }
   } else if (form.controls.image.invalid && form.controls.image.touched) {
    this.errorMessage = 'حجم عکس ارسالی بیش از 10 کیلوبایت است .';
   } else if (form.controls.password.invalid && form.controls.password.touched) {
    if (form.controls.password.getError('required')) {
     this.errorMessage = 'وارد کردن رمز عبور الزامی است .';
    } else if (form.controls.password.getError('minlength')) {
     this.errorMessage = 'رمزعبور باید حداقل 6 کاراکتر باشد.';
    }
   } else if (form.controls.confirmPassword.invalid && form.controls.confirmPassword.touched) {
    if (form.controls.confirmPassword.getError('required')) {
     this.errorMessage = 'وارد کردن تکرار رمزعبور الزامی است . ';
    } else if (form.controls.confirmPassword.getError('notMatch')) {
     this.errorMessage = 'رمزعبور و تکرار آن  یکسان نمی باشد.';
    }
   } else {
    this.errorMessage = '';
   }
  } else {
   if (form.controls.firstName.invalid && form.controls.firstName.touched) {
    if (form.controls['firstName'].getError('minlength')) {
     this.errorMessage = 'First name must be at least 3 characters long';
    } else if (form.controls['firstName'].getError('pattern')) {
     this.errorMessage = 'The first name must contain letter only';
    }
   } else if (form.controls.lastName.invalid && form.controls.lastName.touched) {
    if (form.controls.lastName.getError('minlength')) {
     this.errorMessage = 'Last name must be at least 3 characters long';
    } else if (form.controls.lastName.getError('pattern')) {
     this.errorMessage = 'The last name must contain letter only';
    }
   } else if (form.controls.email.invalid && form.controls.email.touched) {
    if (form.controls.email.getError('required')) {
     this.errorMessage = 'Email is required';
    } else {
     this.errorMessage = 'Invalid email address';
    }
   } else if (form.controls.confirmEmail.invalid && form.controls.confirmEmail.touched) {
    if (form.controls.confirmEmail.getError('required')) {
     this.errorMessage = 'Confirm email is required';
    } else if (form.controls.confirmEmail.getError('notMatch')) {
     this.errorMessage = "Email confirmation doesn't match email";
    } else {
     this.errorMessage = 'Invalid confirm email';
    }
   } else if (form.controls.phone.invalid && form.controls.phone.touched) {
    if (form.controls.phone.getError('required')) {
     this.errorMessage = 'Mobile is required';
    } else {
     this.errorMessage = 'Invalid Mobile number';
    }
   } else if (form.controls.image.invalid && form.controls.image.touched) {
    this.errorMessage = 'Image size must be less than 10KB';
   } else if (form.controls.password.invalid && form.controls.password.touched) {
    if (form.controls.password.getError('required')) {
     this.errorMessage = 'Password is required';
    } else if (form.controls.password.getError('minlength')) {
     this.errorMessage = 'Password must be at least 6 characters long.';
    }
   } else if (form.controls.confirmPassword.invalid && form.controls.confirmPassword.touched) {
    if (form.controls.confirmPassword.getError('required')) {
     this.errorMessage = 'Invalid confirm password';
    } else if (form.controls.confirmPassword.getError('notMatch')) {
     this.errorMessage = "Password confirmation doesn't match password";
    }
   } else {
    this.errorMessage = '';
   }
  }

  // ---- valid form ----
 }

 checkEmailPhoneUnique() {
  console.log('change');
  if (
   this.signinForm.value.phone &&
   this.signinForm.value.email &&
   this.signinForm.controls.email.valid &&
   this.signinForm.controls.phone.valid
  ) {
   const URL =
    this.publicVar.baseUrl +
    ':' +
    this.publicVar.portApi +
    '/api/user/CheckEmailUnique?Mobileno=' +
    this.signinForm.value.phone +
    '&Emailadd=' +
    this.signinForm.value.email;
   console.log(URL);
   this.httpClient.get(URL).toPromise().then((response) => {
    console.log(response);
    if (response === 0) {
     this.isEmailPhoneUnique = true;
    } else {
     this.isEmailPhoneUnique = false;
    }
   });
  }
  setTimeout(() => {
   console.log(' this.isEmailPhoneUnique', this.isEmailPhoneUnique);
  }, 300);
 }
 onSubmitSignin() {
  let compIP;
  if (this.publicVar.ipAddress.ip) {
   compIP = this.publicVar.ipAddress.ip;
  } else {
   compIP = '';
  }
  const URL =
   this.publicVar.baseUrl +
   ':' +
   this.publicVar.portApi +
   '/api/user/SendUserCode?MobileNo=' +
   this.signinForm.value.phone;
  this.httpClient.post(URL, {}).toPromise().then((codeResponse) => {
   console.log(codeResponse);
   if (codeResponse) {
    this.showVerificationCode();
    this.resetForm();
   } else {
    if (this.publicVar.isPersian) {
     this.errorMessage = 'امکان ارسال پیامک وجود ندارد ،دوباره تلاش کنید.';
    } else {
     this.errorMessage = "Unable to send SMS,try again";
    }
   }
  });
  this.loginVar.signInValue = {
   firstName: this.signinForm.value.firstName ? this.signinForm.value.firstName : '',
   lastname: this.signinForm.value.lastName ? this.signinForm.value.lastName : '',
   emailadd: this.signinForm.value.email,
   mobileno: this.signinForm.value.phone,
   userpassword: this.signinForm.value.password,
   computerip: compIP,
   os: this.publicVar.deviceInfo.os,
   SMSCode: null,
  };
 }
 resetForm() {
  this.signinForm.reset();
  this.errorMessage = '';
  this.passwordShown = false;
  // ---- image reset ----
  this.imageLabelText = 'عکس';
  this.imageLabel.nativeElement.removeAttribute('class');
 }

 // ----prevent defaul paste in reapeat pass and email ----
 noPaste(htmlElemen: HTMLInputElement) {
  htmlElemen.addEventListener('paste', (e) => {
   e.preventDefault();
   return false;
  });
 }
}
