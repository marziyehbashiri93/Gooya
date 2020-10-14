import { state, style, trigger } from '@angular/animations';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { transform } from 'ol/proj';
import { DirectionComponent } from 'src/application/map-view/utility/direction/direction.component';
import { LoginVarService } from 'src/application/partial/login/login-var.service';
import { Identity } from 'src/application/shared/interface/identity';
import { YourPlaceInfo } from 'src/application/shared/interface/your-place-info';
import { IranBoundryService } from 'src/application/shared/services/iran-boundry.service';
import { MapService } from 'src/application/shared/services/map.service';
import { PublicVarService } from 'src/application/shared/services/public-var.service';
import { PublicYourPlaceVariableService } from '../public-your-place-variable.service';
import { LoginInfo } from './../../../../../../shared/interface/login-info';

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
 homeAddres;
 homelocation: Array<number>;
 homelocationVal: string;
 coordPoint: Array<number>;
//  resultData: YourPlaceInfo;
//  userID: LoginInfo = JSON.parse(localStorage.getItem('login').toString());
 favorDeta: Identity;

 
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
   this.haveFavorData();
 }

 ngOnInit() {
 }

 haveFavorData() {
  if (localStorage.getItem('favorit') !== null) {
  // let favorDeta: Identity;
  this.favorDeta = JSON.parse(localStorage.getItem('favorit').toString());
  console.log('has favoraiteDeta');
  console.log(this.favorDeta);
  console.log(typeof this.favorDeta);
  // setTimeout(() => {
  this.homeAddres = this.publicVar.isPersian ? this.favorDeta.F_Name : this.favorDeta.E_Name ;
    // }, 500);

  
  }
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
    // setTimeout(() => {
    // this.homeAddres = this.favorDeta.F_Name;
    // this.homeAddres = this.publicVar.isPersian ? this.favorDeta.F_Name : this.favorDeta.E_Name ;
    // // // // const homeAddres = this.favorDeta.F_Name;
    // }, 500);
    // this.homeAddres = 'اسدی ، ستارخان، منطقه 5 ، تهران';
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
    console.log(geom );
    geom.on('change', () => {
     this.coordPoint = [ geom.getFirstCoordinate()[0].toFixed(0), geom.getFirstCoordinate()[1].toFixed(0) ];
    });
   }

  }

  this.existHome = '';
  // this.publicVarYourPlace.isOpenHome = !this.publicVarYourPlace.isOpenHome;
 }




 addNewHome() {
  const userID: LoginInfo = JSON.parse(localStorage.getItem('login').toString());
  this.publicVarYourPlace.isExistHome = true;
  this.publicVarYourPlace.isOpenHome = false;
  const latlong = transform(this.coordPoint, this.mapservice.project, 'EPSG:4326');
  const body = {
   ID: 0,
   UserID: userID.ID,  // this.userID.ID
   Lat: latlong[1],
   Lon: latlong[0],
   PointName: 'خانه',
   PointTypecode: 1,
  };
  console.log('BODY==>' + body.UserID);
  const URL = `${this.publicVar.baseUrl}:${this.publicVar.portApi}/api/user/SaveInterestedPoints`;
  this.httpClient.post(URL, body).toPromise().then((response) => {
   console.log('typeof' + typeof response);
   console.log('responsePOS: ' + response);
   console.log('url:' + URL);
   if (response === 'true,') {
    this.publicVarYourPlace.removePoint();
    this.openCloseHome();
   } else {
     alert ('ثبت مکان مورد نظر با مشکل مواجه شده است');
   }
  });
  setTimeout(() => {
    this.publicVarYourPlace.dataYourPlace();
  }, 500);
  
  setTimeout(() => {
    this.setAddress();
    // this.homeAddres = this.setAddress();
    }, 700);

 }


 opendirectionHome() {
  this.homelocation = transform([ this.publicVarYourPlace.Lon, this.publicVarYourPlace.Lat ], 'EPSG:4326', this.mapservice.project);
  console.log('this.homelocation==>' + this.homelocation);
  this.publicVarYourPlace.removePoint();
  // setTimeout(e => {
    // this.closePlaces();
  // }, this.publicVar.timeUtility / 4);
  this.publicVar.isOpenPlaces = false;
  this.publicVarYourPlace.isOpenHome = false;
  setTimeout((e) => {
   this.direction.openDirection('end-point');
   this.direction.getClickLoctionAddress();
   this.direction.LocationToAddress(this.homelocation);
  }, 300);
  this.mapservice.map.getView().setCenter(this.homelocation);
 }

 openHomeEdit() {
  this.isOpenHomeEdit = true;
  this.homelocation = transform([ this.publicVarYourPlace.Lon, this.publicVarYourPlace.Lat], 'EPSG:4326', 'EPSG:900913');
  // this.homelocation = [ this.Lon, this.Lat ];
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
  const URL = `${this.publicVar.baseUrl}:${this.publicVar.portApi}/api/User/DeleteInterestedPoints?id=${this.publicVarYourPlace.Id}`;
  const body = this.publicVarYourPlace.result[0];
  console.log('urlRemove==> ' + URL);
  console.log('==>');
  console.log(typeof body);
  console.log(body);
  this.httpClient.post(URL, body).toPromise().then((response) => {
    console.log(response);
  });
  localStorage.removeItem('favorit');
 }
 NoDeleteHome() {
  this.isOpenHomeDelete = false;
 }





 setAddress() {
  const URL =
   `${this.publicVar.baseUrl}:${this.publicVar.portMap}/api/map/identify?X=${this.publicVarYourPlace.Lon.toString()}
   &Y=${this.publicVarYourPlace.Lat.toString()}
   &ZoomLevel=${this.mapservice.map.getView().getZoom().toFixed(0).toString()}`;
  console.log(URL);

  this.httpClient.get<Identity>(URL).toPromise().then((identy) => {
   console.log(typeof identy);
   if ((!identy[0] || identy[0].F_Name === '?') && this.publicVar.isPersian) {
    this.homeAddres = 'عارضه بی نام';
   } else if ((!identy[0] || identy[0].E_Name === '?') && !this.publicVar.isPersian) {
    this.homeAddres = 'anonymous feature';
   } else {
    if (this.publicVar.isPersian) {
      this.homeAddres = identy[0].F_Name;
    } else {
      this.homeAddres = identy[0].E_Name;
    }
   }
   const idenLoc = JSON.stringify(identy[0]);
   localStorage.setItem('favorit' , idenLoc );
   console.log('>>>>>>>>>>>>>>' + identy[0].F_Name);
  });
  console.log('seee==>' );
 }









}


