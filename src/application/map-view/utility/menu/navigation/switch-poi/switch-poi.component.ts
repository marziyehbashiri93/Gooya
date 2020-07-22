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
  // this.publicVar.removeAllLayers(this.mapservice.map);
  if (POIInput.checked) {
   this.publicVar.isPoiON = true;
   this.publicVar.removeLayerByName(this.publicVar.layerStatus.label.olName);
   this.mapservice.map.addLayer(
    this.publicVar.createWMTSLayer(
     this.publicVar.styleMode === 'Day'
      ? this.publicVar.isPersian
        ? this.publicVar.layerStatus.poi.layerName.dayFa
        : this.publicVar.layerStatus.poi.layerName.dayEn
      : this.publicVar.isPersian
        ? this.publicVar.layerStatus.poi.layerName.nightFa
        : this.publicVar.layerStatus.poi.layerName.nightEn,
     this.publicVar.layerStatus.poi.olName,
     this.publicVar.layerStatus.poi.zIndex,
     this.publicVar.layerStatus.poi.maxZoom,
     this.publicVar.layerStatus.poi.minZoom,
    ),
   );
  } else {
   this.publicVar.isPoiON = false;
   this.publicVar.removeLayerByName(this.publicVar.layerStatus.poi.olName);
   this.mapservice.map.addLayer(
    this.publicVar.createWMTSLayer(
     this.publicVar.styleMode === 'Day'
      ? this.publicVar.isPersian
        ? this.publicVar.layerStatus.label.layerName.dayFa
        : this.publicVar.layerStatus.label.layerName.dayEn
      : this.publicVar.isPersian
        ? this.publicVar.layerStatus.label.layerName.nightFa
        : this.publicVar.layerStatus.label.layerName.nightEn,
     this.publicVar.layerStatus.label.olName,
     this.publicVar.layerStatus.label.zIndex,
     this.publicVar.layerStatus.label.maxZoom,
     this.publicVar.layerStatus.label.minZoom,
    ),
   );
  }
  this.publicVar.status.poi = this.publicVar.isPoiON;
  localStorage.setItem('Status', JSON.stringify(this.publicVar.status));
 }
}
