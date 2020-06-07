import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { slide } from 'src/application/shared/animation/slide';
import { PublicVarService } from 'src/application/shared/services/public-var.service';
import { MenuComponent } from '../../menu/menu.component';

@Component({
 selector: 'app-intersection',
 templateUrl: './intersection.component.html',
 styleUrls: [ './intersection.component.scss' ],
 animations: [ slide ],
})
export class IntersectionComponent implements OnInit {
 constructor(public publicVar: PublicVarService, public menu: MenuComponent) {}
 @ViewChild('intersect1', { static: false })
 intersect1: ElementRef;
 @ViewChild('intersect2', { static: false })
 intersect2: ElementRef;

 ngOnInit() {}
 openIntersction() {
  this.publicVar.isOpenPopupAttribute = false;
  this.publicVar.isOpenMoreSearch = false;
  this.publicVar.isOpenIntersect = true;
 }
 closeIntersection() {
  this.publicVar.isOpenIntersect = false;
 }
 // ---- for go next input by keypress enter ----
 nextInput(nextInput: HTMLInputElement) {
  if (this.intersect1.nativeElement.value) {
   nextInput.focus();
  }
 }

 searchIntersect() {
  if (this.intersect1.nativeElement.value && this.intersect2.nativeElement.value) {
   console.log('searchintersect');
  }
 }
}
