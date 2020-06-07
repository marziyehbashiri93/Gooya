import { Component, OnInit } from '@angular/core';
import { PublicVarService } from 'src/application/shared/services/public-var.service';
import { LoginVarService } from '../login/login-var.service';
import { LoginComponent } from '../login/login.component';
import { fadeAnimation } from 'src/application/shared/animation/fadeAnimation';

@Component({
 selector: 'app-popup-success',
 templateUrl: './popup-success.component.html',
 styleUrls: [ './popup-success.component.scss' ],
 providers: [ LoginComponent ],
 animations: [ fadeAnimation ],
})
export class PopupSuccessComponent implements OnInit {
 constructor(public publicVar: PublicVarService, public loginVar: LoginVarService, public loginComp: LoginComponent) {}

 ngOnInit() {}

 closePopupSucces() {
  // ----use set time uot for animation fade out ----
  this.publicVar.isOpenPopupSuccess = false;
  if (this.publicVar.isOpenReportError) {
   this.publicVar.isOpenReportError = false;
  } else if (this.publicVar.isOpenMissingPlace) {
   this.publicVar.isOpenMissingPlace = false;
  } else if (this.loginVar.SuccessReportChangePass) {
   this.loginComp.closeLogin();
  }
 }
}
