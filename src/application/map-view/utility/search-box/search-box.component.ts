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
 searchExtent;

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
     if (results.status === 200 && results.result) {
      this.modifyResult(results.result);
      this.resultTotal = results.result;
      // bar asase an radio k checke filter mikonim result ra
      this.showResult(this.resultForm.value.TabRadio);
      this.publicVar.isOpenSearchResult = true;
      this.mapservice.map.getView().fit(this.findExtent(results.result), {
       padding: [
        30,
        30,
        30,
        30,
       ],
      });
      this.searchExtent = this.mapservice.map.getView().calculateExtent(this.mapservice.map.getSize());

      // this.addMarkerToAllResults(this.createPointcoord(this.resultTotal));
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
   if (el.h_city !== undefined && el.h_city !== '' && el.l_city !== undefined && el.l_city !== '') {
    el.h_city = ',' + el.h_city;
   }
   // if (el.l_city && el.h_city && el.l_city === el.h_city.replace(/^(شهر)/, '').trim()) {
   //  el.l_city = '';
   // }
   // if (el.l_city !== undefined) {
   //  el.l_city = el.l_city.replace(/^(شمال غرب)/, '');
   //  el.l_city = el.l_city.replace(/^(شمال شرق)/, '');
   //  el.l_city = el.l_city.replace(/^(شمال)/, '');
   //  el.l_city = el.l_city.replace(/^(جنوب شرق)/, '');
   //  el.l_city = el.l_city.replace(/^(جنوب غرب)/, '');
   //  el.l_city = el.l_city.replace(/^(جنوب)/, '');
   //  el.l_city = el.l_city.replace(/^(شرق)/, '');
   //  el.l_city = el.l_city.replace(/^(غرب)/, '');
   // }
  });
 }
 // ----filter result bar asaseh tab ha  ----
 showResult(id) {
  this.publicVar.removeLayerByName('search');
  this.removeMarkerToResult('iconClickSearch');
  this.SearchResults = null;
  console.log(this.SearchResults);

  if (id !== 'allTabRadio') {
   if (id === 'streetTabRadio') {
    this.SearchResults = this.resultTotal.filter(arr => arr.type === 'street');
   } else if (id === 'pointTabRadio') {
    this.SearchResults = this.resultTotal.filter(arr => arr.type === 'poi');
   } else if (id === 'IntersectionTabRadio') {
    this.SearchResults = this.resultTotal.filter(arr => arr.type === 'crossing');
   }
  } else {
   this.SearchResults = this.resultTotal;
  }
  console.log(this.SearchResults);
  if (this.SearchResults[0]) {
   this.addMarkerToAllResults(this.createPointcoord(this.SearchResults));
   if (
    JSON.stringify(this.mapservice.map.getView().calculateExtent(this.mapservice.map.getSize())) !=
    JSON.stringify(this.searchExtent)
   ) {
    this.mapservice.map.getView().fit(this.findExtent(this.SearchResults), {
     padding: [
      30,
      30,
      30,
      30,
     ],
    });
   }
  }
 }
 // ---- baclick roye natayej search b location on miravad  ----
 GoToLocation(i) {
  this.publicVar.removeLayerByName('iconClickSearch');
  const center = this.declareXYlocation(this.SearchResults[i].location);
  console.log(center);
  // this.mapservice.map.getView().animate({
  //  center,
  //  zoom: 17,
  //  duration: 2000,
  // });
  this.flyTo(center, function(){});
  this.addMarkerToResult(i, 'iconClickSearch');
 }
 // animation openlayer baraye gotolocation
 flyTo(location, done) {
  const duration = 2000;
  const view = this.mapservice.map.getView();
  const center = view.getCenter();
  const zoom = view.getZoom();
  const distance = Math.sqrt(Math.pow(center[0] - location[0], 2) + Math.pow(center[1] - location[1], 2)) / 1000;
  let parts = 3;
  let called = false;
  function callback(complete){
   --parts;
   if (called) {
    return;
   }
   if (parts === 0 || !complete) {
    called = true;
    done(complete);
   }
  }
  // argar baray avalin bar click mikonad animate nadashteh bashad,baraye hamin extent map ro az kol search resual migirim va ba extent alan moqayeseh mikonim
  const isFirstClick =
   JSON.stringify(view.calculateExtent(this.mapservice.map.getSize())) == JSON.stringify(this.searchExtent)
    ? true
    : false;
  // aya jaye k click mokonim ba mokhtasat felimon yaki hast ya na
  if (JSON.stringify(center) != JSON.stringify(location)) {
   view.animate(
    {
     center: location,
     duration: duration,
    },
    callback,
   );
   view.animate(
    {
     zoom:
      distance > 10
       ? zoom > 12 && !isFirstClick ? (distance > 30 ? (distance > 60 ? zoom - 5 : zoom - 2) : zoom - 1) : zoom
       : zoom,
     duration: duration / 2,
    },
    {
     zoom: 15,
     duration: duration,
    },
    callback,
   );
  }
 }

 // ---- for add point when search ----
 addMarkerToAllResults(geoJsonObj: object) {
  // for ssr
  if (isPlatformBrowser(this.platformId)) {
   const markerStyle = {
    Point: new Style({
     image: new Icon({
      anchor: [
       0.5,
       0.5,
      ],
      scale: 0.25,
      imgSize: [
       28,
       28,
      ],
      src: '../../../../assets/img/icon-search-result.svg',
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
   const vectorLayer = new VectorLayer({
    source: vectorSource,
    style: styleFunction,
    name: 'search',
    zIndex: 1008,
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
    srcImage = '../../../../assets/img/icon-search-hover.svg';
   } else {
    srcImage = '../../../../assets/img/icon-search-click.svg';
   }
   const iconStyle = new Style({
    image: new Icon({
     anchor: [
      0.4,
      0.8,
     ],
     scale: 1,
     imgSize: [
      30,
      36,
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
 removeMarkerToResult(name = 'iconHoverSearch') {
  this.publicVar.removeLayerByName(name);
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
   Math.min.apply(Math.min, locationX),
   Math.min.apply(Math.min, locationY),
   Math.max.apply(Math.max, locationX),
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
 gotoDirection(location, name) {
  this.closeSearch();
  console.log(location);
  this.publicVar.removeLayerByName('iconHoverSearch');
  this.publicVar.removeLayerByName('iconClickSearch');

  const coord = this.declareXYlocation(location);
  console.log(coord);
  this.publicVar.endpointCoord = coord;
  this.direction.openDirection('end-point');
  this.publicVar.DirectionEndPointValue = name;
  this.direction.setpoint(coord, 'end-point');

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
