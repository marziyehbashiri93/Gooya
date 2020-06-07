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
   this.mapservice.map.addLayer(this.publicVar.WMTSLayerRestrictedArea);
  } else {
   this.publicVar.isTrafficAreaON = false;
   this.mapservice.map.removeLayer(this.publicVar.WMTSLayerRestrictedArea);
  }
  this.publicVar.status.trafficArea = this.publicVar.isTrafficAreaON ;
  localStorage.setItem('Status', JSON.stringify(this.publicVar.status));
 }
}
