import { Component, OnInit } from '@angular/core';
import { PublicVarService } from 'src/application/shared/services/public-var.service';
import { MapService } from 'src/application/shared/services/map.service';

@Component({
 selector: 'app-traffic-area',
 template: `
    <label class="switch">
      <input
        type="checkbox"
        #checkboxTrafficArea
        (change)="switchTrafficArea(checkboxTrafficArea)"
        [checked]="this.publicVar.isTrafficAreaON"
      />
      <div class="slider"></div>
    </label>
  `,
})
export class TrafficAreaComponent implements OnInit {
 constructor(public publicVar: PublicVarService, private mapservice: MapService) {}

 ngOnInit() {}

 switchTrafficArea(TrafficAreaInput: HTMLInputElement) {
  if (TrafficAreaInput.checked) {
   this.publicVar.isTrafficAreaON = true;
   console.log('TrafficArea.checked');
   this.mapservice.map.addLayer(
    this.publicVar.createWMTSLayer(
     this.publicVar.layerStatus.trafficArea.layerName,
     this.publicVar.layerStatus.trafficArea.olName,
     this.publicVar.layerStatus.trafficArea.zIndex,
     this.publicVar.layerStatus.trafficArea.maxZoom,
     this.publicVar.layerStatus.trafficArea.minZoom,
    ),
   );
  } else {
   this.publicVar.isTrafficAreaON = false;
   this.publicVar.removeLayerByName(this.publicVar.layerStatus.trafficArea.olName);
  }
  this.publicVar.status.trafficArea = this.publicVar.isTrafficAreaON;
  localStorage.setItem('Status', JSON.stringify(this.publicVar.status));
 }
}
