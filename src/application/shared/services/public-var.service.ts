import { Injectable } from '@angular/core';
import { Draw } from 'ol/interaction';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import Map from 'ol/Map';
import Overlay from 'ol/Overlay';
import { get as getProjection } from 'ol/proj';
import OSM from 'ol/source/OSM';
import TileWMS from 'ol/source/TileWMS';
import VectorSource from 'ol/source/Vector';
import WMTS from 'ol/source/WMTS';
import XYZ from 'ol/source/XYZ';
import { Fill, Stroke, Style } from 'ol/style';
import WMTSTileGrid from 'ol/tilegrid/WMTS';
import { CtientInfo } from '../interface/ctient-info';
import { DeviceInfos } from '../interface/device-info';
import { Status } from './../interface/status';
import { MapService } from './map.service';
import { SearchResult } from '../interface/search-result';

@Injectable({
 providedIn: 'root',
})
export class PublicVarService {
 constructor(private mapservice: MapService) {}

 baseUrl = 'http://45.82.138.85';
 portMap = '3000';
 portApi = '4001';
 apikey = 'apikey=ali12345';
 //  token: string;
 WMTSUrl = this.baseUrl + ':' + this.portMap + '/api/Map/WMTS/' + '?' + this.apikey;
 WMSUrl = this.baseUrl + ':' + this.portMap + '/api/Map/WMS/' + '?' + this.apikey;
 WMTSDayFaLayerName = 'KCE_DAY_FA';
 //  WMTSDayFaPoiLayerName = 'KCE_DAY_FA_POI';
 WMTSDayFaPoiLayerName = 'KCE_DAY_FA_TRAFFIC';
 WMTSDayEnLayerName = 'KCE_DAY_EN';
 WMTSDayEnPoiLayerName = 'KCE_DAY_EN_POI';
 WMTSNightFaLayerName = 'KCE_NIGHT_FA';
 WMTSNightFaPoiLayerName = 'KCE_NIGHT_FA_POI';
 WMTSNightEnLayerName = 'KCE_NIGHT_EN';
 WMTSNightEnPoiLayerName = 'KCE_NIGHT_EN_POI';
 WMTSTerrainLayerName = 'IranDEM30m';
 WMTSOddEvenLayerName = 'ODDEVEN_AREAS';
 WMTSTrafficLayerName = 'TRAFFIC';
 WMTSRestrictedAreaLayerName = 'RESTRICTED_AREAS';
 WMTSSatelliteOverlayLayerName = 'NETWORK_SP5';
 isPersian = null;

 mouseCursor = 'grab';
 isOpenPopupLocation = false;
 isOpenReportError = false;
 isOpenMissingPlace = false;
 isOpenDirection = false;
 isOpenPopupSuccess = false;
 isOpenPopupError = false;
 isOpenMeasure = false;
 // ---- menu ----
 isOpenNavigation = false;
 isOpenAboutUs = false;
 isOddEvenON: boolean = false;
 isPoiON: boolean = true;
 isTerrainON: boolean = false;
 isTrafficON: boolean = true;
 isTrafficHelpON: boolean = false;
 isTrafficAreaON: boolean = false;
 isOpenPlaces = false;

 isNight = false;
 // kodom halat style check bashad
 styleMode = 'Day';
 isShowOptionStyle = false;
 // ---- menu ----
 // ---- contextmenu ----
 isOpenContextMenu = false;
 // ---- contextmenu ----
 // ---- Utility ----
 isOpenSearchResult = false;
 SearchResults: Array<SearchResult>;
 // ---- Utility ----
 // ---- Direction ----
 DirectionEndPointValue;
 DirectionStartPointValue;
 isDirectionInIran: boolean;
 DirectionFocusInput: string;
 startpointCoord: Array<number>;
 endpointCoord: Array<number>;
 // ---- Direction ----
 // ---- for get client information ----
 deviceInfo: DeviceInfos;
 deviceType: string;
 ipAddress: any;
 //  clientInfo: CtientInfo;
 // ---- for get client information ----
 // ---- for missing Map ----
 missingMap: Map;
 isMissingMapInIran: boolean;
 missingMapCenter: string;
 // ---- for missing Map ----
 // ---- for error map ----
 errorMap: Map;
 isErrorMapInIran: boolean;
 errorMapCenter: string;
 // ---- for error map ----
 // ---- for mini map ----
 miniMap: Map;
 isMap = true;
 isMiniMapSatellite = true;
 // ---- for mini map ----
 // ---- login ----
 isauthenticate = false;
 isOpenLogin = false;
 isOpenMustLogin = false;
 // ---- login ----
 // ---- PopupAttribute ----
 isOpenPopupAttribute = false;
 // ---- PopupAttribute ----
 // ---- Mesuare ----
 measureLayer = new VectorLayer({
  source: new VectorSource(),
  style: new Style({
   fill: new Fill({
    color: 'rgba(255, 255, 255, 0.5)',
   }),
   stroke: new Stroke({
    color: '#0099ff',
    width: 2.5,
   }),
  }),
  zIndex: 3000,
 });
 measuringTool: Draw;
 resultMeasure = '';
 helpTooltip: Overlay;
 sketch;
 // ---- Mesuare ----
 mousePositionProject = 'EPSG:4326';
 // ---- for local storage ----
 status: Status;

 WMTSLayerTraffic = new TileLayer({
  source: new TileWMS({
   url: this.WMSUrl,
   params: {
    LAYERS: [ this.WMTSTrafficLayerName ],
    TILED: true,
    WIDTH: 265,
    HEIGHT: 256,
   },
   serverType: 'geoserver',
   transition: 0,
  }),
  zIndex: 4,
  minZoom: 10,
  maxZoom: 19,
 });
 // ----OSM----
 OSMLayer = new TileLayer({
  source: new OSM({
   crossOrigin: 'All',
  }),
  zIndex: 1,
 });
 // ----google satelite----
 SatelliteLayer = new TileLayer({
  visible: true,
  opacity: 1.0,
  source: new XYZ({
   //  url: 'http://mt0.google.com/vt/lyrs=y&hl=en&x={x}&y={y}&z={z}&s=Ga'  //----with lable ----
   url: 'http://mt1.google.com/vt/lyrs=s&hl=pl&&x={x}&y={y}&z={z}',
  }),
 });

 removeAllLayers(map: Map) {
  let layer;
  const layerArray = map.getLayers().getArray();
  let len = layerArray.length;
  while (len > 0) {
   layer = layerArray[len - 1];
   if (
    layer.get('name') !== 'start-point' &&
    layer.get('name') !== 'end-point' &&
    layer.get('name') !== 'routing' &&
    layer.get('name') !== 'search' &&
    layer.get('name') !== 'searchFilter' &&
    layer.get('name') !== 'iconClickSearch'
   ) {
    map.removeLayer(layer);
   }
   len = len - 1;
  }
 }
 removeLayerByName(name: string) {
  // const layerArray = this.mapservice.map.getLayers().getArray();
  // const len = layerArray.length;
  // for (let index = 0; index < len; index++) {
  //  if (layerArray[index].get('name') === name) {
  //   this.mapservice.map.removeLayer(layerArray[index]);
  //   break;
  //  }
  // }
  const layersToRemove = [];
  this.mapservice.map.getLayers().forEach(layer => {
   if (layer.get('name') === name) {
    layersToRemove.push(layer);
   }
  });
  const len = layersToRemove.length;
  for (let i = 0; i < len; i++) {
   this.mapservice.map.removeLayer(layersToRemove[i]);
  }
 }
 wichLayerAdd(
  map = this.mapservice.map,
  styleStatus = this.styleMode,
  PersianStatus = this.isPersian,
  poiStatus = this.isPoiON,
  terrainStatus = this.isTerrainON,
  OddEvenStatus = this.isOddEvenON,
  trafficAreaStatus = this.isTrafficAreaON,
  trafficStatus = this.isTrafficON,
 ) {
  let NetWorkLayer;
  let LabelLayer;
  let PoiLayer;
  if (styleStatus === 'Day') {
   NetWorkLayer = trafficStatus ? 'KCE_DAY_TRAFFIC' : 'KCE_DAY';
   if (PersianStatus) {
    LabelLayer = 'LABEL_DAY_FA';
    if (poiStatus) {
     //  map.addLayer(this.WMTSLayerDAYFAPOI);
     PoiLayer = 'POI';
     map.addLayer(this.createWMTSLayer(PoiLayer, 'poi', 5, 19, 11, 'Gooya2018Q3_V2_New:POI_DAY_FA'));
    }
   } else {
    LabelLayer = 'LABEL_DAY_EN';
    if (poiStatus) {
     PoiLayer = 'POI';
     map.addLayer(this.createWMTSLayer(PoiLayer, 'poi', 5, 19, 11, 'Gooya2018Q3_V2_New:POI_DAY_EN'));
    }
   }
  } else if (styleStatus === 'Night') {
   NetWorkLayer = 'KCE_NIGHT';
   if (PersianStatus) {
    LabelLayer = 'LABEL_NIGHT_FA';
    if (poiStatus) {
     PoiLayer = 'POI';
     map.addLayer(this.createWMTSLayer(PoiLayer, 'poi', 5, 19, 11, 'Gooya2018Q3_V2_New:POI_NIGHT_FA'));
    }
   } else {
    LabelLayer = 'LABEL_NIGHT_EN';
    if (poiStatus) {
     PoiLayer = 'POI';
     map.addLayer(this.createWMTSLayer(PoiLayer, 'poi', 5, 19, 11, 'Gooya2018Q3_V2_New:POI_NIGHT_EN'));
    }
   }
  }
  map.addLayer(this.createWMTSLayer(NetWorkLayer, 'network', 2));
  map.addLayer(this.createWMTSLayer(LabelLayer, 'lebel', 5));

  if (terrainStatus) {
   map.addLayer(this.createWMTSLayer(this.WMTSTerrainLayerName, this.WMTSTerrainLayerName, 6, 14, 0));
  }
  if (trafficStatus) {
   map.addLayer(this.WMTSLayerTraffic, this.WMTSLayerTraffic, 3);
  }
  if (OddEvenStatus) {
   map.addLayer(this.createWMTSLayer(this.WMTSOddEvenLayerName, this.WMTSOddEvenLayerName, 7));
  }
  if (trafficAreaStatus) {
   map.addLayer(this.createWMTSLayer(this.WMTSRestrictedAreaLayerName, this.WMTSRestrictedAreaLayerName, 8));
  }
  map.addLayer(this.OSMLayer);
 }
 createWMTSLayer(LayerName, WMTSname = 'KCE', zIndex = 2, maxZoom = 19, minZoom = 0, style = '') {
  let extentLayer;
  if (LayerName === this.WMTSOddEvenLayerName) {
   extentLayer = [ 5016353.97, 4251739.56, 5731325.03, 4517514.12 ];
  } else if (LayerName === this.WMTSRestrictedAreaLayerName) {
   extentLayer = [ 5152078.29, 3452021.1, 6638063.34, 4591795.67 ];
  } else {
   extentLayer = this.mapservice.extentMap;
  }
  // ----for add wmts laye to map----
  const projLike = this.mapservice.project;
  const projections = getProjection(projLike);
  const projectionExtent = projections.getExtent();
  const size = (projectionExtent[2] - projectionExtent[0]) / 256;
  const resolution = Array.from({ length: this.mapservice.maxZoom + 1 }, (x, z) => size / Math.pow(2, z));
  const matrixId = Array.from({ length: this.mapservice.maxZoom + 1 }, (x, z) => projLike + ':' + z);
  return new TileLayer({
   opacity: 1,
   source: new WMTS({
    url: this.WMTSUrl,
    layer: LayerName,
    matrixSet: projLike,
    projection: projections,
    tileGrid: new WMTSTileGrid({
     origin: [ projectionExtent[0], projectionExtent[3] ],
     resolutions: resolution,
     matrixIds: matrixId,
     // KCE_Layer bound in geoserver
     extent: extentLayer,
    }),
    style: style,
    wrapX: true,
    // tileLoadFunction: tileLoader,
   }),
   zIndex: zIndex,
   minZoom: minZoom,
   maxZoom: maxZoom,
   name: WMTSname,
  });
  function tileLoader(tile, src){
   const client = new XMLHttpRequest();
   client.open('GET', src);
   client.responseType = 'arraybuffer';
   client.onload = function(){
    if (this.status === 200) {
     const arrayBufferView = new Uint8Array(this.response);
     const blob = new Blob([ arrayBufferView ], { type: 'application/openlayers' });
     const urlCreator = window.URL; // || window.webkitURL;
     const imageUrl = urlCreator.createObjectURL(blob);
     tile.getImage().src = imageUrl;
     // tile.getImage().src = src;
    }
   };
   client.send();
  }
 }
}
// resolution: Array<number> = Array.from({ length: this.mapservice.maxZoom + 1 }, (x, z) => this.size / Math.pow(2, (z+1)));
//  resolution = [
//        0.703125, 0.3515625, 0.17578125, 0.087890625,
//        0.0439453125, 0.02197265625, 0.010986328125,
//        0.0054931640625, 0.00274658203125, 0.001373291015625,
//        6.866455078125E-4, 3.4332275390625E-4, 1.71661376953125E-4,
//        8.58306884765625E-5, 4.291534423828125E-5, 2.1457672119140625E-5,
//          1.0728836059570312E-5, 5.364418029785156E-6, 2.682209014892578E-6,
//        1.341104507446289E-6, 6.705522537231445E-7, 3.3527612686157227E-7
//  ];
