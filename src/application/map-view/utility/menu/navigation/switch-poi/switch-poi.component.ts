import { Component, OnInit } from '@angular/core';
import { PublicVarService } from 'src/application/shared/services/public-var.service';
import { MapService } from 'src/application/shared/services/map.service';

@Component({
 selector: 'app-switch-poi',
 template: `
  <label class="switch">
    <input type="checkbox" #checkboxPOI (change)="switchPOI(checkboxPOI)"
    [checked]="this.publicVar.isPoiON"
    />
    <div class="slider"></div>
  </label>
`,
})
export class SwitchPoiComponent implements OnInit {
 constructor(public publicVar: PublicVarService, private mapservice: MapService) {}

 ngOnInit() {}
 switchPOI(POIInput: HTMLInputElement) {
  this.publicVar.removeAllLayers(this.mapservice.map);
  if (POIInput.checked) {
   this.publicVar.isPoiON = true;
  } else {
   this.publicVar.isPoiON = false;
  }
  this.publicVar.status.poi = this.publicVar.isPoiON;
  localStorage.setItem('Status', JSON.stringify(this.publicVar.status));
  this.publicVar.wichLayerAdd(
   this.mapservice.map,
   this.publicVar.styleMode,
   this.publicVar.isPersian,
   this.publicVar.isPoiON,
   this.publicVar.isTerrainON,
   this.publicVar.isOddEvenON,
   this.publicVar.isTrafficAreaON,
   this.publicVar.isTrafficON
  );
 }
}
