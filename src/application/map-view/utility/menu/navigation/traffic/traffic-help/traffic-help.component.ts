import { animate, transition, trigger, style } from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { MapService } from 'src/application/shared/services/map.service';
import { PublicVarService } from 'src/application/shared/services/public-var.service';
import { TrafficComponent } from './../traffic.component';

@Component({
 selector: 'app-traffic-help',
 templateUrl: './traffic-help.component.html',
 styleUrls: [ './traffic-help.component.scss' ],
 animations: [
  trigger('openCloseTraffic', [
   transition(':enter', [ style({ opacity: 0 }), animate('300ms', style({ opacity: 1 })) ]),
   transition(':leave', [ style({ opacity: 1 }), animate('300ms', style({ opacity: 0 })) ]),
  ]),
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
  setInterval(() => {
   //  console.log('updatetraffic');
   if (this.publicVar.isTrafficON) {
    const source = this.publicVar.WMTSLayerTraffic.getSource();
    const params = source.getParams();
    params.t = Math.random();
    source.updateParams(params);
   }
  });
 }
}
