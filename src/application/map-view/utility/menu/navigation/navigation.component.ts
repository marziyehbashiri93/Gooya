import { StyleModeComponent } from './style-mode/style-mode.component';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MiniMapComponent } from 'src/application/map-view/controller/mini-map/mini-map.component';
import { AddMissingPlaceComponent } from 'src/application/partial/add-missing-place/add-missing-place.component';
import { slide } from 'src/application/shared/animation/slide';
import { MapService } from 'src/application/shared/services/map.service';
import { PublicVarService } from 'src/application/shared/services/public-var.service';
import { DirectionComponent } from '../../direction/direction.component';
import { YourPlacesComponent } from './your-places/your-places.component';

@Component({
 selector: 'app-navigation',
 templateUrl: './navigation.component.html',
 styleUrls: [ './navigation.component.scss' ],
 animations: [
  slide,
  trigger('openCloseDis', [
   state(
    'open',
    style({
     animation: ' fade-in 0.3s cubic-bezier(0.39, 0.575, 0.565, 1) both',
     display: 'block',
    }),
   ),
   state(
    'close',
    style({
     display: 'none',
    }),
   ),
   transition('open =>close', [ animate('0.3s') ]),
  ]),
 ],
 providers: [ MiniMapComponent ],
})
export class NavigationComponent implements OnInit {
 @ViewChild(YourPlacesComponent, { static: false })
 yourPlace: YourPlacesComponent;

 @ViewChild(DirectionComponent, { static: false })
 direction: DirectionComponent;

 @ViewChild(StyleModeComponent, { static: false })
 styleMode: StyleModeComponent;
 constructor(
  public publicVar: PublicVarService,
  public MiniMap: MiniMapComponent,
  public missingPlace: AddMissingPlaceComponent,
  public mapservice: MapService,
 ) {}

 ngOnInit() {}

 closeNavigation() {
  // chon dar halati k map stelite style mode nadarim
  if (this.publicVar.isMiniMapSatellite) {
   this.styleMode.isShowOptionStyle = false;
  }
  setTimeout(() => {
   this.publicVar.isOpenNavigation = false;
  }, 10);
 }

 goToMap() {
  if (!this.publicVar.isMiniMapSatellite) {
   this.MiniMap.goSatelliteToMap();
  }
 }

 goToSatellite() {
  if (this.publicVar.isMiniMapSatellite) {
   this.MiniMap.goMapToSatellite();
  }
 }

 showAboutUs() {
  this.closeNavigation();
  this.publicVar.isOpenAboutUs = true;
 }

 openPlaces() {
  this.closeNavigation();
  this.direction.closeDirection();
  this.yourPlace.openPlaces();
 }

 openMissingPlace() {
  // close other element
  this.closeNavigation();
  this.direction.closeDirection();
  this.missingPlace.openMissingPlace();
  setTimeout(() => {
   const extentBaseMap = this.mapservice.map.getView().calculateExtent(this.mapservice.map.getSize());
   this.missingPlace.addMap(extentBaseMap, undefined);
  }, 10);
 }

 changeLan() {
  if (this.publicVar.isPersian) {
   this.publicVar.status.lan = 'EN';
  } else {
   this.publicVar.status.lan = 'FA';
  }
  localStorage.setItem('Status', JSON.stringify(this.publicVar.status));
  location.reload();
 }
}
