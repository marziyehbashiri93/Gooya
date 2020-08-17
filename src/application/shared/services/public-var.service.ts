import { IranBoundryService } from 'src/application/shared/services/iran-boundry.service';
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
import { DeviceInfos } from '../interface/device-info';
import { Status } from './../interface/status';
import { MapService } from './map.service';
import { SearchResult } from '../interface/search-result';
import WKT from 'ol/format/WKT';
@Injectable({
 providedIn: 'root',
})
export class PublicVarService {
 constructor(private mapservice: MapService, private iranBoundry: IranBoundryService) {}

 baseUrl = 'http://45.82.138.85';
 portMap = '3000';
 portApi = '4001';
 apikey = 'apikey=ali12345';
 //  token: string;
 WMTSUrl = this.baseUrl + ':' + this.portMap + '/api/Map/WMTS/' + '?' + this.apikey;
 WMSUrl = this.baseUrl + ':' + this.portMap + '/api/Map/WMS/' + '?' + this.apikey;
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
 layerStatus = {
  osm: {
   layerName: this.OSMLayer,
   olName: 'OSM',
   zIndex: 1,
   minZoom: 0,
   maxZoom: 19,
  },
  network: {
   layerName: {
    day: 'KCE_DAY',
    dayTraffic: 'KCE_DAY_TRAFFIC',
    night: 'KCE_NIGHT',
   },
   olName: 'network',
   zIndex: 2,
   minZoom: 0,
   maxZoom: 19,
  },
  terrain: {
   layerName: 'IranDEM30m',
   olName: 'terrain',
   zIndex: 3,
   minZoom: 0,
   maxZoom: 13,
  },
  traffic: {
   layerName: 'TRAFFIC',
   olName: 'TRAFFIC',
   zIndex: 4,
   minZoom: 10,
   maxZoom: 19,
  },
  label: {
   layerName: {
    dayFa: 'LABEL_DAY_FA',
    dayEn: 'LABEL_DAY_EN',
    nightFa: 'LABEL_NIGHT_FA',
    nightEn: 'LABEL_NIGHT_EN',
   },
   olName: 'Label',
   zIndex: 5,
   minZoom: 0,
   maxZoom: 19,
  },
  poi: {
   layerName: {
    dayFa: 'LABEL_DAY_FA_POI',
    dayEn: 'LABEL_DAY_EN_POI',
    nightFa: 'LABEL_NIGHT_FA_POI',
    nightEn: 'LABEL_NIGHT_EN_POI',
   },
   olName: 'Label_POI',
   zIndex: 6,
   minZoom: 13,
   maxZoom: 19,
  },
  oddeven: {
   layerName: 'ODDEVEN_AREAS',
   olName: 'ODDEVEN_AREAS',
   zIndex: 7,
   minZoom: 10,
   maxZoom: 19,
  },
  trafficArea: {
   layerName: 'RESTRICTED_AREAS',
   olName: 'RESTRICTED_AREAS',
   zIndex: 8,
   minZoom: 10,
   maxZoom: 19,
  },
  satelliteOverlay: {
   layerName: 'NETWORK_SP5',
   olName: 'GOOGLE_LABEL_OVERLAY',
   zIndex: 3,
   minZoom: 12,
   maxZoom: 19,
   style: {
    fa: 'Gooya2018Q3_V2_New:GOOGLE_LABEL_FA',
    en: 'Gooya2018Q3_V2_New:GOOGLE_LABEL_EN',
   },
  },
 };
 WMTSLayerTraffic = new TileLayer({
  source: new TileWMS({
   url: this.WMSUrl,
   params: {
    LAYERS: [ this.layerStatus.traffic.layerName ],
    TILED: true,
    WIDTH: 265,
    HEIGHT: 256,
   },
   serverType: 'geoserver',
   transition: 0,
  }),
  zIndex: this.layerStatus.traffic.zIndex,
  minZoom: this.layerStatus.traffic.minZoom,
  maxZoom: this.layerStatus.traffic.maxZoom,
 });

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

 createCoverOSM() {
  let wkt = 'POLYGON((';
  let i = 1;
  this.iranBoundry.Iran.forEach(e => {
   if (i !== this.iranBoundry.Iran.length) {
    wkt = wkt + e.join(' ') + ' , ';
   } else {
    wkt = wkt + e.join(' ');
   }
   i++;
  });
  wkt = wkt + '))';
  const format = new WKT();
  const feature = format.readFeature(wkt);
  return new VectorLayer({
   source: new VectorSource({
    features: [ feature ],
   }),
   style: new Style({
    fill: new Fill({
     color: 'blue',
    }),
   }),
   zIndex: 1,
  });
 }

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
  this.mapservice.map.getLayers().forEach(layer => (layer.get('name') === name ? layersToRemove.push(layer) : null));
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
  let LabelLayer: string;
  // let poiLayer;
  if (styleStatus === 'Day') {
   NetWorkLayer = trafficStatus
    ? this.layerStatus.network.layerName.dayTraffic
    : this.layerStatus.network.layerName.day;
   if (PersianStatus) {
    LabelLayer = poiStatus ? this.layerStatus.poi.layerName.dayFa : this.layerStatus.label.layerName.dayFa;
   } else {
    LabelLayer = poiStatus ? this.layerStatus.poi.layerName.dayEn : this.layerStatus.label.layerName.dayEn;
   }
  } else if (styleStatus === 'Night') {
   NetWorkLayer = this.layerStatus.network.layerName.night;
   if (PersianStatus) {
    LabelLayer = this.layerStatus.label.layerName.nightFa;
    LabelLayer = poiStatus ? this.layerStatus.poi.layerName.nightFa : this.layerStatus.label.layerName.nightFa;
   } else {
    LabelLayer = poiStatus ? this.layerStatus.poi.layerName.nightEn : this.layerStatus.label.layerName.nightEn;
   }
  }
  map.addLayer(this.layerStatus.osm.layerName, this.layerStatus.osm.olName, this.layerStatus.osm.zIndex);
  map.addLayer(this.createCoverOSM(), 'coverOSM');

  map.addLayer(this.createWMTSLayer(NetWorkLayer, this.layerStatus.network.olName, this.layerStatus.network.zIndex));
  map.addLayer(
   this.createWMTSLayer(
    LabelLayer,
    LabelLayer.indexOf('POI') === -1 ? this.layerStatus.label.olName : this.layerStatus.poi.olName,
    this.layerStatus.label.zIndex,
   ),
  );

  if (terrainStatus) {
   map.addLayer(
    this.createWMTSLayer(
     this.layerStatus.terrain.layerName,
     this.layerStatus.terrain.olName,
     this.layerStatus.terrain.zIndex,
     this.layerStatus.terrain.maxZoom,
     this.layerStatus.terrain.minZoom,
    ),
   );
  }
  if (trafficStatus) {
   map.addLayer(this.WMTSLayerTraffic, this.layerStatus.traffic.olName);
  }
  if (OddEvenStatus) {
   map.addLayer(
    this.createWMTSLayer(
     this.layerStatus.oddeven.layerName,
     this.layerStatus.oddeven.olName,
     this.layerStatus.oddeven.zIndex,
     this.layerStatus.oddeven.maxZoom,
     this.layerStatus.oddeven.minZoom,
    ),
   );
  }
  if (trafficAreaStatus) {
   map.addLayer(
    this.createWMTSLayer(
     this.layerStatus.trafficArea.layerName,
     this.layerStatus.trafficArea.olName,
     this.layerStatus.trafficArea.zIndex,
     this.layerStatus.trafficArea.maxZoom,
     this.layerStatus.trafficArea.minZoom,
    ),
   );
  }
 }
 createWMTSLayer(LayerName, WMTSname = 'KCE', zIndex = 2, maxZoom = 19, minZoom = 0, style = '') {
  let extentLayer;
  if (LayerName === this.layerStatus.oddeven.layerName) {
   extentLayer = [ 5016353.97, 4251739.56, 5731325.03, 4517514.12 ];
  } else if (LayerName === this.layerStatus.trafficArea.layerName) {
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
     const blob = new Blob([ arrayBufferView ], { type: 'image/png8' });
     const urlCreator = window.URL; // || window.webkitURL;
     const imageUrl = urlCreator.createObjectURL(blob);
     tile.getImage().src = imageUrl;
     tile.getImage().src = src;
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
