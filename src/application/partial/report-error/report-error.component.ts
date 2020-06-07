import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { fadeAnimation } from 'src/application/shared/animation/fadeAnimation';
import { YourPlacesComponent } from 'src/application/map-view/utility/menu/navigation/your-places/your-places.component';
import { FavoritHomeComponent } from 'src/application/map-view/utility/menu/navigation/your-places/favorit-home/favorit-home.component';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MapService } from 'src/application/shared/services/map.service';
import { PublicVarService } from 'src/application/shared/services/public-var.service';
import { IranBoundryService } from 'src/application/shared/services/iran-boundry.service';
import { MeasureComponent } from 'src/application/map-view/controller/measure/measure.component';
import { CoordinateComponent } from 'src/application/map-view/utility/more-search/coordinate/coordinate.component';
import { HttpClient } from '@angular/common/http';
import Map from 'ol/Map';
import OSM from 'ol/source/OSM';
import View from 'ol/View';
import { toStringXY } from 'ol/coordinate';
import { transform } from 'ol/proj';
import TileLayer from 'ol/layer/Tile';
import { LoginInfo } from 'src/application/shared/interface/login-info';
@Component({
 selector: 'app-report-error',
 templateUrl: './report-error.component.html',
 styleUrls: [ './report-error.component.scss' ],
 animations: [ fadeAnimation ],
 providers: [ YourPlacesComponent, FavoritHomeComponent ],
})
export class ReportErrorComponent implements OnInit {
 reportErrorForm: FormGroup;
 defualtSelect = '0';
 isopenSelect = false;
 StringXY;
 errorTypes = [
  { value: 0, typeFa: 'لطفاانتخاب کنید...', typeEn: 'Please select ...' },
  { value: 1, typeFa: 'نام معبر اشتباه است', typeEn: 'The road name is incorrect' },
  { value: 2, typeFa: 'جهت حرکت در معبر اشتباه است', typeEn: 'The direction of road is incorrect' },
  { value: 3, typeFa: 'معبر اشتباه رسم شده است', typeEn: 'Drawing incorrectly' },
  { value: 4, typeFa: 'معبر بن بست است', typeEn: 'The closed road' },
  { value: 5, typeFa: 'معبر رسم شده وجود خارجی ندارد', typeEn: "Road dosn't exist" },
  { value: 6, typeFa: 'معبر ترسیم نشده است', typeEn: 'Missing road' },
  { value: 7, typeFa: 'معبر به اشتباه بن بست رسم شده است', typeEn: 'معبر به اشتباه بن بست رسم شده است' },
  { value: 8, typeFa: 'سایر موارد', typeEn: 'Other' },
 ];
 addresss;
 valueDescription = '';
 maxValueDesc = 256;
 countDesc = this.maxValueDesc;
 constructor(
  public mapservice: MapService,
  public publicVar: PublicVarService,
  public IranBoundry: IranBoundryService,
  public yourPlaces: YourPlacesComponent,
  public measure: MeasureComponent,
  private coordinatecomp: CoordinateComponent,
  private httpClient: HttpClient,
 ) {
  this.formValidator();
 }
 ngOnInit() {}
 openReportError() {
  this.publicVar.isOpenReportError = true;
  this.publicVar.isOpenMoreSearch = false;

  this.coordinatecomp.closeCoordinate();
  this.publicVar.isOpenStreet = false;
  this.publicVar.isOpenPoi = false;
  this.publicVar.isOpenIntersect = false;
  this.publicVar.isOpenMoreSearch = false;
  if (this.publicVar.isOpenMeasure) {
   this.measure.openMeasure();
  }
 }
 closeReportError() {
  this.reportErrorForm.reset();
  this.publicVar.isOpenReportError = false;
  // hatman bayad null qarar bedim vagar na ba har click chand ta map add mishe
  this.publicVar.errorMap = null;
  this.valueDescription = '';
 }

 addMap(extentCenter: Array<number>, zoom: number) {
  // osm bayad joda add konim chon base map b moshkel mikhorehage joda nabashe extent kam kardim
  const OSMLayer = new TileLayer({
   source: new OSM(),
   zIndex: 0,
   extent: [ 51.3726, 35.6968, 51.3742, 35.6981 ],
  });

  this.publicVar.errorMap = new Map({
   view: new View({
    extent: this.mapservice.extentMap,
   }),
   controls: [],
   layers: [ OSMLayer ],
   target: 'error-map',
  });
  // add layer ba dar nazar gereftan sharayet
  this.publicVar.wichLayerAdd(
   this.publicVar.errorMap,
   this.publicVar.styleMode,
   this.publicVar.isPersian,
   this.publicVar.isPoiON,
   false,
   false,
   false,
   false
  );
  // agar az click rast add shod center noqteh click qarar dahim agar roye send feedback zad fit konim
  if (extentCenter.length === 4) {
   // send feeedback
   this.publicVar.errorMap.getView().fit([ extentCenter[0], extentCenter[1], extentCenter[2], extentCenter[3] ]);
  } else {
   this.publicVar.errorMap.getView().setCenter([ extentCenter[0], extentCenter[1] ]);
   this.publicVar.errorMap.getView().setZoom(zoom);
  }

  this.IsErrorInIran(); // agar in khat nanevisim aval k nagshe ro add mikoneh error in iran va mokhtasat neshon nemideh
  this.publicVar.errorMap.on('moveend', (evt: Event) => {
   this.IsErrorInIran();
   // agar mouse position dar halat dd bood center dd namayesh dadeh shavad dar qeyr metric
   if (this.publicVar.mousePositionProject === 'EPSG:4326') {
    this.publicVar.errorMapCenter = toStringXY(
     transform(this.publicVar.errorMap.getView().getCenter(), this.mapservice.project, 'EPSG:4326'),
     5,
    );
   } else {
    this.publicVar.errorMapCenter = toStringXY(this.publicVar.errorMap.getView().getCenter(), 0);
   }
  });
 }

 IsErrorInIran() {
  const getCenter = this.publicVar.errorMap.getView().getCenter();
  const inside = require('point-in-polygon');
  this.publicVar.isErrorMapInIran = inside(getCenter, this.IranBoundry.Iran);
 }

 formValidator() {
  this.reportErrorForm = new FormGroup({
   address: new FormControl({ value: '', disabled: true }),
   errorType: new FormControl('', [ Validators.required, this.selectValidators ]),
   description: new FormControl('', [
    Validators.required,
    Validators.minLength(5),
    Validators.maxLength(this.maxValueDesc),
   ]),
  });
 }
 // baraye anke natavanad ba 'لطفاانتخاب کنید...'  submit konad form ra
 selectValidators(formcontrol) {
  if (formcontrol.value === '0') {
   return { value: true };
  }
 }
 submit() {
  const userID: LoginInfo = JSON.parse(localStorage.getItem('login').toString());
  const center = transform(this.publicVar.errorMap.getView().getCenter(), this.mapservice.project, 'EPSG:4326');
  const URL = this.publicVar.baseUrl + ':' + this.publicVar.portApi + '/api/user/MapErrorReport';
  const body = {
   UserID: userID.ID,
   Lat: center[1],
   Lon: center[0],
   ErrorRep: this.reportErrorForm.controls.description.value,
   ErrorType: Number(this.reportErrorForm.controls.errorType.value),
  };
  this.httpClient.post(URL, body).toPromise().then((response) => {
   if (response) {
    this.publicVar.isOpenPopupSuccess = true;
   } else {
    this.publicVar.isOpenPopupError = true;
   }
  });
  setTimeout((e) => {
   this.reportErrorForm.reset();
  }, 30);
 }

 changeCountDesc(el, event) {
  const lenDesc = el.value.length;
  this.countDesc = this.maxValueDesc - lenDesc;
  if (this.countDesc <= 0 && event.key !== 'Backspace') {
   event.preventDefault();
  }
 }

 setAddress() {
  const XYDecimal = transform(this.publicVar.errorMap.getView().getCenter(), this.mapservice.project, 'EPSG:4326');
  const URL =
   this.publicVar.baseUrl +
   ':' +
   this.publicVar.portMap +
   '/api/map/identify?X=' +
   XYDecimal[0].toString() +
   '&Y=' +
   XYDecimal[1].toString() +
   '&ZoomLevel=' +
   this.mapservice.map.getView().getZoom().toFixed(0).toString();
  console.log(URL);

  this.httpClient.get(URL).toPromise().then((response) => {
   console.log(response[0]);
   let nearFeature = response[0];
  });
 }
}
