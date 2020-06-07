import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { toStringXY } from 'ol/coordinate';
import GeoJSON from 'ol/format/GeoJSON.js';
import { Vector as VectorLayer } from 'ol/layer.js';
import { transform } from 'ol/proj';
import { Vector as VectorSource } from 'ol/source.js';
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
 isClickHasNetwork: boolean;
 // baraye negahdari mokhtasat noqteh click shode
 startpointCoord: Array<number>;
 endpointCoord: Array<number>;

 constructor(
  public publicVar: PublicVarService,
  public mapservice: MapService,
  public IranBoundry: IranBoundryService,
  public measure: MeasureComponent,
  private httpClient: HttpClient,
 ) {}

 ngOnInit() {}

 openDirection(focusElement: string) {
  this.publicVar.DirectionFocusInput = focusElement;
  this.publicVar.isOpenPopupAttribute = false;
  // close other element
  this.publicVar.isOpenMoreSearch = false;
  // chon function close direction ra nemitavanim dar barkhi az component ha call konim in 2 value ra inja null mikonim
  this.publicVar.DirectionEndPointValue = null;
  this.publicVar.DirectionStartPointValue = null;
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
  this.startpointCoord = null;
  this.endpointCoord = null;
  this.isClickHasNetwork = null;
 }

 // ---- for go next input by keypress enter ----
 nextInput(nextInput: HTMLInputElement) {
  if (this.publicVar.DirectionStartPointValue) {
   nextInput.focus();
  }
 }
 // baraye in k noqteh i ke roye map
 getClickLoctionAddress() {
  // ---- if client click on map----
  this.mapservice.map.on('singleclick', (evt: Event) => {
   if (this.publicVar.isOpenDirection) {
    // ---- get client clicked coordinate ----
    const geoLocations = (evt as any).coordinate;

    if (this.publicVar.DirectionFocusInput === 'start-point') {
     this.removeLayerByName('start-point');
     this.setpoint(geoLocations, 'start-point');
     this.removeLayerByName('routing');
    } else if (this.publicVar.DirectionFocusInput === 'end-point') {
     this.removeLayerByName('end-point');
     this.setpoint(geoLocations, 'end-point');

     this.removeLayerByName('routing');
    }

    // ---- if client fouces on start and end  point ----
    if (this.publicVar.DirectionFocusInput === 'start-point' || this.publicVar.DirectionFocusInput === 'end-point') {
     this.LocationToAddress(geoLocations);
    }
   }
  });
 }
 setpoint(location: Array<number>, typePoint: string) {
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
   name: this.publicVar.DirectionFocusInput,
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
    this.startpointCoord = geoLocation;
   } else if (this.publicVar.DirectionFocusInput === 'end-point') {
    this.publicVar.DirectionEndPointValue = this.StringXY;
    this.endpointCoord = geoLocation;
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
   // console.log(URL);
   this.httpClient.get(URL).toPromise().then(response => {
    // agar line baraye maasir yabi yaft
    if (response[0]) {
     this.isClickHasNetwork = true;
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
    } else {
     this.isClickHasNetwork = false;
    }
   });
  } else {
   this.publicVar.isDirectionInIran = false;
   if (this.publicVar.DirectionFocusInput === 'start-point') {
    this.publicVar.DirectionStartPointValue = null;
    this.startpointCoord = null;
   } else if (this.publicVar.DirectionFocusInput === 'end-point') {
    this.publicVar.DirectionEndPointValue = null;
    this.endpointCoord = null;
   }
   this.isClickHasNetwork = null;
  }
 }

 changeRout() {
  // becuase when open dirction by right click dont work , we have to use this.openDirection()
  const empty = this.publicVar.DirectionStartPointValue;
  this.publicVar.DirectionStartPointValue = this.publicVar.DirectionEndPointValue;
  this.publicVar.DirectionEndPointValue = empty;

  const temp = this.startpointCoord;
  this.startpointCoord = this.endpointCoord;
  this.endpointCoord = temp;

  this.removeLayerByName('start-point');
  this.removeLayerByName('end-point');
  this.removeLayerByName('routing');
  this.setpoint(this.startpointCoord, 'start-point');
  this.setpoint(this.endpointCoord, 'end-point');
  this.searchRout();
 }
 searchRout() {
  if (this.publicVar.DirectionStartPointValue != null && this.publicVar.DirectionEndPointValue != null) {
   // chon aval bayad baraye orgin va destination y ro bedim reverse va join mikonim
   const url =
    'http://apimap.ir/api/map/route?origin=' +
    transform(this.startpointCoord, this.mapservice.project, 'EPSG:4326').reverse().join() +
    '&destination=' +
    transform(this.endpointCoord, this.mapservice.project, 'EPSG:4326').reverse().join() +
    '&key=29e70c42798fb6381dbb2bd6f552b24ab22d48823ef903a3e82e1a01926144bc';
   console.log(url);
   this.httpClient.get(url).toPromise().then((dirResult: RoutResult) => {
    if (dirResult.status == 200) {
     console.log(dirResult.status);

     const stylesLine1 = {
      LineString: new Style({
       stroke: new Stroke({
        color: '#4285F4',
        width: 4,
        zIndex: 2,
       }),
      }),
     };
     const stylesLine2 = {
      LineString: new Style({
       stroke: new Stroke({
        color: '#637EAB',
        width: 6,
        zIndex: 1,
       }),
      }),
     };
     const styleFunction = feature => {
      return [ stylesLine2[feature.getGeometry().getType()], stylesLine1[feature.getGeometry().getType()] ];
     };

     //  const styles = {
     //   LineString: new Style({
     //    stroke: new Stroke({
     //     color: 'green',
     //     width: 5,
     //    }),
     //   }),
     //  };
     //  const styleFunction = feature => {
     //   return styles[feature.getGeometry().getType()];
     //  };
     const transformCoords = [];
     dirResult.result.paths[0].points.coordinates.forEach(e => {
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
      ], //  type: 'Feature',
     };

     const vectorSource = new VectorSource({
      features: new GeoJSON().readFeatures(geojsonObjects),
     });
     console.log(vectorSource);
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
     this.mapservice.map.getView().fit(bbox);
     this.mapservice.map.addLayer(vectorLayer);
    } else {
    }
   });
  }
 }
 removeLayerByName(name: string) {
  const layerArray = this.mapservice.map.getLayers().getArray();
  const len = layerArray.length;
  console.log(layerArray);
  for (let index = 0; index < len; index++) {
   if (layerArray[index].get('name') === name) {
    this.mapservice.map.removeLayer(layerArray[index]);
    break;
   }
  }
 }
 // goToLocation(location){
 //   // go to xy location
 // }
}
