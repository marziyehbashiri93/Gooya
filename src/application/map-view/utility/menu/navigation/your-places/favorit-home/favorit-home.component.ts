import { state, style, trigger } from '@angular/animations';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { transform } from 'ol/proj';
import { DirectionComponent } from 'src/application/map-view/utility/direction/direction.component';
import { LoginVarService } from 'src/application/partial/login/login-var.service';
import { IranBoundryService } from 'src/application/shared/services/iran-boundry.service';
import { MapService } from 'src/application/shared/services/map.service';
import { PublicVarService } from 'src/application/shared/services/public-var.service';
import { PublicYourPlaceVariableService } from '../public-your-place-variable.service';

@Component({
 selector: 'app-favorit-home',
 templateUrl: './favorit-home.component.html',
 styleUrls: [ './favorit-home.component.scss' ],
 animations: [
  trigger('openCloseHome', [
   state(
    'close',
    style({
     height: '60px',
    }),
   ),
   state(
    'openDontHaveHome',
    style({
     height: '146px',
    }),
   ),
   state(
    'openHaveHome',
    style({
     height: '100px',
    }),
   ),
   state(
    'openEditHome',
    style({
     height: '146px',
    }),
   ),
  ]),
 ],
})
export class FavoritHomeComponent implements OnInit {
  // @ViewChild(LoginPageComponent, { static: false })////////////////
 // ----for home ----
 existHome = '';
 // showAddhome = false;
 isOpenAddHome: boolean;
 isOpenHomeEdit: boolean = false;
 isOpenHomeDelete: boolean = false;
 homeAddres: string;
 homelocation: Array<number> = [ 5723891.316850067, 4264880.430199694 ];
 homelocationVal: string;
 coordPoint: Array<number>;
 useID: number ;
 
 // ----for home ----
 constructor(
  private mapservice: MapService,
  public publicVar: PublicVarService,
  public publicVarYourPlace: PublicYourPlaceVariableService,
  public IranBoundry: IranBoundryService,
  public direction: DirectionComponent,
  private httpClient: HttpClient,
  public loginVar: LoginVarService,
 ) {
  
 }

 ngOnInit() {
 }

 // ----this function for save Home location ----

 // in this function has 2 part ,part 1 if home open ,we must close home with click and remove Point
 /// part 2 has 2 section:section 1 if Location of home exist , we must show location and when click on it , map goes to that location
 // section 2 : if Location of home does not exist, we must get user's home Location and save that

 openCloseHome() {
  this.isOpenHomeEdit = false;
  this.isOpenHomeDelete = false;

  if (this.publicVarYourPlace.isOpenHome) {
   console.log('CloseHome');
   this.publicVarYourPlace.removePoint();
   this.publicVarYourPlace.isOpenHome = false;
  } else if (this.publicVar.isOpenPlaces) {
   console.log('OpenHome');
   this.publicVarYourPlace.isOpenHome = true;
   if (this.publicVarYourPlace.isExistHome) {
    this.homeAddres = 'اسدی ، ستارخان، منطقه 5 ، تهران';
    setTimeout(() => {
     this.existHome = 'HaveHome';
    }, 550);
   } else {
    setTimeout(() => {
     this.existHome = 'DontHaveHome';
    }, 550);
    const Center = this.mapservice.map.getView().getCenter();
    this.coordPoint = [ Center[0].toFixed(0), Center[1].toFixed(0) ];
    const geom = this.publicVarYourPlace.CreatAddresFromPoint(Center[0], Center[1]);
    geom.on('change', () => {
     this.coordPoint = [ geom.getFirstCoordinate()[0].toFixed(0), geom.getFirstCoordinate()[1].toFixed(0) ];
    });
   }
  }

  this.existHome = '';
  // this.publicVarYourPlace.isOpenHome = !this.publicVarYourPlace.isOpenHome;
 }

 addNewHome() {
  this.publicVarYourPlace.isExistHome = true;
  this.publicVarYourPlace.isOpenHome = false;
  const latlong = transform(this.coordPoint, this.mapservice.project, 'EPSG:4326');
  // const use = this.publicVar.loginDeta.ID;
  // this.useID = this.publicVar.loginDeta.ID;
  this.useID = this.loginVar.loginValue.ID;
  console.log('useID ==>>>>>>>>>>' + this.useID);

  const body = {
   ID: 0,
   UserID: this.useID,
   Lat: latlong[1],
   Lon: latlong[0],
   PointName: 'مطب',
   PointTypecode: 3,
  };
  console.log('BODY==>' + body.UserID);
  const URL = this.publicVar.baseUrl + ':' + this.publicVar.portApi + '/api/user/SaveInterestedPoints';
  this.httpClient.post(URL, body).toPromise().then((response) => {
   console.log('typeof' + typeof response);
   console.log('response:' + response);
   console.log('url:' + URL);
   if (response == 'true,') {
    this.publicVarYourPlace.removePoint();
    this.openCloseHome();
   } else {
     alert ('ثبت مکان مورد نظر با مشکل مواجه شده است');
   }
  });
  // this.dataYourPlace();
 }

 opendirectionHome() {
  this.publicVarYourPlace.removePoint();
  // setTimeout(e => {
  //   // this.closePlaces();
  // }, this.publicVar.timeUtility / 4);
  this.publicVar.isOpenPlaces = false;
  setTimeout((e) => {
   this.direction.openDirection('start-point');
   this.direction.getClickLoctionAddress();
   this.direction.LocationToAddress(this.homelocation);
  }, 300);
  this.mapservice.map.getView().setCenter(this.homelocation)
 }

 openHomeEdit() {
  this.isOpenHomeEdit = true;
  // we must get home location from api and save in home locatin
  this.mapservice.map.getView().setCenter(this.homelocation);
  this.mapservice.map.getView().setZoom(16);

  this.homelocationVal = this.publicVarYourPlace.toFix(this.homelocation);
  const geom = this.publicVarYourPlace.CreatAddresFromPoint(this.homelocation[0], this.homelocation[1]);
  geom.on('change', () => {
   const geometryCoords: Array<number> = geom.getFirstCoordinate();

   this.homelocationVal = this.publicVarYourPlace.toFix(geometryCoords);
  });
 }
 cancelEditHome() {
  this.isOpenHomeEdit = false;
  this.publicVarYourPlace.removePoint();
 }
 saveEditHome() {
  // for go bak to home
  this.isOpenHomeEdit = false;
  this.publicVarYourPlace.removePoint();
 }

 YesDeleteHome() {
  // remove point by api
  this.publicVarYourPlace.isExistHome = false;
  this.publicVarYourPlace.isOpenHome = false;
  this.openCloseHome();
 }
 NoDeleteHome() {
  this.isOpenHomeDelete = false;
 }

 dataYourPlace() {
  // const useeID = this.loginVar.loginValue.ID;
  // this.useID = this.loginVar.loginValue.ID;
  
  // http://ServerIP:Port/api/User/LoadInterestedPoints?userid=20&PointTypes=
  const userid = this.useID;
  const PointTypes = 3 ;
  const url =
   this.publicVar.baseUrl +
   ':' +
   this.publicVar.portApi +
   '/api/User/LoadInterestedPoints?userid=' +
   userid +
   '&PointTypes=' +
   PointTypes;
  console.log('urlGET==> ' + url);

  this.httpClient.get(url).toPromise().then((response) => {
   console.log('responseGET: ' + response);
   console.log('typeof' + typeof response);
   const result = JSON.parse(response.toString());
   console.log(  result[0] );
  //  const use = this.publicVar.loginDeta.ID;

  //  console.log('result==>>>>>>>>>>' + useeID);
  //  console.log('result==>>>>>>>>>>' + typeof this.publicVar.loginDeta.ID );
   console.log('*************************************');
  
  });
 }


}
