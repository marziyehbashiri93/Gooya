import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MapService } from 'src/application/shared/services/map.service';
import { PublicVarService } from 'src/application/shared/services/public-var.service';
import Map from 'ol/Map';
import View from 'ol/View';
@Component({
 selector: 'app-mini-map',
 template: '<button class="mini-map" id="mini-map" (click)="changeMap()"></button>',
 styleUrls: [ './mini-map.component.scss' ],
 encapsulation: ViewEncapsulation.None,
})
export class MiniMapComponent implements OnInit {
 constructor(private mapservice: MapService, public publicVar: PublicVarService) {}
 ngOnInit() {
  this.addminiMap();
 }

 addminiMap() {
  // ---- create new Map ----
  this.publicVar.miniMap = new Map({
   view: new View({
    projection: this.mapservice.project,
    center: [ this.mapservice.centerX, this.mapservice.centerY ],
    zoom: this.mapservice.zoom,
   }),
   layers: [ this.publicVar.SatelliteLayer ],
   interactions: [],
   controls: [],
   target: 'mini-map',
  });

  // ---- get base mp extent and set in minimap ----
  this.mapservice.map.on('moveend', (evt: Event) => {
   this.publicVar.miniMap.getView().fit(this.mapservice.map.getView().calculateExtent(this.mapservice.map.getSize()));
  });
 }

 goSatelliteToMap() {
  this.publicVar.isMiniMapSatellite = this.publicVar.isMap = true;
  // ----mini map----
  // hame laye haye add shode b mini map remove mikinim chon dagig moshakhas nist che layei add az in ravesh estefadeh mikonim
  this.publicVar.removeAllLayers(this.publicVar.miniMap);
  this.publicVar.miniMap.addLayer(this.publicVar.SatelliteLayer);
  // ---- base map----
  this.publicVar.removeAllLayers(this.mapservice.map);
  this.publicVar.wichLayerAdd(
   this.mapservice.map,
   this.publicVar.styleMode,
   this.publicVar.isPersian,
   this.publicVar.isPoiON,
   this.publicVar.isTerrainON,
   this.publicVar.isOddEvenON,
   this.publicVar.isTrafficAreaON,
   this.publicVar.isTrafficON,
  );
 }
 goMapToSatellite() {
  console.log('maptostelite');
  this.publicVar.isMiniMapSatellite = this.publicVar.isMap = false;
  //  hamaye laya ha ra az map hazf mikonin
  this.publicVar.removeAllLayers(this.mapservice.map);
  this.mapservice.map.addLayer(this.publicVar.SatelliteLayer);
  this.mapservice.map.addLayer(
   this.publicVar.createWMTSLayer(
    this.publicVar.WMTSSatelliteOverlayLayerName,
    this.publicVar.WMTSSatelliteOverlayLayerName,
    3,
    19,
    12,
    this.publicVar.isPersian ? 'Gooya2018Q3_V2_New:GOOGLE_LABEL_FA' : 'Gooya2018Q3_V2_New:GOOGLE_LABEL_EN',
   ),
  );

  if (this.publicVar.isTrafficAreaON) {
   this.mapservice.map.addLayer(
    this.publicVar.createWMTSLayer(
      this.publicVar.layerStatus.trafficArea.layerName,
      this.publicVar.layerStatus.trafficArea.olName,
      this.publicVar.layerStatus.trafficArea.zIndex,
      this.publicVar.layerStatus.trafficArea.maxZoom,
      this.publicVar.layerStatus.trafficArea.minZoom,
     ),
   );
  }
  if (this.publicVar.isOddEvenON) {
   this.mapservice.map.addLayer(
    this.publicVar.createWMTSLayer(
      this.publicVar.layerStatus.oddeven.layerName,
      this.publicVar.layerStatus.oddeven.olName,
      this.publicVar.layerStatus.oddeven.zIndex,
      this.publicVar.layerStatus.oddeven.maxZoom,
      this.publicVar.layerStatus.oddeven.minZoom,
     )
   );
  }
  // ----mini map----
  this.publicVar.miniMap.removeLayer(this.publicVar.SatelliteLayer);
  this.publicVar.wichLayerAdd(
   this.publicVar.miniMap,
   this.publicVar.styleMode,
   this.publicVar.isPersian,
   this.publicVar.isPoiON,
   false,
   false,
   false,
   false,
  );
 }

 changeMap() {
  this.publicVar.isOpenPopupAttribute = false;
  this.publicVar.isMiniMapSatellite ? this.goMapToSatellite() : this.goSatelliteToMap();
 }
}
