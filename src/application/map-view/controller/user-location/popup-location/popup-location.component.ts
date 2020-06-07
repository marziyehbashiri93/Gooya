import { Component, OnInit } from '@angular/core';
import { fadeAnimation } from 'src/application/shared/animation/fadeAnimation';
import { PublicVarService } from 'src/application/shared/services/public-var.service';

@Component({
  selector: 'app-popup-location',
  templateUrl: './popup-location.component.html',
  styleUrls: ['./popup-location.component.scss'],
  animations: [
    fadeAnimation
  ]
})
export class PopupLocationComponent implements OnInit {
  constructor(public publicVar: PublicVarService) {}

  ngOnInit() {
  }

}
