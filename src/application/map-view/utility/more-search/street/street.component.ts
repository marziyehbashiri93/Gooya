import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { slide } from 'src/application/shared/animation/slide';
import { PublicVarService } from 'src/application/shared/services/public-var.service';
import { MenuComponent } from '../../menu/menu.component';

@Component({
 selector: 'app-street',
 templateUrl: './street.component.html',
 styleUrls: [ './street.component.scss' ],
 animations: [ slide ],
})
export class StreetComponent implements OnInit {
 @ViewChild('streetInput', { static: false })
 streetInput: ElementRef;
 constructor(public publicVar: PublicVarService, public menu: MenuComponent) {}

 ngOnInit() {}

 openStreet() {
  this.publicVar.isOpenPopupAttribute = false;
  this.publicVar.isOpenMoreSearch = false;
  this.publicVar.isOpenStreet = true;
 }
 closeStreet() {
  this.publicVar.isOpenStreet = false;
 }
}
