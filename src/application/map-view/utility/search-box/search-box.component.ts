import { Component, ElementRef, OnInit, Inject, PLATFORM_ID, ViewChild } from '@angular/core';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import VectorLayer from 'ol/layer/Vector';
import { transform } from 'ol/proj';
import VectorSource from 'ol/source/Vector';
import { Icon, Style } from 'ol/style';
import { slide } from 'src/application/shared/animation/slide';
import { SearchResult } from 'src/application/shared/interface/search-result';
import { MapService } from 'src/application/shared/services/map.service';
import { PublicVarService } from 'src/application/shared/services/public-var.service';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
@Component({
 selector: 'app-search-box',
 templateUrl: './search-box.component.html',
 styleUrls: [ './search-box.component.scss' ],
 animations: [ slide ],
})
export class SearchBoxComponent implements OnInit {
 @ViewChild('sreachTxt', { static: true })
 sreachTxt: ElementRef;
 searchUrl;
 SearchResults: Array<SearchResult>;
 resultTotal ;
 // ---- create style for search point ----
 markerSource = new VectorSource();
 svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18.21 24.5"  width="35px"   height="35px">' +
  '<path d="M9.2,0A9.18,9.18,0,0,0,0,9.16v0a9.57,9.57,0,0,0,1.7,5.4l.2.3,6.6,9.3a.75.75,0,0,0,1.05.15.54.54,0,0,0,.15-.15L16.2,15l.3-.4a9.4,9.4,0,0,0,1.7-5.4A8.9,8.9,0,0,0,9.63,0Zm0,12.2a3.1,3.1,0,1,1,3.1-3.1A3.1,3.1,0,0,1,9.2,12.2Z" transform="translate(0 0)" fill="#DB0000"/>' +
  '<circle cx="9.2" cy="9.1" r="3.1" fill="#fff"/>' +
  '</svg>';

 constructor(
  // for ssr
  @Inject(PLATFORM_ID) private platformId: Object,
  private mapservice: MapService,
  public publicVar: PublicVarService,
  // private elRef: ElementRef,
  private httpClient: HttpClient,
 ) {}

 ngOnInit() {}

 Search(sreachTxt: HTMLInputElement) {
  this.publicVar.isOpenPopupAttribute = false;
  if (sreachTxt.value.length > 0) {
   const mapCenter = this.mapservice.map.getView().getCenter();
   const mapCenterTransform: Array<number> = transform(mapCenter, this.mapservice.project, 'EPSG:4326');
   let lan;
   if (this.publicVar.isPersian) {
    lan = 'fa';
   } else {
    lan = 'en';
   }
   const url =
    'http://apimap.ir/api/map/search?q=' +
    sreachTxt.value +
    '&lat=' +
    mapCenterTransform[1].toString() +
    '&lon=' +
    mapCenterTransform[0].toString() +
    '&key=29e70c42798fb6381dbb2bd6f552b24ab22d48823ef903a3e82e1a01926144bc&' +
    'language=' +
    lan;

   this.httpClient.get(url).toPromise().then((result: Array<SearchResult>) => {
    console.log(result);
    this.SearchResults = result;
    // this.resultTotal =    this.SearchResults;
   });
   console.log(url);
   // bayad cros origin baz shavad
   this.publicVar.isOpenSearchResult = true;
   this.publicVar.isOpenMoreSearch = false;
   // barye inke aval k baz mishavad street ha chek hastand va
   //  chon az ng if estefade shode nemitavan ba document element gereft
  }
 }

 showResult(event) {
  const Results = this.SearchResults;

  if (event.target.id === 'streetTabRadio') {
   console.log('checked');
   this.resultTotal = Results.filter(arr => arr['type'] === 'street');
  } else {
   console.log('unchecked');
   this.resultTotal = Results.filter(arr => arr['type'] === 'poi');
  }
 }

 GoToLocation(i) {
  // this.markerSource.clear();
  // const resultI: SearchResult = this.resultTotal[i];
  // const Y = resultI.coordinateDocument.lat;
  // const X = resultI.coordinateDocument.lon;
  // const center = transform([ X, Y ], 'EPSG:4326', this.mapservice.project);
  // // this.mapservice.map.getView().setCenter(center);
  // // this.mapservice.map.getView().setZoom(17);
  // this.addMarker(center);
  // this.mapservice.map.getView().animate({
  //  center,
  //  zoom: 17,
  //  duration: 2000,
  // });
 }

 // ---- for add point when search ----
 addMarker(postion) {
  // for ssr
  if (isPlatformBrowser(this.platformId)) {
   const markerStyle = new Style({
    image: new Icon({
     opacity: 1,
     src: 'data:image/svg+xml,' + escape(this.svg),
    }),
   });
   const iconFeature = new Feature({
    geometry: new Point(postion),
   });
   this.markerSource.addFeature(iconFeature);
   this.mapservice.map.addLayer(
    new VectorLayer({
     source: this.markerSource,
     style: markerStyle,
     zIndex: 1002,
    }),
   );
  }
 }
 closeSearch() {
  this.publicVar.isOpenSearchResult = false;
  this.markerSource.clear();
  this.sreachTxt.nativeElement.value = null;
 }
}
