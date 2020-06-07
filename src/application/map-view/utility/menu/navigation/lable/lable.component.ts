import { Component, OnInit } from '@angular/core';
import { PublicVarService } from 'src/application/shared/services/public-var.service';
import { MapService } from 'src/application/shared/services/map.service';

@Component({
 selector: 'app-lable',
 template: `

`,
// <label class="switch">
// <input
//   type="checkbox"
//   #checkboxLable
//   (change)="switchLable(checkboxLable)"
//   [checked]="this.publicVar.isLabelON"
// />
// <div class="slider"></div>
// </label>
})
export class LableComponent implements OnInit {
 constructor(public publicVar: PublicVarService, private mapservice: MapService) {}

 ngOnInit() {}
 switchLable(labelinput: HTMLInputElement) {
  // if (labelinput.checked) {
  //  this.publicVar.isLabelON = true;
  //  if (this.publicVar.isMiniMapSatellite) {
  //   this.publicVar.removeAllLayers(this.mapservice.map);

  //   if (!this.publicVar.isNight) {
  //    if (this.publicVar.isPoiON) {
  //     this.mapservice.map.addLayer(this.publicVar.WMTSLayerDAYFAPOI);
  //    } else {
  //     this.mapservice.map.addLayer(this.publicVar.WMTSLayerDAYFA);
  //    }
  //   } else {
  //    if (this.publicVar.isPoiON) {
  //     this.mapservice.map.addLayer(this.publicVar.WMTSLayerNIGHTFAPOI);
  //    } else {
  //     this.mapservice.map.addLayer(this.publicVar.WMTSLayerNIGHTFA);
  //    }
  //   }
  //  } else {
  //   this.mapservice.map.addLayer(this.publicVar.SatelliteOverlay);
  //  }
  // } else {
  //  this.publicVar.isLabelON = false;
  //  if (this.publicVar.isMiniMapSatellite) {
  //   this.publicVar.removeAllLayers(this.mapservice.map);
  //   if (!this.publicVar.isNight) {
  //    if (this.publicVar.isPoiON) {
  //     this.mapservice.map.addLayer(this.publicVar.WMTSLayerDAYNOPOI);
  //    } else {
  //     this.mapservice.map.addLayer(this.publicVar.WMTSLayerDAYNO);
  //    }
  //   } else {
  //    if (this.publicVar.isPoiON) {
  //     this.mapservice.map.addLayer(this.publicVar.WMTSLayerNIGHTNOPOI);
  //    } else {
  //     this.mapservice.map.addLayer(this.publicVar.WMTSLayerNIGHTNO);
  //    }
  //   }
  //  } else {
  //   this.mapservice.map.removeLayer(this.publicVar.SatelliteOverlay);
  //  }
  // }
  // if (this.publicVar.isTerrainON) {
  //  this.mapservice.map.addLayer(this.publicVar.WMTSLayerTerrain);
  // }
 }
}
