import { Component, OnInit } from '@angular/core';
import { LoginComponent } from '../login/login.component';
import { fadeAnimation } from 'src/application/shared/animation/fadeAnimation';
import { PublicVarService } from 'src/application/shared/services/public-var.service';
import { LoginVarService } from '../login/login-var.service';

@Component({
 selector: 'app-popup-error',
 templateUrl: './popup-error.component.html',
 styleUrls: [ './popup-error.component.scss' ],
 providers: [ LoginComponent ],
 animations: [ fadeAnimation ],
})
export class PopupErrorComponent implements OnInit {
 constructor(public publicVar: PublicVarService, public loginVar: LoginVarService, public loginComp: LoginComponent) {}

 ngOnInit() {}
 closePopupSucces() {
  // ----use set time uot for animation fade out ----
  this.publicVar.isOpenPopupError = false;
  if (this.publicVar.isOpenReportError) {
   this.publicVar.isOpenReportError = false;
  } else if (this.publicVar.isOpenMissingPlace) {
   this.publicVar.isOpenMissingPlace = false;
  }
 }
}
