import { Component } from '@angular/core';
import { PublicVarService } from 'src/application/shared/services/public-var.service';

@Component({
 selector: 'app-root',
 templateUrl: './app.component.html',
 styleUrls: [ './app.component.scss' ],
})
export class AppComponent {
 title = 'gooyamapssr';
 constructor(public publicVar: PublicVarService) {
  // ----  for language
  if (JSON.parse(localStorage.getItem('Status')) && JSON.parse(localStorage.getItem('Status')).lan === 'EN') {
   document.getElementsByTagName('body')[0].style.direction = 'ltr';
   document.getElementsByTagName('body')[0].style.fontFamily = 'Calibri';
   this.publicVar.isPersian = false;
  } else {
   document.getElementsByTagName('body')[0].style.direction = 'rtl';
   document.getElementsByTagName('body')[0].style.fontFamily = '"Sahel","Calibri"';
   this.publicVar.isPersian = true;
  }
  // ----  for language
 }
}
