import Feature from 'ol/Feature';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, Inject, OnInit, PLATFORM_ID, ViewChild } from '@angular/core';
import GeoJSON from 'ol/format/GeoJSON.js';
import { Vector as VectorLayer } from 'ol/layer.js';
import { transform } from 'ol/proj';
import { Vector as VectorSource } from 'ol/source.js';
import { Circle as CircleStyle, Fill, Stroke, Style, Icon } from 'ol/style';
import { slide } from 'src/application/shared/animation/slide';
import { SearchResult } from 'src/application/shared/interface/search-result';
import { MapService } from 'src/application/shared/services/map.service';
import { PublicVarService } from 'src/application/shared/services/public-var.service';
import Point from 'ol/geom/Point';
@Component({
 selector: 'app-search-box',
 templateUrl: './search-box.component.html',
 styleUrls: [
  './search-box.component.scss',
 ],
 animations: [
  slide,
 ],
})
export class SearchBoxComponent implements OnInit {
 @ViewChild('sreachTxt', { static: true })
 sreachTxt: ElementRef;
 @ViewChild('allTabRadio', { static: true })
 allTabRadio: ElementRef;

 searchUrl;
 SearchResults: Array<SearchResult>;
 resultTotal;
 // ---- create style for search point ----
 svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18.21 24.5"  width="35px"   height="35px">' +
  '<path d="M9.2,0A9.18,9.18,0,0,0,0,9.16v0a9.57,9.57,0,0,0,1.7,5.4l.2.3,6.6,9.3a.75.75,0,0,0,1.05.15.54.54,0,0,0,.15-.15L16.2,15l.3-.4a9.4,9.4,0,0,0,1.7-5.4A8.9,8.9,0,0,0,9.63,0Zm0,12.2a3.1,3.1,0,1,1,3.1-3.1A3.1,3.1,0,0,1,9.2,12.2Z" transform="translate(0 0)" fill="#DB0000"/>' +
  '<circle cx="9.2" cy="9.1" r="3.1" fill="#fff"/>' +
  '</svg>';

 constructor(
  // for ssr
  @Inject(PLATFORM_ID) private platformId: Object,
  private mapservice: MapService,
  public publicVar: PublicVarService,
  private httpClient: HttpClient,
 ) {}

 ngOnInit() {}

 Search(sreachTxt: HTMLInputElement) {
  let searchLang;
  this.publicVar.isOpenPopupAttribute = false;
  this.cleanSearch();
  // ba kodam zaban search konim agar adad bod bar asase zaban site search shavad,dar qeyre in sorat tashkhis dadeh shavad zaban chist
  if (/[0-9]/.test(sreachTxt.value)) {
   console.log('num');
   if (this.publicVar.isPersian) {
    searchLang = 'fa';
   } else {
    searchLang = 'en';
   }
  } else {
   if (/^[a-zA-Z]+$/.test(sreachTxt.value)) {
    searchLang = 'en';
   } else {
    searchLang = 'fa';
   }
  }
  if (sreachTxt.value.length > 0) {
   const mapCenterTransform: Array<number> = transform(
    this.mapservice.map.getView().getCenter(),
    this.mapservice.project,
    'EPSG:4326',
   );
   this.httpClient
    .get(
     'http://apimap.ir/api/map/search?q=' +
      sreachTxt.value +
      '&lat=' +
      mapCenterTransform[1].toString() +
      '&lon=' +
      mapCenterTransform[0].toString() +
      '&key=29e70c42798fb6381dbb2bd6f552b24ab22d48823ef903a3e82e1a01926144bc&' +
      'language=' +
      searchLang,
    )
    .toPromise()
    .then((results: any) => {
     console.log(results);
     if (results.status === 200 && results.result) {
      this.resultTotal = results.result;
      //  this.SearchResults = results.result;
      this.showResult('allTabRadio');
      this.publicVar.isOpenSearchResult = true;
      this.mapservice.map.getView().fit(this.findExtent(results.result));
      this.addMarkerToAllResults(this.createPointcoord(this.resultTotal));
     } else {
      console.log('error');
     }
    });
  }
 }

 showResult(id) {
  if (id === 'streetTabRadio') {
   this.SearchResults = this.resultTotal.filter(arr => arr.type === 'street');
  } else if (id === 'pointTabRadio') {
   this.SearchResults = this.resultTotal.filter(arr => arr.type === 'poi');
  } else if (id === 'IntersectionTabRadio') {
   this.SearchResults = this.resultTotal.filter(arr => arr.type === 'crossing');
  } else {
   this.SearchResults = this.resultTotal;
  }
 }

 GoToLocation(i) {
  // this.markerSource.clear();
  const Y = this.SearchResults[i].location[1];
  const X = this.SearchResults[i].location[0];
  const center = transform(
   [
    X,
    Y,
   ],
   'EPSG:4326',
   this.mapservice.project,
  );
  console.log(center);
  // // this.addMarker(center);
  this.mapservice.map.getView().animate({
   center,
   zoom: 17,
   duration: 2000,
  });
 }
 // ---- for add point when search ----
 addMarkerToAllResults(geoJsonObj: object) {
  // for ssr
  if (isPlatformBrowser(this.platformId)) {
   const markerStyle = {
    Point: new Style({
     image: new CircleStyle({
      radius: 4,
      fill: new Fill({
       color: '#FA5B59',
      }),
      stroke: new Stroke({
       color: '#fff',
       width: 1,
      }),
     }),
    }),
   };
   const styleFunction = feature => {
    return [
     markerStyle[feature.getGeometry().getType()],
    ];
   };
   const vectorSource = new VectorSource({
    features: new GeoJSON().readFeatures(geoJsonObj),
   });
   //  console.log(vectorSource);
   const vectorLayer = new VectorLayer({
    source: vectorSource,
    style: styleFunction,
    name: 'search',
    zIndex: 1008,
   });
   this.mapservice.map.addLayer(vectorLayer);
  }
 }
 addMarkerToResult(i) {
  const location = transform(this.SearchResults[i].location, 'EPSG:4326', this.mapservice.project);
  const iconFeature = new Feature({
   geometry: new Point(location),
  });
  const iconStyle = new Style({
   image: new CircleStyle({
    radius: 14,
    fill: new Fill({
     color: '#f1c40f',
    }),
    stroke: new Stroke({
     color: '#fff',
     width: 1,
    }),
   }),
  });
  iconFeature.setStyle(iconStyle);
  const vectorSource = new VectorSource({
   features: [
    iconFeature,
   ],
  });

  const vectorLayer = new VectorLayer({
   source: vectorSource,
   name: 'iconSearch',
   zIndex: 1009,
  });

  // const vectorLayer = new VectorLayer({
  //  source: vectorSource,
  //  style: markerStyle,
  //  name: 'icon',
  //  zIndex: 1008,
  // });
  this.mapservice.map.addLayer(vectorLayer);
 }
 removeMarkerToResult(i) {
  this.publicVar.removeLayerByName('iconSearch');
 }
 // find extent and fit map to extent
 findExtent(obj: Array<SearchResult>) {
  const locationX = [];
  const locationY = [];
  obj.forEach((el: SearchResult) => {
   locationX.push(el.location[1]);
   locationY.push(el.location[0]);
  });
  const minXY = transform(
   [
    Math.min.apply(Math.min, locationX),
    Math.min.apply(Math.min, locationY),
   ],
   'EPSG:4326',
   this.mapservice.project,
  );
  const maxXY = transform(
   [
    Math.max.apply(Math.max, locationX),
    Math.max.apply(Math.max, locationY),
   ],
   'EPSG:4326',
   this.mapservice.project,
  );
  return [
   minXY[0],
   minXY[1],
   maxXY[0],
   maxXY[1],
  ];
 }
 createPointcoord(obj: Array<SearchResult>) {
  const featureArray = [];

  obj.forEach((el: SearchResult) => {
   //  coord.push( el.location.reverse());
   featureArray.push({
    type: 'Feature',
    geometry: {
     type: 'Point',
     coordinates: transform(el.location.reverse(), 'EPSG:4326', this.mapservice.project),
    },
   });
  });
  const geojsonObject = {
   type: 'FeatureCollection',
   crs: {
    type: 'name',
    properties: {
     name: 'EPSG:900913',
    },
   },
   features: featureArray,
  };
  console.log(geojsonObject);
  // return coord;
  return geojsonObject;
 }
 closeSearch() {
  this.publicVar.isOpenSearchResult = false;
  this.sreachTxt.nativeElement.value = null;
  this.cleanSearch();
 }
 cleanSearch() {
  this.SearchResults = null;
  this.resultTotal = null;
  this.publicVar.removeLayerByName('search');
 }
}
