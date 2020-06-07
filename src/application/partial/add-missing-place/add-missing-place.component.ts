import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { toStringXY } from 'ol/coordinate';
import TileLayer from 'ol/layer/Tile';
import Map from 'ol/Map';
import { transform } from 'ol/proj';
import OSM from 'ol/source/OSM';
import View from 'ol/View';
import { MeasureComponent } from 'src/application/map-view/controller/measure/measure.component';
import { CoordinateComponent } from 'src/application/map-view/utility/more-search/coordinate/coordinate.component';
import { fadeAnimation } from 'src/application/shared/animation/fadeAnimation';
import { LoginInfo } from 'src/application/shared/interface/login-info';
import { IranBoundryService } from 'src/application/shared/services/iran-boundry.service';
import { MapService } from 'src/application/shared/services/map.service';
import { PublicVarService } from 'src/application/shared/services/public-var.service';
@Component({
 selector: 'app-add-missing-place',
 templateUrl: './add-missing-place.component.html',
 styleUrls: [ './add-missing-place.component.scss' ],
 animations: [ fadeAnimation ],
})
export class AddMissingPlaceComponent implements OnInit {
 missingPlaceForm: FormGroup;
 isopenSelect: boolean = false;
 defualtSelect = '0';
 categoryType = [
  { value: '0', typeFa: 'لطفاانتخاب کنید...', typeEn: 'Please select ...' },
  { value: '1', typeFa: 'مراکز حمل و نقل', typeEn: 'Transportation' },
  { value: '2', typeFa: 'مراکز خرید', typeEn: 'Shopping' },
  { value: '3', typeFa: 'مکانهای تفریحی', typeEn: 'Entertainment' },
  { value: '4', typeFa: 'مکانهای توریستی', typeEn: 'Tourism' },
  { value: '5', typeFa: 'رستوران و کافی شاپ', typeEn: 'Food Drink' },
  { value: '6', typeFa: 'مراکز دولتی', typeEn: 'Government Community' },
  { value: '7', typeFa: 'اورژانسها', typeEn: 'Emergency' },
  { value: '8', typeFa: 'مراکز اقامتی', typeEn: 'Hotel Lodge' },
  { value: '9', typeFa: 'مراکز خدماتی', typeEn: 'Service' },
  { value: '10', typeFa: 'بانک ها و موسسات مالی', typeEn: 'Bank And FinanceInstitutions' },
  { value: '12', typeFa: 'مراکز آموزشی و فرهنگی', typeEn: 'Educational And Cultural Center' },
  { value: '13', typeFa: 'مراکز مذهبی', typeEn: 'Religious Centers' },
  { value: '14', typeFa: 'آرامگاه', typeEn: 'Cemetery' },
  { value: '16', typeFa: 'شرکت های خودرو سازی', typeEn: 'Car Manufacturing Companies' },
  { value: '17', typeFa: 'مراکز تولیدی', typeEn: 'Manufacturing' },
  { value: '19', typeFa: 'شرکت های بیمه', typeEn: 'Insurance Company' },
  { value: '20', typeFa: 'سایر موارد', typeEn: 'Other' },
 ];
 valueAddressWrong = '';
 valueNameMissing = '';

 constructor(
  private mapservice: MapService,
  public publicVar: PublicVarService,
  public IranBoundry: IranBoundryService,
  public measure: MeasureComponent,
  private coordinatecomp: CoordinateComponent,
  private httpClient: HttpClient,
 ) {}

 ngOnInit() {
  this.formValidator();
 }

 addMap(extentCenter: Array<number>, zoom: number) {
  // osm bayad joda add konim chon base map b moshkel mikhorehage joda nabashe extent kam kardim
  const OSMLayer = new TileLayer({
   source: new OSM(),
   zIndex: 0,
   extent: [ 51.3726, 35.6968, 51.3742, 35.6981 ],
  });
  this.publicVar.missingMap = new Map({
   view: new View({
    extent: this.mapservice.extentMap,
   }),
   controls: [],
   layers: [ OSMLayer ],
   target: 'missing-map',
  });
  // add layer ba dar nazar gereftan sharayet
  this.publicVar.wichLayerAdd(
   this.publicVar.missingMap,
   this.publicVar.styleMode,
   this.publicVar.isPersian,
   this.publicVar.isPoiON,
   false,
   false,
   false,
   false
  );

  if (extentCenter.length === 4) {
   console.log('isextent');
   this.publicVar.missingMap.getView().fit([ extentCenter[0], extentCenter[1], extentCenter[2], extentCenter[3] ]);
  } else {
   this.publicVar.missingMap.getView().setCenter([ extentCenter[0], extentCenter[1] ]);
   this.publicVar.missingMap.getView().setZoom(zoom);
  }

  this.IsErrorInIran(); // agar in khat nanevisim aval k nagshe ro add mikoneh error in iran va mokhtasat neshon nemideh
  this.publicVar.missingMap.on('moveend', (evt: Event) => {
   this.IsErrorInIran();
   // agar mouse position dar halat dd bood center dd namayesh dadeh shavad dar qeyr metric
   if (this.publicVar.mousePositionProject === 'EPSG:4326') {
    this.publicVar.missingMapCenter = toStringXY(
     transform(this.publicVar.missingMap.getView().getCenter(), this.mapservice.project, 'EPSG:4326'),
     5,
    );
   } else {
    this.publicVar.missingMapCenter = toStringXY(this.publicVar.missingMap.getView().getCenter(), 0);
   }
  });
 }

 IsErrorInIran() {
  const getCenter = this.publicVar.missingMap.getView().getCenter();
  const inside = require('point-in-polygon');
  this.publicVar.isMissingMapInIran = inside(getCenter, this.IranBoundry.Iran);
 }

 formValidator() {
  this.missingPlaceForm = new FormGroup({
   nameMissing: new FormControl('', [ Validators.required, Validators.minLength(3) ]),
   category: new FormControl('', [ Validators.required, this.selectValidators ]),
   phone: new FormControl('', [ Validators.minLength(3), Validators.pattern('[0-9]*') ]),
   postalCode: new FormControl('', [
    Validators.minLength(10),
    Validators.maxLength(10),
    // this.numberValidator('postalCode')
   ]),
   addressWrong: new FormControl('', [ Validators.required, Validators.minLength(10), Validators.maxLength(100) ]),
  });
 }

 // baraye anke natavanad ba 'لطفاانتخاب کنید...'  submit konad form ra
 selectValidators(formcontrol) {
  if (formcontrol.value === '0') {
   return { value: true };
  }
 }

 preventChar(event) {
  const allowedRegex = /[0-9]/;
  if (!event.key.match(allowedRegex)) {
   event.preventDefault();
  }
 }

 openMissingPlace() {
  // close other element
  this.publicVar.isOpenDirection = false;
  this.publicVar.isOpenPlaces = false;
  this.coordinatecomp.closeCoordinate();
  this.publicVar.isOpenStreet = false;
  this.publicVar.isOpenPoi = false;
  this.publicVar.isOpenIntersect = false;
  this.publicVar.isOpenMoreSearch = false;
  if (this.publicVar.isOpenMeasure) {
   this.measure.openMeasure();
  }

  this.publicVar.isOpenMissingPlace = true;
 }

 openCategory() {
  console.log('click');
  this.isopenSelect = !this.isopenSelect;
 }

 closeMissingPlace() {
  this.publicVar.isOpenMissingPlace = false;
  this.missingPlaceForm.reset();
  this.valueAddressWrong = '';
  this.valueNameMissing = '';
 }

 submit() {
  const userID: LoginInfo = JSON.parse(localStorage.getItem('login').toString());
  const center = transform(this.publicVar.missingMap.getView().getCenter(), this.mapservice.project, 'EPSG:4326');
  const URL = this.publicVar.baseUrl + ':' + this.publicVar.portApi + '/api/user/UnSavedPOI';
  const body = {
   UserID: userID.ID,
   MCatID: Number(this.missingPlaceForm.value.category),
   Lat: center[1],
   Lon: center[0],
   POIName: this.missingPlaceForm.value.nameMissing,
   POIAddress: this.missingPlaceForm.value.addressWrong,
   POITel: this.missingPlaceForm.value.phone,
   POIPostalCode: this.missingPlaceForm.value.postalCode,
  };
  this.httpClient.post(URL, body).toPromise().then((response) => {
   console.log(response);
   if (response) {
    this.publicVar.isOpenPopupSuccess = true;
   } else {
    this.publicVar.isOpenPopupError = true;
   }
  });
  setTimeout((e) => {
   this.missingPlaceForm.reset();
  }, 300);
 }
}
