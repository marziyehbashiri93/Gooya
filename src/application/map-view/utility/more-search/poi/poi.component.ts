import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { slide } from 'src/application/shared/animation/slide';
import { MenuComponent } from '../../menu/menu.component';
import { PublicVarService } from 'src/application/shared/services/public-var.service';

@Component({
 selector: 'app-poi',
 templateUrl: './poi.component.html',
 styleUrls: [ './poi.component.scss' ],
 animations: [ slide ],
})
export class PoiComponent implements OnInit {
 @ViewChild('point', { static: false })
 point: ElementRef;

 constructor(public publicVar: PublicVarService, public menu: MenuComponent) {}

 ngOnInit() {}
 openPoi() {
  this.publicVar.isOpenPopupAttribute = false;
  this.publicVar.isOpenMoreSearch = false;
  this.publicVar.isOpenPoi = true;
 }
 closePoi() {
  this.publicVar.isOpenPoi = false;
 }

 searchPoi() {
  if (this.point.nativeElement.value) {
   console.log(' searchPoi');
  }
 }
}
