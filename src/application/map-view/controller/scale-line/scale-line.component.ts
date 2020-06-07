import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MapService } from 'src/application/shared/services/map.service';
import ScaleLine from 'ol/control/ScaleLine';

@Component({
  selector: 'app-scale-line',
  template: '<div class="scale-line" id="scale-line"></div>',
  styleUrls: ['./scale-line.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ScaleLineComponent implements OnInit {
  constructor(private mapservice: MapService) {}

  ngOnInit() {
    this.setScaleLine();
  }
  setScaleLine() {
    this.mapservice.map.addControl(
      new ScaleLine({
        units: 'metric',
        target: 'scale-line',
      })
    );
  }
}
