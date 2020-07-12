import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { toStringXY } from 'ol/coordinate';
import GeoJSON from 'ol/format/GeoJSON.js';
import { transform } from 'ol/proj';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { Icon, Stroke, Style } from 'ol/style';
import { slide } from 'src/application/shared/animation/slide';
import { IranBoundryService } from 'src/application/shared/services/iran-boundry.service';
import { MapService } from 'src/application/shared/services/map.service';
import { PublicVarService } from 'src/application/shared/services/public-var.service';
import { MeasureComponent } from '../../controller/measure/measure.component';
import { RoutResult } from './../../../shared/interface/rout-result';

@Component({
 selector: 'app-direction',
 templateUrl: './direction.component.html',
 styleUrls: [ './direction.component.scss' ],
 animations: [ slide ],
})
export class DirectionComponent implements OnInit {
 StringXY: string = null;
 routingError = null;

 constructor(
  public publicVar: PublicVarService,
  public mapservice: MapService,
  public IranBoundry: IranBoundryService,
  public measure: MeasureComponent,
  private httpClient: HttpClient,
 ) {}

 ngOnInit() {}

 openDirection(focusElement: string, isFromRightClick = false) {
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
  this.publicVar.DirectionEndPointValue = null;
  this.publicVar.DirectionStartPointValue = null;
  this.publicVar.startpointCoord = null;
  this.publicVar.endpointCoord = null;
  this.cleanDirection();
 }

 cleanDirection() {
  this.publicVar.removeLayerByName('start-point');
  this.publicVar.removeLayerByName('end-point');
  this.publicVar.removeLayerByName('routing');
 }

 // ---- for go next input by keypress enter ----
 nextInput(nextInput: HTMLInputElement) {
  if (this.publicVar.DirectionStartPointValue) {
   nextInput.focus();
  }
 }
 // baraye in k noqteh i ke roye map click mikonim tabdil b address shavad
 getClickLoctionAddress() {
  // ---- if client click on map----
  this.mapservice.map.on('singleclick', (evt: Event) => {
   if (this.publicVar.isOpenDirection) {
    // ---- get client clicked coordinate ----
    const geoLocations = (evt as any).coordinate;
    console.log('focus', this.publicVar.DirectionFocusInput);
    // ---- if client fouces on start and end  point ----
    if (this.publicVar.DirectionFocusInput === 'start-point' || this.publicVar.DirectionFocusInput === 'end-point') {
     this.publicVar.removeLayerByName('routing');
     this.publicVar.removeLayerByName(this.publicVar.DirectionFocusInput);
     this.setpoint(geoLocations, this.publicVar.DirectionFocusInput);
     this.LocationToAddress(geoLocations);
     this.searchRout();
    }
   }
  });
 }

 setpoint(location: Array<number>, typePoint: string) {
  this.publicVar.removeLayerByName(typePoint);
  let styles;
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
  if (typePoint === 'start-point') {
   styles = new Style({
    image: new Icon({
     anchor: [ 0.5, 0.5 ],
     scale: 0.08,
     imgSize: [ 300, 300 ],
     src: '../../../../assets/img/direction-start.svg',
    }),
   });
  } else if (typePoint === 'end-point') {
   styles = new Style({
    image: new Icon({
     anchor: [ 0.5, 0.5 ],
     scale: 0.08,
     imgSize: [ 300, 300 ],
     src: '../../../../assets/img/direction-end.svg',
    }),
   });
  }

  const vectorSource = new VectorSource({
   features: new GeoJSON().readFeatures(geojsonObjects),
  });
  const vectorLayer = new VectorLayer({
   source: vectorSource,
   style: styles,
   name: typePoint,
   zIndex: 1006,
  });
  this.mapservice.map.addLayer(vectorLayer);
 }

 LocationToAddress(geoLocation: Array<number>) {
  /* mokhtasat noqteh vared shode ra baresi mikonim dakhel iran hast ya na
    agar bod, ebteda mokhtasat ra be onvane value input qarar midahim,sepas
    1 request b api GetMapLIDByPoint mifrestim ta LID va name noqteh vared shodeh ra bedast biavarim, agar natijeh
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
    console.log(this.publicVar.startpointCoord);
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
      if (this.publicVar.isPersian) {
       this.publicVar.DirectionStartPointValue = response[0].F_NAME;
      } else {
       this.publicVar.DirectionStartPointValue = response[0].E_NAME;
      }
     } else if (this.publicVar.DirectionFocusInput === 'end-point') {
      if (this.publicVar.isPersian) {
       this.publicVar.DirectionEndPointValue = response[0].F_NAME;
      } else {
       this.publicVar.DirectionEndPointValue = response[0].E_NAME;
      }
     }
    }
   });
  } else {
   this.publicVar.isDirectionInIran = false;
   if (this.publicVar.DirectionFocusInput === 'start-point') {
    this.publicVar.DirectionStartPointValue = null;
    this.publicVar.startpointCoord = null;
   } else if (this.publicVar.DirectionFocusInput === 'end-point') {
    this.publicVar.DirectionEndPointValue = null;
    this.publicVar.endpointCoord = null;
   }
  }
 }

 changeRout() {
  this.publicVar.removeLayerByName('start-point');
  this.publicVar.removeLayerByName('end-point');
  this.publicVar.removeLayerByName('routing');
  // becuase when open dirction by right click dont work , we have to use this.openDirection()
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
  if (this.publicVar.DirectionStartPointValue != null && this.publicVar.DirectionEndPointValue != null) {
   // chon aval bayad baraye orgin va destination y ro bedim reverse va join mikonim\
   const url =
    'http://apimap.ir/api/map/route?origin=' +
    transform(this.publicVar.startpointCoord, this.mapservice.project, 'EPSG:4326').reverse().join() +
    '&destination=' +
    transform(this.publicVar.endpointCoord, this.mapservice.project, 'EPSG:4326').reverse().join() +
    '&key=29e70c42798fb6381dbb2bd6f552b24ab22d48823ef903a3e82e1a01926144bc';
   console.log(url);
   this.httpClient.get(url).toPromise().then((dirResult: RoutResult) => {
    const coord = dirResult.result.paths[0].points.coordinates;

    const originDistance = this.calcDistance(
     this.publicVar.startpointCoord,
     transform(coord[0], 'EPSG:4326', this.mapservice.project),
    );
    const destinationDistance = this.calcDistance(
     this.publicVar.endpointCoord,
     transform(coord[coord.length - 1], 'EPSG:4326', this.mapservice.project),
    );
    const stylesLine1 = {
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
     // return [ stylesLine2[feature.getGeometry().getType()], stylesLine1[feature.getGeometry().getType()] ];
     return stylesLine1[feature.getGeometry().getType()];
    };
    const transformCoords = [];
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

    const vectorSource = new VectorSource({
     features: new GeoJSON().readFeatures(geojsonObjects),
    });
    const vectorLayer = new VectorLayer({
     source: vectorSource,
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
   }).catch(err => {
    this.routingError = true;
    console.log('this.routingError', this.routingError);
   });
  }
 }
 // mohasebeh fasle orgin/destination k karbar click kardeh ba mabda masiryabi
 calcDistance(loc1: Array<number>, loc2: Array<number>) {
  return Math.sqrt(Math.pow(loc2[0] - loc1[0], 2) + Math.pow(loc2[1] - loc1[1], 2));
 }
 // baraye zamani k focus roye mabda va maqsad mishava measure basteh shavad
 closeMeasure() {
  if (this.publicVar.isOpenMeasure) {
   this.measure.openMeasure();
  }
 }
}
