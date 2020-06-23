import { TrafficComponent } from './../utility/menu/navigation/traffic/traffic.component';
import { Status } from './../../shared/interface/status';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { DeviceDetectorService } from 'ngx-device-detector';
import { transform } from 'ol/proj';
import View from 'ol/View';
import { fadeAnimation } from 'src/application/shared/animation/fadeAnimation';
import { CtientInfo } from 'src/application/shared/interface/ctient-info';
import { MapService } from '../../shared/services/map.service';
import { PublicVarService } from '../../shared/services/public-var.service';
@Component({
 selector: 'app-base-map',
 templateUrl: './base-map.component.html',
 styleUrls: [ './base-map.component.scss' ],
 animations: [
  fadeAnimation,
  trigger('baseMapWidth', [
   state(
    'changeWidth',
    style({
     width: 'calc(100% - 380px)',
    }),
   ),
   state(
    'dontchangeWidth',
    style({
     width: '100%',
    }),
   ),
   transition('dontchangeWidth <=>changeWidth', [ animate('0.5s') ]),
  ]),
 ],
 encapsulation: ViewEncapsulation.None,
 providers:[TrafficComponent]
})
export class BaseMapComponent implements OnInit, AfterViewInit {
 innertHeight = '100vh';
 constructor(
  public mapservice: MapService,
  public publicVar: PublicVarService,
  private httpClient: HttpClient,
  private deviceService: DeviceDetectorService,
 ) {
  // ---- windows height change by inner height browser
  this.innertHeight = window.innerHeight + 'px';
  window.addEventListener('resize', fuc => {
   this.innertHeight = window.innerHeight + 'px';
  });

  // ---- first we get ip from https://api.ipify.org?format=json ----
  this.httpClient
   .get<{ ip: string }>('https://api.ipify.org?format=json')
   .toPromise()
   .then(data => {
    this.publicVar.ipAddress = data;
   })
   .catch(err => {
    alert('cant get ip');
   })
   .then(() => {
    // ---- then send ip to http://ip-api.com/json/ and get info about ip----
    const getURl = 'https://freegeoip.app/json/' + this.publicVar.ipAddress.ip;
    this.httpClient
     .get<CtientInfo>(getURl)
     .toPromise()
     .then(userInfo => {
      this.publicVar.clientInfo = userInfo;
      console.log(userInfo);
     })
     .then(() => {
      this.addLayer();
      // this.changeStyleMap();
     });
   });

  // ---- get client infomation like ip, os , ... ----
  window.addEventListener('DOMContentLoaded', e => {
   //  get token response  //
   //  this.httpClient
   //   .post<GetTokenResponse>(this.publicVar.baseUrl + ':3000/api/Token/Create', {
   //    emailAddress: 'gooya@gmail.com',
   //    plainPassword: 'gooya',
   //   })
   //   .toPromise()
   //   .then((data) => {
   //    sessionStorage.setItem('token', data.token);
   //    this.publicVar.token = data.token;
   //   });
   this.publicVar.deviceInfo = this.deviceService.getDeviceInfo();
   const isTablet = this.deviceService.isTablet();
   const isDesktop = this.deviceService.isDesktop();
   this.publicVar.deviceType = null;
   if (isDesktop) {
    this.publicVar.deviceType = 'Desktop';
   } else if (isTablet) {
    this.publicVar.deviceType = 'Tablet';
   } else {
    this.publicVar.deviceType = 'Mobile';
   }
  });
 }

 ngOnInit() {
  this.setTarget();
  this.setView();
  this.BBOX();
 }
 ngAfterViewInit() {
  this.zoomCursor();
  this.moveCursor();
 }
 BBOX() {
  let shouldUpdate = true;
  const view = this.mapservice.map.getView();
  const updatePermalink = () => {
   if (!shouldUpdate) {
    // do not update the URL when the view was changed in the 'popstate' handler
    shouldUpdate = true;
    return;
   }
   const center = transform(view.getCenter(), this.mapservice.project, 'EPSG:4326');
   // baraye inke ba move long > 180 mishod
   let lon = center[0] % 360;
   if (lon > 180) {
    lon = lon - 360;
   } else if (lon < -180) {
    lon = 360 + lon;
   }
   const zoom = view.getZoom().toFixed(2);
   const hash =
    '#' + Math.round(center[1] * 100000) / 100000 + ',' + Math.round(lon * 100000) / 100000 + ',' + zoom + 'Z';
   const states = {
    zoom: view.getZoom(),
    center: view.getCenter(),
   };
   // zoom va center map be onvane hash zakhireh mikonem
   localStorage.setItem('hash', hash);
   // vase taqir url be sorat daynamic
   window.history.pushState(states, 'map', hash);
  };
  this.mapservice.map.on('moveend', updatePermalink);
  // restore the view state when navigating through the history, see
  // https://developer.mozilla.org/en-US/docs/Web/API/WindowEventHandlers/onpopstate
  window.addEventListener('popstate', event => {
   if (event.state === null) {
    return;
   }
   view.setCenter(event.state.center);
   view.setZoom(event.state.zoom);
   shouldUpdate = false;
  });
 }
 // ---- ol function ----
 setView() {
  let Zoom;
  let Center;
  // agar hash dashtim ya dar url zoom & xy zekr shodeh bood
  if (localStorage.getItem('hash') !== null || window.location.href.search('Z') !== -1) {
   console.log('HAS HASH');
   let hashStatic;
   let hashSplit;
   // agar url bbox darim yani karbar vared kardeh
   if (window.location.href.search('Z') !== -1) {
    const Url = window.location.href.split('/');
    const hashUrl = Url[Url.length - 1];
    hashStatic = hashUrl;
    // agar hash darim
   } else if (localStorage.getItem('hash') !== null) {
    hashStatic = localStorage.getItem('hash');
   }
   hashSplit = hashStatic.split(',');
   console.log(hashSplit);
   const lang = hashSplit[1];
   const lat = hashSplit[0].replace('#', '');
   if (lang.split('.')[0].length < 4 && lat.split('.')[0].length < 3) {
    Center = transform([ Number(lang), Number(lat) ], 'EPSG:4326', this.mapservice.project);
   } else {
    Center = [ Number(lang), Number(lat) ];
   }
   Zoom = Number(hashSplit[2].replace('Z', ''));
  } else {
   Center = [ this.mapservice.centerX, this.mapservice.centerY ];
   Zoom = this.mapservice.zoom;
  }
  const view = new View({
   projection: this.mapservice.project,
   center: Center,
   zoom: Zoom,
   maxZoom: this.mapservice.maxZoom,
   enableRotation: false,
  });
  this.mapservice.map.setView(view);
 }
 setTarget() {
  this.mapservice.map.setTarget('map');
 }

 addLayer() {
  if (localStorage.getItem('style')) {
   this.publicVar.styleMode = localStorage.getItem('style');
  }
  if (localStorage.getItem('Status')) {
   // chon result storage string bayad intori tabdil konim b boolean
   console.log('hasstroage');
   this.publicVar.isPoiON = (JSON.parse(localStorage.getItem('Status')) as Status).poi;
   this.publicVar.isOddEvenON = (JSON.parse(localStorage.getItem('Status')) as Status).oddEven;
   this.publicVar.isTrafficON = (JSON.parse(localStorage.getItem('Status')) as Status).traffic;
   this.publicVar.isTrafficAreaON = (JSON.parse(localStorage.getItem('Status')) as Status).trafficArea;
   this.publicVar.isTerrainON = (JSON.parse(localStorage.getItem('Status')) as Status).terrain;
   this.publicVar.isTrafficHelpON = this.publicVar.isTrafficON
  }
  this.publicVar.status = {
   poi: this.publicVar.isPoiON,
   terrain: this.publicVar.isTerrainON,
   oddEven: this.publicVar.isOddEvenON,
   trafficArea: this.publicVar.isTrafficAreaON,
   traffic: this.publicVar.isTrafficON,
   lan: 'FA',
  };
  if (!this.publicVar.isPersian) {
   this.publicVar.status.lan = 'EN';
  }

  this.publicVar.wichLayerAdd(
   this.mapservice.map,
   this.publicVar.styleMode,
   this.publicVar.isPersian,
   this.publicVar.isPoiON,
   this.publicVar.isTerrainON,
   this.publicVar.isOddEvenON,
   this.publicVar.isTrafficAreaON,
   this.publicVar.isTrafficON,
  );
 }

 // ---- change mouse cursor when move on map ----
 moveCursor() {
  this.mapservice.map.on('movestart', (evt: Event) => {
   if (!this.publicVar.isOpenMeasure && !this.publicVar.isOpenDirection) {
    this.publicVar.mouseCursor = 'grabbing';
   }
  });
  this.mapservice.map.on('moveend', (evt: Event) => {
   if (!this.publicVar.isOpenMeasure && !this.publicVar.isOpenDirection) {
    this.publicVar.mouseCursor = 'grab';
   }
  });
 }
 zoomCursor() {
  let oldResolution = this.mapservice.map.getView().getResolution();
  this.mapservice.map.getView().on('change:resolution', (evt: Event) => {
   const newResolution = this.mapservice.map.getView().getResolution();
   if (!this.publicVar.isOpenMeasure && !this.publicVar.isOpenDirection) {
    if (oldResolution > newResolution) {
     this.publicVar.mouseCursor = 'zoom-in';
    } else {
     this.publicVar.mouseCursor = 'zoom-out';
    }
   }
   oldResolution = newResolution;
  });
 }
 // ---- change mouse cursor when move on map ----
}

interface GetTokenResponse {
 userNotExists: boolean;
 invalidUserNameOrPassword: boolean;
 token: string;
 user: User;
}

interface User {
 id: number;
 emailAddress: string;
 plainPassword: string;
 shareCode: string;
 stamp: string;
 userInfoJson: string;
 isEmailVerified: boolean;
 isActive: boolean;
 thumbnail: string;
 createTime: Date;
}
