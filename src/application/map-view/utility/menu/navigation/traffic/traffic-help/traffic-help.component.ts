import { Component, OnInit } from '@angular/core';
import { PublicVarService } from 'src/application/shared/services/public-var.service';
import { TrafficComponent } from './../traffic.component';

@Component({
  selector: 'app-traffic-help',
  templateUrl: './traffic-help.component.html',
  styleUrls: ['./traffic-help.component.scss']
})
export class TrafficHelpComponent implements OnInit {

  constructor( public publicVar: PublicVarService,public traffic: TrafficComponent) { }

  ngOnInit() {

  }

}
