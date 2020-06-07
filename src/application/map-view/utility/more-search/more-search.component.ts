import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, OnInit, ViewChild } from '@angular/core';

import { PublicVarService } from 'src/application/shared/services/public-var.service';
import { CoordinateComponent } from './coordinate/coordinate.component';
import { IntersectionComponent } from './intersection/intersection.component';
import { PoiComponent } from './poi/poi.component';
import { StreetComponent } from './street/street.component';
import { MeasureComponent } from 'src/application/map-view/controller/measure/measure.component';
@Component({
 selector: 'app-more-search',
 templateUrl: './more-search.component.html',
 styleUrls: [ './more-search.component.scss' ],
 animations: [
  trigger('changeWidth', [
   state(
    'openMoreSearch',
    style({
     height: '113px',
    })
   ),
   state(
    'closeMoreSearch',
    style({
     height: '38px',
    })
   ),
  ]),
  trigger('showIcon', [
   state(
    'showIcon',
    style({
     opacity: '1',
    })
   ),
   state(
    'DontshowIcon',
    style({
     display: 'none',
     opacity: '0',
    })
   ),
   transition('DontshowIcon => showIcon', [ animate('0.4s'), style({ display: 'block' }) ]),
  ]),
  trigger('linkMoreStyle', [
   state(
    'openMoreSearch',
    style({
     paddingTop: '7px',
     height: '31px',
     boxShadow: 'inset 0 2px 4px -4px #777',
    })
   ),
   state(
    'closeMoreSearch',
    style({
     paddingTop: '8px',
     height: '38px',
     boxShadow: 'none',
    })
   ),
   transition('DontshowIcon => showIcon', [ animate('0.5s') ]),
  ]),
  trigger('openSearchResult', [
   state(
    'openSearchResult',
    style({
     zIndex: '-6',
     position: 'absolute',
     transition: 'all 0.2s linear',
    })
   ),
   state('closeSearchResult', style({})),
  ]),
 ],
})
export class MoreSearchComponent implements OnInit {
 @ViewChild(StreetComponent, { static: false })
 StreetComponent: StreetComponent;
 @ViewChild(IntersectionComponent, { static: false })
 IntersectionComponent: IntersectionComponent;
 @ViewChild(PoiComponent, { static: false })
 PoiComponent: PoiComponent;
 @ViewChild(CoordinateComponent, { static: false })
 CoordinateComponent: CoordinateComponent;
 constructor(public publicVar: PublicVarService, public measure: MeasureComponent) {}
 ngOnInit() {}
 closeOtherComponent() {
  if (this.publicVar.isOpenMeasure) {
   this.measure.openMeasure();
  }
 }
}
