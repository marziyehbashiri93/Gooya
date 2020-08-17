import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component } from '@angular/core';
import { toStringXY } from 'ol/coordinate';
import GeoJSON from 'ol/format/GeoJSON.js';
import VectorLayer from 'ol/layer/Vector';
import { transform } from 'ol/proj';
import VectorSource from 'ol/source/Vector';
import { Icon, Stroke, Style } from 'ol/style';
import { slide } from 'src/application/shared/animation/slide';
import { IranBoundryService } from 'src/application/shared/services/iran-boundry.service';
import { MapService } from 'src/application/shared/services/map.service';
import { PublicVarService } from 'src/application/shared/services/public-var.service';
import { MeasureComponent } from '../../controller/measure/measure.component';
import { RoutResult } from './../../../shared/interface/rout-result';
import { SearchResult } from './../../../shared/interface/search-result';

@Component({
 selector: 'app-direction',
 templateUrl: './direction.component.html',
 styleUrls: [ './direction.component.scss' ],
 animations: [ slide ],
})
export class DirectionComponent {
 StringXY: string = null;
 routingError = null;
 searchResult: SearchResult = null;
 directionDistance: any = null;
 directionTime = null;
 // az kodam input search kardim
 searchFromInput;
 constructor(
  public publicVar: PublicVarService,
  public mapservice: MapService,
  public IranBoundry: IranBoundryService,
  public measure: MeasureComponent,
  private httpClient: HttpClient,
 ) {}

 openDirection(focusElement: string) {
  this.publicVar.DirectionFocusInput = focusElement;
  this.publicVar.isOpenPopupAttribute = false;
  // chon function close direction ra nemitavanim dar barkhi az component ha call konim in 2 value ra inja null mikonim
  // if (!isFromRightClick) {
  //  this.publicVar.DirectionEndPointValue = null;
  //  this.publicVar.DirectionStartPointValue = null;
  // }
  if (this.publicVar.isOpenMeasure) {
   this.measure.openMeasure();
  }
  this.publicVar.isOpenDirection = true;
  this.publicVar.mouseCursor = 'default';
  this.getClickLoctionAddress();
 }

 closeDirection() {
  this.publicVar.isOpenDirection = false;
  this.publicVar.mouseCursor = 'grab';
  // bayad baraye search badi in maqadir khali bashad
  this.publicVar.DirectionEndPointValue
   = this.publicVar.DirectionStartPointValue = this.publicVar.startpointCoord = this.publicVar.endpointCoord = null;
  this.cleanDirection();
 }

 cleanDirection() {
  this.publicVar.removeLayerByName('start-point');
  this.publicVar.removeLayerByName('end-point');
  this.publicVar.removeLayerByName('routing');
  this.directionDistance = null;
  this.directionTime = null;
 }

 nextInput(nextInput: HTMLInputElement) {
  // ---- for go next input by keypress enter ----
  if (this.publicVar.DirectionStartPointValue) {
   nextInput.focus();
  }
 }

 getClickLoctionAddress() {
  // baraye in k noqteh i ke roye map click mikonim tabdil b address shavad
  // ---- if client click on map----
  this.mapservice.map.on('singleclick', (evt: Event) => {
   // ---- if dirction open and  client fouces on start or end  point  ----
   if (
    this.publicVar.isOpenDirection &&
    (this.publicVar.DirectionFocusInput === 'start-point' || this.publicVar.DirectionFocusInput === 'end-point')
   ) {
    // ---- get client clicked coordinate ----
    this.searchResult = null;
    this.directionDistance = null;
    this.directionTime = null;
    this.publicVar.removeLayerByName('routing');
    this.publicVar.removeLayerByName(this.publicVar.DirectionFocusInput);
    const geoLocations = (evt as any).coordinate;
    this.LocationToAddress(geoLocations);
    this.setpoint(geoLocations, this.publicVar.DirectionFocusInput);
    this.searchRout();
   }
  });
 }

 LocationToAddress(geoLocation: Array<number>) {
  /* mokhtasat noqteh vared shode ra baresi mikonim dakhel iran hast ya na
    agar bod, ebteda mokhtasat ra be onvane value input qarar midahim,sepas
    1 request b api identify mifrestim ta LID va name noqteh vared shodeh ra bedast biavarim, agar natijeh
    request khali nabod yani aga len > 0 bod , angah F-name ra be onvane vorodi qarar midahim va 1 point ba estefadeh az
    function geojson2Layer dar noqteh click shodeh ijad mikonim
  */
  // ---- for check in iran
  const inside = require('point-in-polygon');
  // ---- is click position in IRAN ----
  this.publicVar.isDirectionInIran = inside(geoLocation, this.IranBoundry.Iran);
  if (this.publicVar.isDirectionInIran) {
   this.StringXY = toStringXY(geoLocation, 0);
   if (this.publicVar.DirectionFocusInput === 'start-point') {
    this.publicVar.DirectionStartPointValue = this.StringXY;
    this.publicVar.startpointCoord = geoLocation;
   } else if (this.publicVar.DirectionFocusInput === 'end-point') {
    this.publicVar.DirectionEndPointValue = this.StringXY;
    this.publicVar.endpointCoord = geoLocation;
   }
   const XYDecimal = transform(geoLocation, this.mapservice.project, 'EPSG:4326');
   const zoom = this.mapservice.map.getView().getZoom();
   const URL =
    this.publicVar.baseUrl +
    ':' +
    this.publicVar.portMap +
    '/api/map/identify?X=' +
    XYDecimal[0].toString() +
    '&Y=' +
    XYDecimal[1].toString() +
    '&ZoomLevel=' +
    zoom.toFixed(0).toString();
   console.log(URL);
   this.httpClient.get(URL).toPromise().then(response => {
    // agar line baraye maasir yabi yaft
    if (response[0]) {
     const nearFeature = response[0];
     if (nearFeature.F_NAME === '?') {
      nearFeature.F_NAME = 'عارضه بی نام';
      nearFeature.E_NAME = 'anonymous feature';
     }
     if (this.publicVar.DirectionFocusInput === 'start-point') {
      this.publicVar.DirectionStartPointValue = this.publicVar.isPersian ? response[0].F_NAME : response[0].E_NAME;
     } else if (this.publicVar.DirectionFocusInput === 'end-point') {
      this.publicVar.DirectionEndPointValue = this.publicVar.isPersian ? response[0].F_NAME : response[0].E_NAME;
     }
    }
   });
  } else {
   if (this.publicVar.DirectionFocusInput === 'start-point') {
    this.publicVar.DirectionStartPointValue = this.publicVar.startpointCoord = null;
   } else if (this.publicVar.DirectionFocusInput === 'end-point') {
    this.publicVar.DirectionEndPointValue = this.publicVar.endpointCoord = null;
   }
  }
 }

 setpoint(location: Array<number>, typePoint: string) {
  this.publicVar.removeLayerByName(typePoint);
  const styleSrc =
   typePoint === 'start-point'
    ? '../../../../assets/img/direction-start.svg'
    : '../../../../assets/img/direction-end.svg';
  const geojsonObjects = {
   type: 'FeatureCollection',
   crs: {
    type: 'name',
    properties: {
     name: 'EPSG:900913',
    },
   },
   features: [
    {
     type: 'Feature',
     geometry: {
      type: 'Point',
      coordinates: location,
     },
    },
   ],
  };
  const styles = new Style({
   image: new Icon({
    anchor: [ 0.5, 0.5 ],
    scale: 0.04,
    imgSize: [ 300, 300 ],
    src: styleSrc,
   }),
  });
  const vectorLayer = new VectorLayer({
   source: new VectorSource({
    features: new GeoJSON().readFeatures(geojsonObjects),
   }),
   style: styles,
   name: typePoint,
   zIndex: 1006,
  });
  this.mapservice.map.addLayer(vectorLayer);
 }

 changeRout() {
  this.cleanDirection();
  const empty = this.publicVar.DirectionStartPointValue;
  this.publicVar.DirectionStartPointValue = this.publicVar.DirectionEndPointValue;
  this.publicVar.DirectionEndPointValue = empty;

  const temp = this.publicVar.startpointCoord;
  this.publicVar.startpointCoord = this.publicVar.endpointCoord;
  this.publicVar.endpointCoord = temp;

  this.setpoint(this.publicVar.startpointCoord, 'start-point');
  this.setpoint(this.publicVar.endpointCoord, 'end-point');
  this.searchRout();
 }

 searchRout() {
  this.routingError = false;
  this.directionDistance = null;
  this.directionTime = null;
  if (this.publicVar.DirectionStartPointValue != null && this.publicVar.DirectionEndPointValue != null) {
   // chon aval bayad baraye orgin va destination y ro bedim reverse va join mikonim\
   const url =
    'http://apimap.ir/api/map/route?origin=' +
    transform(this.publicVar.startpointCoord, this.mapservice.project, 'EPSG:4326').reverse().join() +
    '&destination=' +
    transform(this.publicVar.endpointCoord, this.mapservice.project, 'EPSG:4326').reverse().join() +
    '&key=29e70c42798fb6381dbb2bd6f552b24ab22d48823ef903a3e82e1a01926144bc';
   console.log(url);
   this.httpClient
    .get(url)
    .toPromise()
    .then((dirResult: RoutResult) => {
     const transformCoords = [];
     console.log(dirResult);
     const coord = dirResult.result.paths[0].points.coordinates;
     const dis = dirResult.result.paths[0].distance;
     if (Math.floor(dis / 1000) > 0) {
      this.directionDistance = (dis / 1000).toString().split('.')[0] + ' کیلومتر  ';
      if (dis - Math.floor(dis / 1000) * 1000 > 0) {
       this.directionDistance =
        this.directionDistance + 'و ' + Math.round(dis - Math.floor(dis / 1000) * 1000).toString() + ' متر ';
      }
     } else {
      this.directionDistance = Math.round(dis).toString() + ' متر ';
     }
     const time = dirResult.result.paths[0].time;
     if (time >= 3600000) {
      this.directionTime = Math.round(time / 3600000).toString() + 'ساعت';
      if (time - Math.round(time / 3600000) * 3600000 > 60000) {
       this.directionTime =
        this.directionTime + ' و ' + (time - Math.round(time / 3600000) * 3600000).toString() + 'دقیقه';
      }
     } else {
      this.directionTime = Math.ceil(time / 60000).toString() + ' دقیقه';
     }
     //  this.directionTime =
     //   dirResult.result.paths[0].time >= 3600000
     //    ?
     //    : dirResult.result.paths[0].time >= 60000
     //      ? Math.round(dirResult.result.paths[0].time / 60000).toString() + 'دقیقه'
     //      : Math.round(dirResult.result.paths[0].time / 1000).toString() + 'ثانیه';

     console.log(dirResult.result.paths[0].distance);
     console.log(dirResult.result.paths[0].time);
     const stylesLine = {
      LineString: [
       new Style({
        stroke: new Stroke({
         color: 'rgba(99, 125, 171,0.9)',
         width: 7,
         zIndex: 1,
        }),
       }),
       new Style({
        stroke: new Stroke({
         color: 'rgba(66, 133, 244,0.9)',
         width: 4,
         zIndex: 2,
        }),
       }),
      ],
      MultiLineString: new Style({
       stroke: new Stroke({
        color: '#637EAB',
        lineDash: [ 6 ],
        width: 3,
       }),
      }),
     };
     const styleFunction = feature => {
      return stylesLine[feature.getGeometry().getType()];
     };

     coord.forEach(e => {
      transformCoords.push(transform(e, 'EPSG:4326', this.mapservice.project));
     });
     const geojsonObjects = {
      type: 'FeatureCollection',
      crs: {
       type: 'name',
       properties: {
        name: 'EPSG:900913',
       },
      },
      features: [
       {
        type: 'Feature',
        geometry: {
         type: 'LineString',
         coordinates: transformCoords,
        },
       },
       {
        type: 'Feature',
        geometry: {
         type: 'MultiLineString',
         coordinates: [
          [ this.publicVar.endpointCoord, transform(coord[coord.length - 1], 'EPSG:4326', this.mapservice.project) ],
          [ this.publicVar.startpointCoord, transform(coord[0], 'EPSG:4326', this.mapservice.project) ],
         ],
        },
       },
      ],
     };
     const vectorLayer = new VectorLayer({
      source: new VectorSource({
       features: new GeoJSON().readFeatures(geojsonObjects),
      }),
      style: styleFunction,
      name: 'routing',
      zIndex: 1004,
     });
     const minxy = transform(
      [ dirResult.result.paths[0].bbox[0], dirResult.result.paths[0].bbox[1] ],
      'EPSG:4326',
      this.mapservice.project,
     );
     const maxxy = transform(
      [ dirResult.result.paths[0].bbox[2], dirResult.result.paths[0].bbox[3] ],
      'EPSG:4326',
      this.mapservice.project,
     );
     const bbox = [ minxy[0], minxy[1], maxxy[0], maxxy[1] ];
     this.mapservice.map.getView().fit(bbox, {
      padding: [ 30, 30, 30, 30 ],
     });
     this.mapservice.map.addLayer(vectorLayer);
    })
    .catch(() => {
     this.routingError = true;
    });
  }
 }

 calcDistance(loc1: Array<number>, loc2: Array<number>) {
  // mohasebeh fasle orgin/destination k karbar click kardeh ba mabda masiryabi
  return Math.sqrt(Math.pow(loc2[0] - loc1[0], 2) + Math.pow(loc2[1] - loc1[1], 2));
 }

 search(input: HTMLInputElement) {
  this.routingError = null;
  console.log('search');
  // search baraye yaftan mabda ya maqsad
  input.focus();
  this.publicVar.removeLayerByName(input.id);
  this.publicVar.removeLayerByName('routing');
  this.directionDistance = null;
  this.directionTime = null;
  this.searchFromInput = input.id;
  let searchLang;
  if (/[0-9]/.test(input.value)) {
   searchLang = this.publicVar.isPersian ? 'fa' : 'en';
  } else {
   searchLang = /^[a-zA-Z]+$/.test(input.value) ? 'en' : 'fa';
  }
  if (input.value.length >= 2) {
   const mapCenterTransform: Array<number> = transform(
    this.mapservice.map.getView().getCenter(),
    this.mapservice.project,
    'EPSG:4326',
   );
   const headers = new HttpHeaders().set('Accept', 'application/json').set('Content-Type', 'application/json');
   const url = `http://apimap.ir/api/map/search?q=${input.value}&lat=${mapCenterTransform[1].toString()}&lon=${mapCenterTransform[0].toString()}&key=29e70c42798fb6381dbb2bd6f552b24ab22d48823ef903a3e82e1a01926144bc&language=${searchLang}`;

   this.httpClient
    .get(url, { headers: headers })
    .toPromise()
    .then((results: any) => {
     if (results.status === 200 && results.result) {
      this.searchResult = results.result;
     }
    })
    .catch(() => {
     if (this.publicVar.isPersian) {
      alert('درحال حاضرامکان جستجو وجود ندارد.');
     } else {
     }
    });
   console.log(url);
  }
 }

 selectResult(item: SearchResult) {
  console.log(item.location);
  this.publicVar.removeLayerByName('iconClickSearch');
  const center = transform([ item.location[1], item.location[0] ], 'EPSG:4326', this.mapservice.project);
  this.mapservice.map.getView().animate({
   center,
   zoom: 17,
   duration: 2000,
  });
  this.setpoint(center, this.searchFromInput);
  if (this.searchFromInput === 'start-point') {
   this.publicVar.DirectionStartPointValue = item.name;
   this.publicVar.startpointCoord = center;
  } else if (this.searchFromInput === 'end-point') {
   this.publicVar.DirectionEndPointValue = item.name;
   this.publicVar.endpointCoord = center;
  }
  this.searchResult = null;

  this.searchRout();
 }

 clearDirInput(event) {
  // pak kardan meqdar iput va rout ba backspace
  this.searchResult = null;
  if (event.keyCode === 8) {
   this.publicVar.removeLayerByName(event.target.id);
   this.publicVar.removeLayerByName('routing');
   this.directionDistance = null;
   this.directionTime = null;
   if (event.target.id === 'start-point') {
    this.publicVar.startpointCoord = null;
   } else if (event.target.id === 'end-point') {
    this.publicVar.endpointCoord = null;
   }
  }
 }

 closeMeasure() {
  // baraye zamani k focus roye mabda va maqsad mishava measure basteh shavad
  if (this.publicVar.isOpenMeasure) {
   this.measure.openMeasure();
  }
 }
}
