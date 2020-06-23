import { Component, OnInit } from '@angular/core';
import { PublicVarService } from 'src/application/shared/services/public-var.service';
import { TrafficComponent } from './../traffic.component';
import { MapService } from 'src/application/shared/services/map.service';

@Component({
 selector: 'app-traffic-help',
 templateUrl: './traffic-help.component.html',
 styleUrls: [
  './traffic-help.component.scss',
 ],
})
export class TrafficHelpComponent implements OnInit {
 constructor(public publicVar: PublicVarService, public traffic: TrafficComponent, private mapservice: MapService) {}

 ngOnInit() {
  this.updateTrafficdata();
 }
 // baraye anke dadeh traffic baraye har change zoom update shavad
 // bayad hatman tag component dakhel base map bashad bakhate hamin in function inja neveshtim
 updateTrafficdata() {
  this.mapservice.map.on('moveend', (evt: Event) => {
   console.log('update');
   if (this.publicVar.isTrafficON) {
    const source = this.publicVar.WMTSLayerTraffic.getSource();
    const params = source.getParams();
    params.t = Math.random();
    source.updateParams(params);
   }
  });
 }
}
