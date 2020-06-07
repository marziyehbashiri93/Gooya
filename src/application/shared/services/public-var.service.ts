import GeoJSON from 'ol/format/GeoJSON';
import { Status } from './../interface/status';
import { Injectable } from '@angular/core';
import { Draw } from 'ol/interaction';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import Map from 'ol/Map';
import Overlay from 'ol/Overlay';
import { get as getProjection } from 'ol/proj';
import OSM from 'ol/source/OSM';
import VectorSource from 'ol/source/Vector';
import WMTS from 'ol/source/WMTS';
import XYZ from 'ol/source/XYZ';
import TileWMS from 'ol/source/TileWMS';

import { Fill, Stroke, Style } from 'ol/style';
import WMTSTileGrid from 'ol/tilegrid/WMTS';
import { CtientInfo } from '../interface/ctient-info';
import { DeviceInfos } from '../interface/device-info';
import { MapService } from './map.service';

// import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer';
import { bbox as bboxStrategy } from 'ol/loadingstrategy';
import { setInterval } from 'timers';
declare const prayTimes: any;
@Injectable({
 providedIn: 'root',
})
export class PublicVarService {
 constructor(private mapservice: MapService) {}

 baseUrl = 'http://45.82.138.85';
 portMap = '3000';
 portApi = '4001';
 apikey = 'apikey=ali12345';
 token: string;
 WMTSUrl = this.baseUrl + ':' + this.portMap + '/api/Map/WMTS/' + '?' + this.apikey;
 WMSUrl = this.baseUrl + ':' + this.portMap + '/api/Map/WMS/' + '?' + this.apikey;
 WMTSDayFaLayerName = 'KCE_DAY_FA';
 WMTSDayFaPoiLayerName = 'KCE_DAY_FA_POI';
 WMTSDayEnLayerName = 'KCE_DAY_EN';
 WMTSDayEnPoiLayerName = 'KCE_DAY_EN_POI';

 WMTSNightFaLayerName = 'KCE_NIGHT_FA';
 WMTSNightFaPoiLayerName = 'KCE_NIGHT_FA_POI';
 WMTSNightEnLayerName = 'KCE_NIGHT_EN';
 WMTSNightEnPoiLayerName = 'KCE_NIGHT_EN_POI';

 WMTSTerrainLayerName = 'IranDEM30m';
 WMTSOddEvenLayerName = 'ODDEVEN_AREAS';
 WMTSTrafficLayerName = 'traffic';
 WMTSRestrictedAreaLayerName = 'RESTRICTED_AREAS';

 isPersian = null;

 mouseCursor = 'grab';
 isOpenPopupLocation = false;
 isOpenReportError = false;
 isOpenMissingPlace = false;
 isOpenDirection = false;
 isOpenStreet = false;
 isOpenPopupSuccess = false;
 isOpenPopupError = false;
 isOpenMeasure = false;
 //  time = 500;
 // ----more Search ----
 isOpenMoreSearch = false;
 isOpenIntersect = false;
 isOpenPoi = false;
 isOpenCoordinate = false;
 markerSourceMoreSearch = new VectorSource();
 // ---- menu ----
 isOpenNavigation = false;
 isOpenAboutUs = false;
 //  isLabelON = true;
 isOddEvenON: boolean = false;
 isPoiON: boolean = true;
 isTerrainON: boolean = false;
 isTrafficON: boolean = false;
 isTrafficAreaON: boolean = false;
 isOpenPlaces = false;
 //  isStyleAuto = true;
 isNight = false;
 hour;
 hourSunset;
 // kodom halat style check bashad
 styleMode = 'Auto';
 isShowOptionStyle = false;
 // ---- menu ----
 // ---- contextmenu ----
 isOpenContextMenu = false;
 // ---- contextmenu ----
 // ---- Utility ----
 isOpenSearchResult = false;
 // ---- Utility ----
 // ---- Direction ----
 DirectionEndPointValue;
 DirectionStartPointValue;
 isDirectionInIran: boolean;
 DirectionFocusInput: string;
 // ---- Direction ----
 // ---- for get client information ----
 deviceInfo: DeviceInfos;
 deviceType: string;
 ipAddress: any;
 clientInfo: CtientInfo;
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
 // ----for add wmts laye to map----
 projLike = this.mapservice.project;
 projections = getProjection(this.projLike);
 projectionExtent = this.projections.getExtent();
 size = (this.projectionExtent[2] - this.projectionExtent[0]) / 256;
 resolution: Array<number> = Array.from({ length: this.mapservice.maxZoom + 1 }, (x, z) => this.size / Math.pow(2, z));
 matrixId: Array<string> = Array.from({ length: this.mapservice.maxZoom + 1 }, (x, z) => this.projLike + ':' + z);

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

 // --------------- DAY  -------------
 // poi and label
 WMTSLayerDAYFAPOI = new TileLayer({
  opacity: 1,
  source: new WMTS({
   url: this.WMTSUrl,
   layer: this.WMTSDayFaPoiLayerName,
   matrixSet: this.projLike,
   format: 'image/png8',
   projection: this.projections,
   tileGrid: new WMTSTileGrid({
    origin: [
     this.projectionExtent[0],
     this.projectionExtent[3],
    ],
    resolutions: this.resolution,
    matrixIds: this.matrixId,
    // KCE_Layer bound in geoserver
    extent: this.mapservice.extentMap,
   }),
   style: '',
   wrapX: true,
   tileLoadFunction: this.tileLoader,
  }),
  zIndex: 2,
 });
 // just label
 WMTSLayerDAYFA = new TileLayer({
  opacity: 1,
  source: new WMTS({
   attributions:
    'Tiles © <a href="https://services.arcgisonline.com/arcgis/rest/' +
    'services/Demographics/USA_Population_Density/MapServer/">ArcGIS</s>',
   url: this.WMTSUrl,
   layer: this.WMTSDayFaLayerName,
   matrixSet: this.projLike,
   format: 'image/png',
   projection: this.projections,
   tileGrid: new WMTSTileGrid({
    origin: [
     this.projectionExtent[0],
     this.projectionExtent[3],
    ],
    resolutions: this.resolution,
    matrixIds: this.matrixId,
    // KCE_Layer bound in geoserver
    extent: this.mapservice.extentMap,
   }),
   style: '',
   wrapX: true,
   tileLoadFunction: this.tileLoader,
  }),
  zIndex: 2,
 });
 // poi and label
 WMTSLayerDAYENPOI = new TileLayer({
  opacity: 1,
  source: new WMTS({
   url: this.WMTSUrl,
   layer: this.WMTSDayEnPoiLayerName,
   matrixSet: this.projLike,
   format: 'image/png',
   projection: this.projections,
   tileGrid: new WMTSTileGrid({
    origin: [
     this.projectionExtent[0],
     this.projectionExtent[3],
    ],
    resolutions: this.resolution,
    matrixIds: this.matrixId,
    // KCE_Layer bound in geoserver
    extent: this.mapservice.extentMap,
   }),
   style: '',
   wrapX: true,
   tileLoadFunction: this.tileLoader,
  }),
  zIndex: 2,
 });
 // just label
 WMTSLayerDAYEN = new TileLayer({
  opacity: 1,
  source: new WMTS({
   attributions:
    'Tiles © <a href="https://services.arcgisonline.com/arcgis/rest/' +
    'services/Demographics/USA_Population_Density/MapServer/">ArcGIS</s>',
   url: this.WMTSUrl,
   layer: this.WMTSDayEnLayerName,
   matrixSet: this.projLike,
   format: 'image/png',
   projection: this.projections,
   tileGrid: new WMTSTileGrid({
    origin: [
     this.projectionExtent[0],
     this.projectionExtent[3],
    ],
    resolutions: this.resolution,
    matrixIds: this.matrixId,
    // KCE_Layer bound in geoserver
    extent: this.mapservice.extentMap,
   }),
   style: '',
   wrapX: true,
   tileLoadFunction: this.tileLoader,
  }),
  zIndex: 2,
 });
 // --------------- night  -------------
 // ----poi and label----
 WMTSLayerNIGHTFAPOI = new TileLayer({
  opacity: 1,
  source: new WMTS({
   attributions:
    'Tiles © <a href="https://services.arcgisonline.com/arcgis/rest/' +
    'services/Demographics/USA_Population_Density/MapServer/">ArcGIS</s>',
   url: this.WMTSUrl,
   layer: this.WMTSNightFaPoiLayerName,
   matrixSet: this.projLike,
   format: 'image/png',
   projection: this.projections,
   tileGrid: new WMTSTileGrid({
    origin: [
     this.projectionExtent[0],
     this.projectionExtent[3],
    ],
    resolutions: this.resolution,
    matrixIds: this.matrixId,
    // KCE_Layer bound in geoserver
    extent: this.mapservice.extentMap,
   }),
   style: '',
   wrapX: true,
   tileLoadFunction: this.tileLoader,
  }),
  zIndex: 2,
 });
 // ----just label----
 WMTSLayerNIGHTFA = new TileLayer({
  opacity: 1,
  source: new WMTS({
   attributions:
    'Tiles © <a href="https://services.arcgisonline.com/arcgis/rest/' +
    'services/Demographics/USA_Population_Density/MapServer/">ArcGIS</s>',
   url: this.WMTSUrl,
   layer: this.WMTSNightFaLayerName,
   matrixSet: this.projLike,
   format: 'image/png',
   projection: this.projections,
   tileGrid: new WMTSTileGrid({
    origin: [
     this.projectionExtent[0],
     this.projectionExtent[3],
    ],
    resolutions: this.resolution,
    matrixIds: this.matrixId,
    // KCE_Layer bound in geoserver
    extent: this.mapservice.extentMap,
   }),
   style: '',
   wrapX: true,
   tileLoadFunction: this.tileLoader,
  }),
  zIndex: 2,
 });
 // ----poi and label----
 WMTSLayerNIGHTENPOI = new TileLayer({
  opacity: 1,
  source: new WMTS({
   attributions:
    'Tiles © <a href="https://services.arcgisonline.com/arcgis/rest/' +
    'services/Demographics/USA_Population_Density/MapServer/">ArcGIS</s>',
   url: this.WMTSUrl,
   layer: this.WMTSNightEnPoiLayerName,
   matrixSet: this.projLike,
   format: 'image/png',
   projection: this.projections,
   tileGrid: new WMTSTileGrid({
    origin: [
     this.projectionExtent[0],
     this.projectionExtent[3],
    ],
    resolutions: this.resolution,
    matrixIds: this.matrixId,
    // KCE_Layer bound in geoserver
    extent: this.mapservice.extentMap,
   }),
   style: '',
   wrapX: true,
   tileLoadFunction: this.tileLoader,
  }),
  zIndex: 2,
 });
 // ----just label----
 WMTSLayerNIGHTEN = new TileLayer({
  opacity: 1,
  source: new WMTS({
   attributions:
    'Tiles © <a href="https://services.arcgisonline.com/arcgis/rest/' +
    'services/Demographics/USA_Population_Density/MapServer/">ArcGIS</s>',
   url: this.WMTSUrl,
   layer: this.WMTSNightEnLayerName,
   matrixSet: this.projLike,
   format: 'image/png',
   projection: this.projections,
   tileGrid: new WMTSTileGrid({
    origin: [
     this.projectionExtent[0],
     this.projectionExtent[3],
    ],
    resolutions: this.resolution,
    matrixIds: this.matrixId,
    // KCE_Layer bound in geoserver
    extent: this.mapservice.extentMap,
   }),
   style: '',
   wrapX: true,
   tileLoadFunction: this.tileLoader,
  }),
  zIndex: 2,
 });
 // ----DEM----
 WMTSLayerTerrain = new TileLayer({
  opacity: 1,
  visible: true,
  source: new WMTS({
   attributions:
    'Tiles © <a href="https://services.arcgisonline.com/arcgis/rest/' +
    'services/Demographics/USA_Population_Density/MapServer/">ArcGIS</s>',
   url: this.WMTSUrl,
   layer: this.WMTSTerrainLayerName,
   matrixSet: this.projLike,
   format: 'image/png',
   projection: this.projections,
   tileGrid: new WMTSTileGrid({
    origin: [
     this.projectionExtent[0],
     this.projectionExtent[3],
    ],
    resolutions: this.resolution,
    matrixIds: this.matrixId,
    // az geoserver begirim extent ro
    extent: [
     5152078.29,
     3452021.1,
     6638063.34,
     4591795.67,
    ],
   }),
   style: '',
   wrapX: true,
   tileLoadFunction: this.tileLoader,
  }),
  zIndex: 5,
 });
 // ----TraffidArea----
 WMTSLayerRestrictedArea = new TileLayer({
  opacity: 1,
  source: new WMTS({
   attributions:
    'Tiles © <a href="https://services.arcgisonline.com/arcgis/rest/' +
    'services/Demographics/USA_Population_Density/MapServer/">ArcGIS</s>',
   url: this.WMTSUrl,
   layer: this.WMTSRestrictedAreaLayerName,
   matrixSet: this.projLike,
   format: 'image/png',
   projection: this.projections,
   tileGrid: new WMTSTileGrid({
    origin: [
     this.projectionExtent[0],
     this.projectionExtent[3],
    ],
    resolutions: this.resolution,
    matrixIds: this.matrixId,
    // az geoserver begirim extent ro
    extent: [
     5152078.29,
     3452021.1,
     6638063.34,
     4591795.67,
    ],
   }),
   style: '',
   wrapX: true,
   tileLoadFunction: this.tileLoader,
  }),
  zIndex: 4,
 });

 // ----oddEvenArea----
 WMTSLayerOddEvenArea = new TileLayer({
  opacity: 1,
  source: new WMTS({
   attributions:
    'Tiles © <a href="https://services.arcgisonline.com/arcgis/rest/' +
    'services/Demographics/USA_Population_Density/MapServer/">ArcGIS</s>',
   url: this.WMTSUrl,
   layer: this.WMTSOddEvenLayerName,
   matrixSet: this.projLike,
   format: 'image/png',
   projection: this.projections,
   tileGrid: new WMTSTileGrid({
    origin: [
     this.projectionExtent[0],
     this.projectionExtent[3],
    ],
    resolutions: this.resolution,
    matrixIds: this.matrixId,
    // az geoserver begirim extent ro
    extent: [
     5016353.97,
     4251739.56,
     5731325.03,
     4517514.12,
    ],
   }),
   style: '',
   wrapX: true,
   tileLoadFunction: this.tileLoader,
  }),
  zIndex: 4,
 });
 // ----Traffic----
 WMTSLayerTraffic = new TileLayer({
  source: new TileWMS({
   url: this.WMSUrl,
   params: {
    LAYERS: [
     this.WMTSTrafficLayerName,
    ],
    TILED: true,
    WIDTH: 265,
    HEIGHT: 256,
   },
   serverType: 'geoserver',
   transition: 0,
  }),
  zIndex: 4,
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
 // ----label for google satellite----
 SatelliteOverlayFA = new TileLayer({
  opacity: 1,
  source: new WMTS({
   attributions:
    'Tiles © <a href="https://services.arcgisonline.com/arcgis/rest/' +
    'services/Demographics/USA_Population_Density/MapServer/">ArcGIS</s>',
   url: this.WMTSUrl,
   layer: 'NETWORK_SP5',
   matrixSet: this.projLike,
   format: 'image/png',
   projection: this.projections,
   tileGrid: new WMTSTileGrid({
    origin: [
     this.projectionExtent[0],
     this.projectionExtent[3],
    ],
    resolutions: this.resolution,
    matrixIds: this.matrixId,
    // az geoserver begirim extent ro
    extent: [
     4902831.14,
     2884211.38,
     20037508.34,
     4833345.25,
    ],
   }),
   style: 'Gooya2018Q3_V2_New:GOOGLE_LABEL_FA',
   wrapX: true,
   tileLoadFunction: this.tileLoader,
  }),
  zIndex: 2,
 });
 SatelliteOverlayEN = new TileLayer({
  opacity: 1,
  source: new WMTS({
   attributions:
    'Tiles © <a href="https://services.arcgisonline.com/arcgis/rest/' +
    'services/Demographics/USA_Population_Density/MapServer/">ArcGIS</s>',
   url: this.WMTSUrl,
   layer: 'NETWORK_SP5',
   matrixSet: this.projLike,
   format: 'image/png',
   projection: this.projections,
   tileGrid: new WMTSTileGrid({
    origin: [
     this.projectionExtent[0],
     this.projectionExtent[3],
    ],
    resolutions: this.resolution,
    matrixIds: this.matrixId,
    // az geoserver begirim extent ro
    extent: [
     4902831.14,
     2884211.38,
     20037508.34,
     4833345.25,
    ],
   }),
   style: 'Gooya2018Q3_V2_New:GOOGLE_LABEL_EN',
   wrapX: true,
   tileLoadFunction: this.tileLoader,
  }),
  zIndex: 2,
 });

 status: Status;

 tileLoader(tile, src) {
  const client = new XMLHttpRequest();
  client.open('GET', src);
  // client.setRequestHeader('Authorization', 'Bearer ' + window.location.host);
  // client.setRequestHeader('Access-Control-Allow-Origin', '*');
  client.responseType = 'arraybuffer';
  client.onload = function() {
   if (this.status === 200) {
    const arrayBufferView = new Uint8Array(this.response);
    const blob = new Blob(
     [
      arrayBufferView,
     ],
     { type: 'image/png' },
    );
    // console.log(src);
    // console.log(blob.size);
    const urlCreator = window.URL; // || window.webkitURL;
    const imageUrl = urlCreator.createObjectURL(blob);
    tile.getImage().src = imageUrl;
    //  tile.getImage().src = src;
   }
  };
  client.send();
 }

 removeAllLayers(map: Map) {
  let layer;
  const layerArray = map.getLayers().getArray();
  let len = layerArray.length;
  while (len > 0) {
   layer = layerArray[len - 1];
   if (
    layer.get('name') !== 'searchMarker' &&
    layer.get('name') !== 'start-point' &&
    layer.get('name') !== 'end-point' &&
    layer.get('name') !== 'routing'
   ) {
    map.removeLayer(layer);
   }
   len = len - 1;
  }
 }

 wichLayerAdd(
  map,
  styleStatus,
  PersianStatus,
  poiStatus,
  terrainStatus,
  OddEvenStatus,
  trafficAreaStatus,
  trafficStatus,
 ) {
  // console.log('wichLayerAdd');
  if (styleStatus === 'Auto') {
   const time = new Date();
   const pray = prayTimes.getTimes(time, [
    this.clientInfo.longitude,
    this.clientInfo.latitude,
   ]);
   console.log(pray);
   this.hour = time.getHours();
   this.hourSunset = pray.sunset.split(':')[0];
   if (this.hourSunset <= this.hour) {
    this.isNight = true;
   } else {
    this.isNight = false;
   }
  }
  if (styleStatus === 'Day' || (styleStatus === 'Auto' && !this.isNight)) {
   if (PersianStatus) {
    if (poiStatus) {
     map.addLayer(this.WMTSLayerDAYFAPOI);
    } else {
     map.addLayer(this.WMTSLayerDAYFA);
    }
   } else {
    if (poiStatus) {
     map.addLayer(this.WMTSLayerDAYENPOI);
    } else {
     map.addLayer(this.WMTSLayerDAYEN);
    }
   }
  } else if (styleStatus === 'Night' || (styleStatus === 'Auto' && this.isNight)) {
   if (PersianStatus) {
    if (poiStatus) {
     map.addLayer(this.WMTSLayerNIGHTFAPOI);
    } else {
     map.addLayer(this.WMTSLayerNIGHTFA);
    }
   } else {
    if (poiStatus) {
     map.addLayer(this.WMTSLayerNIGHTENPOI);
    } else {
     map.addLayer(this.WMTSLayerNIGHTEN);
    }
   }
  }

  if (terrainStatus) {
   this.mapservice.map.addLayer(this.WMTSLayerTerrain);
  }

  if (trafficAreaStatus) {
   this.mapservice.map.addLayer(this.WMTSLayerRestrictedArea);
  }
  if (trafficStatus) {
   this.mapservice.map.addLayer(this.WMTSLayerTraffic);
  }
  if (OddEvenStatus) {
   this.mapservice.map.addLayer(this.WMTSLayerOddEvenArea);
  }
 }
}
