import { Injectable } from '@angular/core';
import Map from 'ol/Map';
@Injectable({
 providedIn: 'root',
})
export class MapService {
 constructor() {}
 project: string = 'EPSG:900913';
 centerX: number = 6066912.25;
 centerY: number = 3763320.63;
 zoom: number = 5.45;
 minZoom: number = 5.45;
 maxZoom: number = 19;
 extentMap = [ 4901749.93, 2883764.109, 7048499.16, 4834142.98 ];

//  project: string = 'EPSG:4326';
// centerX: number = 51.4044;
// centerY: number =  35.7141;
//  extentMap =[43.91641993700006,24.756151989000045,63.421300031000044,39.87112251800005]
 map: Map = new Map({
  // to set coustom control(zoom)
  controls: [],
  pixelRatio: 1,
 });
}
