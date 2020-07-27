import { Component, OnInit } from '@angular/core';
import { MapService } from 'src/application/shared/services/map.service';
import { PublicVarService } from 'src/application/shared/services/public-var.service';

@Component({
 selector: 'app-style-mode',
 templateUrl: './style-mode.component.html',
 styleUrls: [ './style-mode.component.scss' ],
})
export class StyleModeComponent implements OnInit {
 constructor(public publicVar: PublicVarService, private mapservice: MapService) {}
 // chon component menu ba ng if baz basteh mishavad nemitavanad megdar value stylecheck ra negah darad baya dar service benevisim
 styles = [{ styleEn: 'Day', styleFa: 'روز' }, { styleEn: 'Night', styleFa: 'شب' } ];

 styleValue = this.styles[0];
 isShowOptionStyle = false;

 ngOnInit() {
  // baraye inke bedonim che kalameh i dar style namayesh bedim
  if (this.publicVar.styleMode === 'Night') {
   this.styleValue = this.styles[1];
  } else {
   this.styleValue = this.styles[0];
  }
 }
 switchStyle(styletype) {
  this.isShowOptionStyle = false;
  if (styletype !== this.styleValue.styleEn) {
   this.publicVar.removeAllLayers(this.mapservice.map);

   if (styletype === 'Night') {
    console.log('night');
    this.styleValue = this.styles[1];
    this.publicVar.styleMode = this.styleValue.styleEn;
   } else {
    console.log('day');
    this.styleValue = this.styles[0];
    this.publicVar.styleMode = this.styleValue.styleEn;
   }
   this.publicVar.wichLayerAdd(
    this.mapservice.map,
    this.publicVar.styleMode,
    this.publicVar.isPersian,
    this.publicVar.isPoiON,
    this.publicVar.isTerrainON,
    this.publicVar.isOddEvenON,
    this.publicVar.isTrafficAreaON,
    this.publicVar.isTrafficON,
   );
   localStorage.setItem('style', styletype);
  }
 }
}
