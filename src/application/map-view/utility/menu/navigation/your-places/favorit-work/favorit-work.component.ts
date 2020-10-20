import { transform } from 'ol/proj';
import { LoginInfo } from './../../../../../../shared/interface/login-info';
import { state, style, trigger } from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { MapService } from 'src/application/shared/services/map.service';
import { PublicVarService } from 'src/application/shared/services/public-var.service';
import { PublicYourPlaceVariableService } from '../public-your-place-variable.service';
import { HttpClient } from '@angular/common/http';
import { Identity } from 'src/application/shared/interface/identity';

@Component({
  selector: 'app-favorit-work',
  templateUrl: './favorit-work.component.html',
  styleUrls: ['./favorit-work.component.scss'],
  animations: [
    trigger('openCloseWork', [
      state(
        'close',
        style({
          height: '60px',
        })
      ),
      state(
        'openDontHaveWork',
        style({
          height: '146px',
        })
      ),
      state(
        'openHaveWork',
        style({
          height: '100px',
        })
      ),
      state(
        'openEditWork',
        style({
          height: '146px',
        })
      ),
    ]),
  ],
})
export class FavoritWorkComponent implements OnInit {
  // ----for home ----
  existWork = '';
  isOpenWorkEdit: boolean = false;
  isOpenWorkDelete: boolean = false;
  workAddres;
  coordPoint: Array<number>;
  favorWork: Identity;
  worklocation: Array<number>;
  worklocationVal: string;

  constructor(
    private mapservice: MapService,
    public publicVar: PublicVarService,
    public publicVarYourPlace: PublicYourPlaceVariableService,
    private httpClient: HttpClient,
  ) {
    this.haveFavorWorkData();
  }

  ngOnInit() {}

  haveFavorWorkData() {
    if (localStorage.getItem('favoritWork') !== null) {
    // let favorDeta: Identity;
    this.favorWork = JSON.parse(localStorage.getItem('favoritWork').toString());
    console.log('has favoraiteDeta');
    console.log(this.favorWork);
    console.log(typeof this.favorWork);
    this.workAddres = this.publicVar.isPersian ? this.favorWork.F_Name : this.favorWork.E_Name ;
  
    }
   }

  openCloseWork() {
    this.isOpenWorkEdit = false;
    this.isOpenWorkDelete = false;
    if (this.publicVarYourPlace.isOpenWork) {
      console.log('CloseWork');
      this.publicVarYourPlace.removePoint();
      this.publicVarYourPlace.isOpenWork = false;
    } else if (this.publicVar.isOpenPlaces) {
      console.log('OpenWork');
      if (this.publicVarYourPlace.isOpenHome) {
        this.publicVarYourPlace.isOpenHome = false;
        this.publicVarYourPlace.removePoint();
      }
      this.publicVarYourPlace.isOpenWork = true;
      if (this.publicVarYourPlace.isExistWork) {
        // this.workAddres = 'testAddres';
        setTimeout(() => {
          this.existWork = 'HaveWork';
        }, 550);
      } else {
        setTimeout(() => {
          this.existWork = 'DontHaveWork';
        }, 550);
        const Center = this.mapservice.map.getView().getCenter();
        this.coordPoint = [Center[0].toFixed(0), Center[1].toFixed(0)];
        const geom = this.publicVarYourPlace.CreatAddresFromPoint(Center[0], Center[1] );
        geom.on('change', () => {
          this.coordPoint = [ geom.getFirstCoordinate()[0].toFixed(0), geom.getFirstCoordinate()[1].toFixed(0)];
         });
      }
    }
    this.existWork = '';
  }

  addNewWork() {
    const userID: LoginInfo = JSON.parse(localStorage.getItem('login').toString());
    this.publicVarYourPlace.isExistWork = true;
    this.publicVarYourPlace.isOpenWork = false;
    const latlong = transform(this.coordPoint, this.mapservice.project, 'EPSG:4326');
    const body = {
     ID: 0,
     UserID: userID.ID,  // this.userID.ID
     Lat: latlong[1],
     Lon: latlong[0],
     PointName: 'محل کار',
     PointTypecode: 2,
    };
    console.log('BODY==>' + body.UserID);
    const URL = `${this.publicVar.baseUrl}:${this.publicVar.portApi}/api/user/SaveInterestedPoints`;
    this.httpClient.post(URL, body).toPromise().then((response) => {
     console.log('typeof' + typeof response);
     console.log('responsePOS: ' + response);
     console.log('url:' + URL);
     if (response === 'true,') {
      this.publicVarYourPlace.removePoint();
      this.openCloseWork();
     } else {
       alert ('ثبت مکان مورد نظر با مشکل مواجه شده است');
       this.publicVarYourPlace.removePoint();
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

   YesDeleteWork() {
    // remove point by api
    this.publicVarYourPlace.isExistWork = false;
    this.publicVarYourPlace.isOpenWork = false;
    this.openCloseWork();
    const URL = `${this.publicVar.baseUrl}:${this.publicVar.portApi}/api/User/DeleteInterestedPoints?id=${this.publicVarYourPlace.Id}`;
    const body = this.publicVarYourPlace.result[0];
    this.httpClient.post(URL, body).toPromise().then((response) => {
      console.log(response);
    });
    localStorage.removeItem('favoritWork');
   }
   NoDeleteWork() {
    this.isOpenWorkDelete = false;
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
      this.workAddres = 'عارضه بی نام';
     } else if ((!identy[0] || identy[0].E_Name === '?') && !this.publicVar.isPersian) {
      this.workAddres = 'anonymous feature';
     } else {
      if (this.publicVar.isPersian) {
        this.workAddres = identy[0].F_Name;
      } else {
        this.workAddres = identy[0].E_Name;
      }
     }
     const idenLocation = JSON.stringify(identy[0]);
     localStorage.setItem('favoritWork' , idenLocation );
     console.log('>>>>>>>>>>>>>>' + identy[0].F_Name);
    });
    console.log('seee==>' );
   }






}
