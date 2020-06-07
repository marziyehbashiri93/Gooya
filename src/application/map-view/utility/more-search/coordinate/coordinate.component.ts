import { isPlatformBrowser } from '@angular/common';
import { Component, ElementRef, Inject, OnInit, PLATFORM_ID, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import VectorLayer from 'ol/layer/Vector';
import { transform } from 'ol/proj';
import { Icon, Style } from 'ol/style';
import { slide } from 'src/application/shared/animation/slide';
import { MapService } from 'src/application/shared/services/map.service';
import { PublicVarService } from 'src/application/shared/services/public-var.service';
import { MenuComponent } from '../../menu/menu.component';

@Component({
 selector: 'app-coordinate',
 templateUrl: './coordinate.component.html',
 styleUrls: [ './coordinate.component.scss' ],
 animations: [ slide ],
})
export class CoordinateComponent implements OnInit {
 @ViewChild('lat', { static: false })
 lat: ElementRef;
 latPlaceholder = '4260790';
 longPlaceholder = '5718482';
 latValue = '';
 longValue = '';
 transCoord: Array<number>;
 coordinateForm: FormGroup;
 coordData = [
  { value: '0', latPlaceholder: '4260790', longPlaceholder: '5718482' },
  { value: '1', latPlaceholder: `36° 42" 35' N`, longPlaceholder: `51° 22" 31' E ` },
  { value: '2', latPlaceholder: '35.71213°', longPlaceholder: '51.37415°' },
 ];
 hasError;
 // ---- create style for search point ----
 markerSource = this.publicVar.markerSourceMoreSearch;
 svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18.21 24.5"  width="35px"   height="35px">' +
  '<path d="M9.2,0A9.18,9.18,0,0,0,0,9.16v0a9.57,9.57,0,0,0,1.7,5.4l.2.3,6.6,9.3a.75.75,0,0,0,1.05.15.54.54,0,0,0,.15-.15L16.2,15l.3-.4a9.4,9.4,0,0,0,1.7-5.4A8.9,8.9,0,0,0,9.63,0Zm0,12.2a3.1,3.1,0,1,1,3.1-3.1A3.1,3.1,0,0,1,9.2,12.2Z" transform="translate(0 0)" fill="#DB0000"/>' +
  '<circle cx="9.2" cy="9.1" r="3.1" fill="#fff"/>' +
  '</svg>';

 constructor(
  // for ssr
  @Inject(PLATFORM_ID) private platformId: Object,
  public publicVar: PublicVarService,
  private mapservice: MapService,
  fb: FormBuilder,
  public menu: MenuComponent,
 ) {
  this.coordinateForm = fb.group({
   RadioBtn: [ '', Validators.required ],
  });
 }

 ngOnInit() {}

 openCoordinate() {
  this.publicVar.isOpenPopupAttribute = false;
  this.publicVar.isOpenMoreSearch = false;
  this.longValue = '';
  this.latValue = '';
  this.coordinateForm.reset();
  this.publicVar.isOpenCoordinate = true;
 }

 closeCoordinate() {
  this.publicVar.isOpenCoordinate = false;
  this.markerSource.clear();
 }

 // ---- for go next input by keypress enter ----
 nextInput(nextInput: HTMLInputElement) {
  if (this.lat.nativeElement.value) {
   nextInput.focus();
  }
 }

 // ---- for prevent to type alphabet ----
 matcher(event) {
  let allowedRegex;
  if (this.coordinateForm.value.RadioBtn === '2') {
   console.log('2');
   // daraje
   allowedRegex = /[NEWS°0-9\.\-]/g;
  } else if (this.coordinateForm.value.RadioBtn === '1') {
   console.log('1');
   // ddms manfi nemitvanad bashad
   allowedRegex = /[NEWS'"°0-9\.\s]/g;
  } else {
   console.log('0');
   // metric news nemitavanad begirad
   allowedRegex = /[0-9\.\-]/g;
  }
  if (!event.key.match(allowedRegex)) {
   event.preventDefault();
  }
 }
 // baraye har taqir dar btn ha place holder taqir konad
 ChangeInputFormat() {
  this.latPlaceholder = this.coordData[Number(this.coordinateForm.value.RadioBtn)].latPlaceholder;
  this.longPlaceholder = this.coordData[Number(this.coordinateForm.value.RadioBtn)].longPlaceholder;
  this.latValue = '';
  this.longValue = '';
  this.markerSource.clear();
  this.lat.nativeElement.focus();
 }

 ddTomercator(): Array<number> {
  const x = parseFloat(this.longValue);
  const y = parseFloat(this.latValue);
  if (x >= -180 && x <= 180 && y >= -90 && y <= 90) {
   const coord = [ x, y ];
   return transform(coord, 'EPSG:4326', this.mapservice.project);
  }
 }

 dmsToMercator() {
  //  space hay ezafe ra remove mikonim
  // const x = this.longValue.replace(/\s\s+/g, ' ').trim();
  // const y = this.latValue.replace(/\s\s+/g, ' ').trim();
  // const splitX = x.split(' ');
  // const splitY = y.split(' ');

  if (isTrueFormat(this.longValue, 180) && isTrueFormat(this.latValue, 90)) {
   const splitX = isTrueFormat(this.longValue, 180);
   const splitY = isTrueFormat(this.latValue, 90);
   const DDX = ConvertDMSToDD(parseFloat(splitX[0]), parseFloat(splitX[1]), parseFloat(splitX[2]), splitX[3]);
   const DDY = ConvertDMSToDD(parseFloat(splitY[0]), parseFloat(splitY[1]), parseFloat(splitY[2]), splitY[3]);
   return transform([ DDX, DDY ], 'EPSG:4326', this.mapservice.project);
  }

  function ConvertDMSToDD(degrees, minutes, seconds, direction){
   let dd = Number(degrees) + Number(minutes) / 60 + Number(seconds) / (60 * 60);

   if (direction === 'S' || direction === 'W') {
    dd = dd * -1;
   } // Don't do anything for N or E
   console.log('dd', dd);
   return dd;
  }
  function isTrueFormat(xy: string, tolerance: number): Array<string>{
   // baraye anke chand ta space b yaki tabdil konim va az aval o akar space bardarim
   const removeBadSpace = xy.replace(/\s\s+/g, ' ').trim();
   const splitxy = removeBadSpace.split(' ');
   if (
    parseFloat(splitxy[0]) <= tolerance &&
    parseFloat(splitxy[0]) >= -tolerance &&
    parseFloat(splitxy[1]) <= 60 &&
    parseFloat(splitxy[2]) <= 60 &&
    splitxy[3].length === 1
   ) {
    if (
     // chon nemitonet bishtar ya kamtar az tolerance bashad masla -90 30 20 S nadarmim
     (parseFloat(splitxy[0]) === tolerance || parseFloat(splitxy[0]) === -tolerance) &&
     parseFloat(splitxy[1]) === 0 &&
     parseFloat(splitxy[2]) === 0
    ) {
     return splitxy;
    } else if (parseFloat(splitxy[0]) < tolerance && parseFloat(splitxy[0]) > -tolerance) {
     return splitxy;
    }
   }
  }
 }

 // ---- for add point when search ----
 addMarker(postion) {
  // for ssr
  if (isPlatformBrowser(this.platformId)) {
   const markerStyle = new Style({
    image: new Icon({
     opacity: 1,
     src: 'data:image/svg+xml,' + escape(this.svg),
    }),
   });
   this.markerSource.clear();
   const iconFeature = new Feature({
    geometry: new Point(postion),
   });
   const vectorLayer = new VectorLayer({
    source: this.markerSource,
    style: markerStyle,
    zIndex: 1002,
   });
   vectorLayer.set('name', 'searchMarker');
   this.markerSource.addFeature(iconFeature);
   this.mapservice.map.addLayer(vectorLayer);
  }
 }
 searchCoord() {
  this.hasError = false;
  this.transCoord = null;
  const valueBtn = this.coordinateForm.getRawValue().RadioBtn;
  const view = this.mapservice.map.getView();
  if (this.latValue !== '' && this.longValue !== '') {
   console.log(valueBtn);
   if (valueBtn === '2') {
    if (this.ddTomercator()) {
     this.transCoord = this.ddTomercator();
    }
   } else if (valueBtn === '1') {
    if (this.dmsToMercator()) {
     this.transCoord = this.dmsToMercator();
    }
   } else {
    this.transCoord = [ parseFloat(this.longValue), parseFloat(this.latValue) ];
   }
   if (this.transCoord) {
    view.animate({
     center: [ this.transCoord[0], this.transCoord[1] ],
     zoom: 16,
     duration: 1000,
    });
    // ---- for add point when search ----
    this.addMarker([ this.transCoord[0], this.transCoord[1] ]);
   } else {
    this.hasError = true;
   }
   // ---- for add point when search ----
  }
 }
}
