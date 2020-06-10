import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, Inject, OnInit, PLATFORM_ID, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import Feature from 'ol/Feature';
import GeoJSON from 'ol/format/GeoJSON.js';
import Point from 'ol/geom/Point';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { transform } from 'ol/proj';
import { Circle as CircleStyle, Fill, Icon, Stroke, Style } from 'ol/style';
import { slide } from 'src/application/shared/animation/slide';
import { SearchResult } from 'src/application/shared/interface/search-result';
import { MapService } from 'src/application/shared/services/map.service';
import { PublicVarService } from 'src/application/shared/services/public-var.service';
import { DirectionComponent } from '../direction/direction.component';

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
 searchForm: FormGroup;
 resultForm: FormGroup;
 SearchResults: Array<SearchResult>;
 showError;
 resultTotal;
 //searchFilter
 constructor(
  // ---- for ssr  ----
  @Inject(PLATFORM_ID) private platformId: Object,
  private mapservice: MapService,
  public publicVar: PublicVarService,
  private httpClient: HttpClient,
  public direction: DirectionComponent,
 ) {}

 ngOnInit() {
  this.searchForm = new FormGroup({
   TabSearch: new FormControl('', Validators.minLength(3)),
  });
  this.resultForm = new FormGroup({
   TabRadio: new FormControl('allTabRadio'),
  });
 }

 Search() {
  let searchLang;
  const searchTxt = this.searchForm.value.TabSearch;
  this.publicVar.isOpenPopupAttribute = false;
  this.cleanSearch();
  // ba kodam zaban search konim agar adad bod bar asase zaban site search shavad,dar qeyre in sorat tashkhis dadeh shavad zaban chist
  if (/[0-9]/.test(searchTxt)) {
   console.log('num');
   if (this.publicVar.isPersian) {
    searchLang = 'fa';
   } else {
    searchLang = 'en';
   }
  } else {
   if (/^[a-zA-Z]+$/.test(searchTxt)) {
    searchLang = 'en';
   } else {
    searchLang = 'fa';
   }
  }
  if (searchTxt.length >= 3) {
   const mapCenterTransform: Array<number> = transform(
    this.mapservice.map.getView().getCenter(),
    this.mapservice.project,
    'EPSG:4326',
   );
   this.httpClient
    .get(
     'http://apimap.ir/api/map/search?q=' +
      searchTxt +
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
      this.modifyResult(results.result);
      this.resultTotal = results.result;
      // bar asase an radio k checke filter mikonim result ra
      this.showResult(this.resultForm.value.TabRadio);
      this.publicVar.isOpenSearchResult = true;
      this.mapservice.map.getView().fit(this.findExtent(results.result),{padding: [30, 30, 30, 30]});
      this.addMarkerToAllResults(this.createPointcoord(this.resultTotal));
      if (this.resultForm.value.TabRadio !== 'allTabRadio') {
       //  this.addMarkerToAllResults(this.createPointcoord(this.SearchResults), 'searchFilter');
      }
     } else {
      console.log('error');
      this.showError = true;
      this.publicVar.isOpenSearchResult = true;
     }
    });
  }
 }
 // ---- hazf shomal jonob va ,... va hamcnin h-city haye h ba l-city yeksanan  ----
 modifyResult(obj: Array<SearchResult>) {
  obj.forEach(el => {
   if (el.l_city && el.h_city && el.l_city === el.h_city.replace(/^(شهر)/, '').trim()) {
    el.l_city = '';
   }
   if (el.l_city !== undefined) {
    el.l_city = el.l_city.replace(/^(شمال غرب)/, '');
    el.l_city = el.l_city.replace(/^(شمال شرق)/, '');
    el.l_city = el.l_city.replace(/^(شمال)/, '');
    el.l_city = el.l_city.replace(/^(جنوب شرق)/, '');
    el.l_city = el.l_city.replace(/^(جنوب غرب)/, '');
    el.l_city = el.l_city.replace(/^(جنوب)/, '');
    el.l_city = el.l_city.replace(/^(شرق)/, '');
    el.l_city = el.l_city.replace(/^(غرب)/, '');
   }
   if (el.h_city !== undefined && el.h_city !== '' && el.l_city !== undefined && el.l_city !== '') {
    el.h_city = ',' + el.h_city;
   }
  });
 }
 // ----filter result bar asaseh tab ha  ----
 showResult(id) {
  this.publicVar.removeLayerByName('searchFilter');
  if (id !== 'allTabRadio') {
   if (id === 'streetTabRadio') {
    this.SearchResults = this.resultTotal.filter(arr => arr.type === 'street');
   } else if (id === 'pointTabRadio') {
    this.SearchResults = this.resultTotal.filter(arr => arr.type === 'poi');
   } else if (id === 'IntersectionTabRadio') {
    this.SearchResults = this.resultTotal.filter(arr => arr.type === 'crossing');
   }

   this.addMarkerToAllResults(this.createPointcoord(this.SearchResults), 'searchFilter');
  } else {
   this.SearchResults = this.resultTotal;
  }
  console.log(this.mapservice.map.getLayers());
 }
 // ---- baclick roye natayej search b location on miravad  ----
 GoToLocation(i) {
  // this.markerSource.clear();
  this.publicVar.removeLayerByName('iconClickSearch');
  const center = this.declareXYlocation(this.SearchResults[i].location);
  console.log(center);
  // // this.addMarker(center);
  this.mapservice.map.getView().animate({
   center,
   zoom: 17,
   duration: 2000,
  });

  this.addMarkerToResult(i, 'iconClickSearch');
 }
 // ---- for add point when search ----
 addMarkerToAllResults(geoJsonObj: object, names = 'search') {
  // for ssr
  if (isPlatformBrowser(this.platformId)) {
   let markerStyle;
   if (names === 'search') {
    markerStyle = {
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
   } else {
    markerStyle = {
     Point: new Style({
      image: new Icon({
       anchor: [
        0.5,
        0.5,
       ],
       scale: 0.2,
       imgSize: [
        96,
        96,
       ],
       src: '../../../../assets/img/searchFilter.svg',
      }),
     }),
    };
   }
   const styleFunction = feature => {
    return [
     markerStyle[feature.getGeometry().getType()],
    ];
   };
   const vectorSource = new VectorSource({
    features: new GeoJSON().readFeatures(geoJsonObj),
   });
   console.log('geoJsonObj');
   console.log(geoJsonObj);

   //  console.log(vectorSource);
   const vectorLayer = new VectorLayer({
    source: vectorSource,
    style: styleFunction,
    name: names,
    zIndex: names === 'search' ? 1008 : 1009,
   });
   this.mapservice.map.addLayer(vectorLayer);
  }
 }
 // ---- for add or remve  point when click/hover to result----
 addMarkerToResult(i, nameLayer = 'iconHoverSearch') {
  if (isPlatformBrowser(this.platformId)) {
   const location = this.declareXYlocation(this.SearchResults[i].location);
   const iconFeature = new Feature({
    geometry: new Point(location),
   });
   let srcImage;
   if (nameLayer === 'iconHoverSearch') {
    srcImage = '../../../../assets/img/icon-search.svg';
   } else {
    srcImage = '../../../../assets/img/icon-search-click.svg';
   }
   const iconStyle = new Style({
    image: new Icon({
     anchor: [
      0.36,
      1,
     ],
     scale: 0.2,
     imgSize: [
      161,
      161,
     ],
     src: srcImage,
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
    name: nameLayer,
    zIndex: 1009,
   });
   this.mapservice.map.addLayer(vectorLayer);
  }
 }
 removeMarkerToResult(i) {
  this.publicVar.removeLayerByName('iconHoverSearch');
 }
 // ---- find extent and fit map to extent  ----
 findExtent(obj: Array<SearchResult>) {
  const locationX = [];
  const locationY = [];
  obj.forEach((el: SearchResult) => {
   locationX.push(this.declareXYlocation(el.location)[0]);
   locationY.push(this.declareXYlocation(el.location)[1]);
  });
  return [
   Math.min.apply(Math.min, locationX) ,
   Math.min.apply(Math.min, locationY) ,
   Math.max.apply(Math.max, locationX) ,
   Math.max.apply(Math.max, locationY),
  ];
 }
 // ---- create array from point coordinate to use for layer  ----
 createPointcoord(obj: Array<SearchResult>) {
  const featureArray = [];
  obj.forEach((el: SearchResult) => {
   const coord = this.declareXYlocation(el.location);
   featureArray.push({
    type: 'Feature',
    geometry: {
     type: 'Point',
     coordinates: coord,
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
  return geojsonObject;
 }
 gotoDirection(location) {
  this.closeSearch();
  console.log(location)
  this.publicVar.removeLayerByName('iconHoverSearch');
  const coord = this.declareXYlocation(location)
  setTimeout(e => {
   this.direction.openDirection('start-point');
   this.direction.getClickLoctionAddress();
   this.direction.LocationToAddress(coord);
   this.direction.setpoint(coord, 'start-point');
  }, 300);
  this.mapservice.map.getView().setCenter(coord);
 }
 closeSearch() {
  this.publicVar.isOpenSearchResult = false;
  this.searchForm.reset();
  this.cleanSearch();
 }
 cleanSearch() {
  this.SearchResults = null;
  this.resultTotal = null;
  this.showError = null;

  this.publicVar.removeLayerByName('search');
  this.publicVar.removeLayerByName('searchFilter');
  this.publicVar.removeLayerByName('iconClickSearch');
 }
 // location migirad tabdil mikonad ,chon dar bakhshe location x,y jabaja mishid intori neveshtim in func ro
 declareXYlocation(location) {
  let Y;
  let X;
  if (location[0] < location[1]) {
   Y = location[0];
   X = location[1];
  } else {
   Y = location[1];
   X = location[0];
  }
  return transform(
   [
    X,
    Y,
   ],
   'EPSG:4326',
   this.mapservice.project,
  );
 }
}
