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

  this.publicVar.isPersian =
   localStorage.getItem('Status') && JSON.parse(localStorage.getItem('Status')).lan === 'EN' ? false : true;
 }
}
